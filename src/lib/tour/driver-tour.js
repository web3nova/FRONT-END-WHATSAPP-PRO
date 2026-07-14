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

  const showStep = async () => {
    const step = steps[i];
    if (!step) { finish(); return; }
    if (step.route && step.route !== currentPath()) {
      navigate(step.route);
      await waitForElement(step.element);
    }
    if (step.onEnter) { step.onEnter(); await waitForElement(step.element); }
    // highlight() defaults popover.showButtons to [] (no next/prev/close at
    // all) unless a call explicitly sets it — unlike drive(), which shows
    // them by default. We use highlight() per-step (not drive()) because our
    // steps change route/tab between them, so this has to be set on every
    // call or the tour renders with no way to advance, go back, or skip.
    d.highlight({
      element: step.element,
      popover: {
        showButtons: ['next', 'previous', 'close'],
        showProgress: true,
        ...step.popover,
      },
    });
  };

  const advance = async (dir) => {
    const prev = steps[i];
    i += dir;
    if (dir > 0 && prev?.chapterEnd != null) onChapterComplete?.(prev.chapterEnd);
    if (i < 0) { i = 0; return showStep(); }
    if (i >= steps.length) { finish(); return; }
    await showStep();
  };

  const finish = () => { onChapterComplete?.(steps[steps.length - 1]?.chapterEnd); d?.destroy(); onExit?.(); };

  d = driver({
    showProgress: true,
    allowClose: true,
    overlayClickBehavior: 'nextStep',
    overlayColor: 'rgba(15,23,42,0.55)', // slate-900 @ 55% — matches app modal scrims
    popoverClass: 'biq-tour',            // scopes the branded theme (tour-theme.css)
    nextBtnText: 'Next',
    prevBtnText: 'Back',
    doneBtnText: 'Done',
    onNextClick: () => advance(1),
    onPrevClick: () => advance(-1),
    onCloseClick: () => { d.destroy(); onExit?.(); },
  });
  // NOTE: we drive stepping ourselves (highlight per step) rather than handing
  // driver.js a fixed steps array — because our steps change route/tab between
  // them, so the next element often isn't in the DOM at the instant driver would
  // auto-advance. Do NOT call d.drive(); only d.highlight(...) via showStep().
  showStep();
  return { destroy: () => d?.destroy() };
}
