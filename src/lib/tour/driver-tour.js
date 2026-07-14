import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tour-theme.css';

// Poll for an element to appear (post-navigation renders aren't instant).
export function waitForElement(selector, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const found = document.querySelector(selector);
    if (found) return resolve(found);
    const started = Date.now();
    const iv = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) { clearInterval(iv); resolve(el); }
      else if (Date.now() - started > timeoutMs) { clearInterval(iv); resolve(null); }
    }, 120);
  });
}

// steps: flat array (already flattened from chapters), each optionally carrying
// route/onEnter. onChapterComplete(chapterIndex) fires when the last step of a
// chapter is passed. onExit() fires on finish/close.
export function runTour({ steps, startIndex = 0, navigate, currentPath, onChapterComplete, onExit }) {
  let i = startIndex;
  let d = null;
  let transitioning = false; // guards against a blur + Next firing two advances
  let lastDir = 1;           // direction of travel, so skipped steps continue the same way
  let stepCleanup = null;    // tears down the current step's action listeners

  const clearStepListeners = () => { if (stepCleanup) { stepCleanup(); stepCleanup = null; } };

  // Wire the "advance when the merchant actually does the thing" behaviour. A
  // step may carry `advanceOn`:
  //   { type: 'click', target? }                → advance when the control is clicked
  //   { type: 'input', target?, minLength = 1 } → advance only when the field has
  //                                               content AND the user presses Enter
  // `target` defaults to the step's highlighted element. Crucially we do NOT
  // advance on blur: leaving a field doesn't mean the person is done (they might
  // be tweaking the logo, rethinking the name, or just glancing away), so
  // guessing would yank the tour forward mid-thought. Text steps therefore only
  // auto-advance on an explicit Enter; otherwise the Next button drives them.
  const setupAdvanceOn = (step) => {
    const spec = step.advanceOn;
    if (!spec) return;
    const el = document.querySelector(spec.target || step.element);
    if (!el) return;

    if (spec.type === 'click') {
      const handler = () => advance(1);
      el.addEventListener('click', handler);
      stepCleanup = () => el.removeEventListener('click', handler);
      return;
    }

    if (spec.type === 'input') {
      const minLength = spec.minLength ?? 1;
      const onKey = (e) => {
        if (e.key === 'Enter' && (el.value || '').trim().length >= minLength) advance(1);
      };
      el.addEventListener('keydown', onKey);
      stepCleanup = () => el.removeEventListener('keydown', onKey);
    }
  };

  // Resolve the DOM node a step should highlight. Handles two failure modes:
  // 1. The onEnter bridge event fired before the destination page mounted its
  //    listener (cross-surface navigation) — re-fire it once after the first
  //    wait, by which time the page has mounted.
  // 2. The element legitimately doesn't exist in this account's state (e.g. the
  //    first-order status pill on a store with no orders yet, the WhatsApp
  //    connect button once already connected, owner-only Settings tabs for a
  //    non-owner) — fall back to `step.fallback` if given, else return null so
  //    the caller SKIPS the step instead of showing a detached popover.
  const resolveTarget = async (step) => {
    let el = await waitForElement(step.element);
    if (!el && step.onEnter) {
      step.onEnter();
      el = await waitForElement(step.element);
    }
    if (!el && step.fallback) el = document.querySelector(step.fallback);
    return el;
  };

  // driver.js has no way to atomically swap one step's content for the next —
  // highlight() for the new step only fires once resolveTarget() resolves
  // (route navigation + polling for the new element to mount), and the
  // PREVIOUS step's popover stays on screen for that entire gap. On a
  // route-changing step that's visibly wrong: the page underneath has
  // already navigated to the new route while the old step's title/
  // description is still sitting in the popover, so for a moment you see
  // e.g. orders copy overlaid on the coupons page. Hide the tour chrome for
  // the duration of the gap instead — nothing visible beats visibly wrong.
  const hideCurrentPopover = () => {
    document.querySelector('.driver-overlay')?.style.setProperty('opacity', '0');
    const p = document.querySelector('.driver-popover');
    if (p) p.style.visibility = 'hidden';
  };
  const revealPopover = () => {
    document.querySelector('.driver-overlay')?.style.removeProperty('opacity');
    const p = document.querySelector('.driver-popover');
    if (p) p.style.visibility = '';
  };

  const showStep = async () => {
    clearStepListeners();
    // Loop so that steps whose target can't render for this account are skipped
    // in the direction of travel — never highlight "nothing".
    let guard = steps.length + 1;
    while (guard-- > 0) {
      const step = steps[i];
      if (!step) { finish(); return; }
      hideCurrentPopover();
      if (step.route && step.route !== currentPath()) navigate(step.route);
      if (step.onEnter) step.onEnter();
      const target = await resolveTarget(step);
      if (!target) {
        // Skip: keep chapter bookkeeping consistent so resume doesn't loop
        // forever into a chapter that can never display for this account.
        if (lastDir > 0 && step.chapterEnd != null) onChapterComplete?.(step.chapterEnd);
        i += lastDir;
        if (i < 0) { i = 0; lastDir = 1; }
        if (i >= steps.length) { finish(); return; }
        continue;
      }
      const isFirst = i === 0;
      const isLast = i === steps.length - 1;
      // highlight() defaults popover.showButtons to [] (no next/prev/close at all)
      // unless each call sets it — unlike drive(), which shows them by default. We
      // use highlight() per-step (not drive()) because our steps change route/tab
      // between them, so the footer has to be set on every call or the tour renders
      // with no way to advance, go back, or skip. Back is hidden on the first step,
      // Next becomes Done on the last, and we supply an accurate "N of total".
      d.highlight({
        element: target,
        popover: {
          ...step.popover,
          showButtons: isFirst ? ['next', 'close'] : ['next', 'previous', 'close'],
          nextBtnText: isLast ? 'Done' : 'Next',
          prevBtnText: 'Back',
          progressText: `${i + 1} of ${steps.length}`,
        },
      });
      // Double rAF: give driver.js a paint cycle to finish positioning the
      // overlay/popover against the new element before revealing it, so we
      // don't flash the old (hidden) position for a frame.
      requestAnimationFrame(() => requestAnimationFrame(revealPopover));
      setupAdvanceOn(step);
      return;
    }
    finish();
  };

  const advance = async (dir) => {
    if (transitioning) return; // an auto-advance already fired for this step
    transitioning = true;
    lastDir = dir;
    clearStepListeners();
    const prev = steps[i];
    i += dir;
    if (dir > 0 && prev?.chapterEnd != null) onChapterComplete?.(prev.chapterEnd);
    if (i < 0) i = 0;
    if (i >= steps.length) { finish(); transitioning = false; return; }
    await showStep();
    transitioning = false;
  };

  const finish = () => { clearStepListeners(); onChapterComplete?.(steps[steps.length - 1]?.chapterEnd); d?.destroy(); onExit?.(); };

  d = driver({
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    allowClose: true,
    // Advance ONLY via the Next button — do not let a click on the dimmed
    // backdrop step the tour forward (that made it feel like it auto-plays).
    // A backdrop click just closes/skips the tour, like a normal modal.
    overlayClickBehavior: 'close',
    overlayColor: 'rgba(15,23,42,0.55)', // slate-900 @ 55% — matches app modal scrims
    popoverClass: 'biq-tour',            // scopes the branded theme (tour-theme.css)
    nextBtnText: 'Next',
    prevBtnText: 'Back',
    doneBtnText: 'Done',
    onNextClick: () => advance(1),
    onPrevClick: () => advance(-1),
    onCloseClick: () => { clearStepListeners(); d.destroy(); onExit?.(); },
  });
  // NOTE: we drive stepping ourselves (highlight per step) rather than handing
  // driver.js a fixed steps array — because our steps change route/tab between
  // them, so the next element often isn't in the DOM at the instant driver would
  // auto-advance. Do NOT call d.drive(); only d.highlight(...) via showStep().
  showStep();
  return { destroy: () => { clearStepListeners(); d?.destroy(); } };
}
