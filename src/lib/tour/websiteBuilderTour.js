const setWizardStep = (n) => () => window.dispatchEvent(new CustomEvent('tour:set-builder-step', { detail: n }))
const setEditorTab = (t) => () => window.dispatchEvent(new CustomEvent('tour:set-editor-tab', { detail: t }))

// This tour is hands-on: it walks a merchant through the minimum needed to get a
// real, live storefront — name the store, pick how they get paid, add one product,
// preview, and publish. Each step highlights the actual control to use, and the
// copy tells them to fill it in before moving on.
export const websiteBuilderTour = {
  id: 'websiteBuilder',
  chapters: [
    {
      title: 'Name your store',
      steps: [
        { route: '/dashboard/builder', onEnter: setWizardStep(0), element: '[data-tour="builder-brand-name"]',
          advanceOn: { type: 'input' },
          popover: { title: 'Start with your store name', description: 'Type your business name here — it\'s the first thing customers see. Add a logo just below if you have one.' } },
        { route: '/dashboard/builder', onEnter: setWizardStep(0), element: '[data-tour="builder-payments"]',
          popover: { title: 'Choose how you get paid', description: 'Turn on at least one payment method (Paystack, bank transfer, or cash on delivery) so customers can actually check out.' } },
      ],
    },
    {
      title: 'Add your first product',
      steps: [
        { route: '/dashboard/builder', onEnter: setWizardStep(1), element: '[data-tour="builder-product-name"]',
          advanceOn: { type: 'input' },
          popover: { title: 'Add something to sell', description: 'Every store needs at least one product. Give your first item a clear name here.' } },
        { route: '/dashboard/builder', onEnter: setWizardStep(1), element: '[data-tour="builder-product-price"]',
          advanceOn: { type: 'input' },
          popover: { title: 'Set a price', description: 'Enter what it costs. Add a photo and description too — products with images sell far better.' } },
        { route: '/dashboard/builder', onEnter: setWizardStep(1), element: '[data-tour="builder-save-product"]',
          advanceOn: { type: 'click' },
          popover: { title: 'Save it to your catalogue', description: 'Click Save Product to add it. Repeat for as many products as you like — you need at least one to publish.' } },
        { route: '/dashboard/builder', onEnter: setWizardStep(1), element: '[data-tour="builder-delivery"]',
          popover: { title: 'How do orders reach customers?', description: 'Pick your delivery options and set a fee per option (leave blank for free). This is what customers choose at checkout.' } },
      ],
    },
    {
      title: 'Preview & publish',
      steps: [
        { route: '/dashboard/builder', onEnter: setWizardStep(2), element: '[data-tour="builder-preview"]',
          popover: { title: 'This is your live site', description: 'Here\'s your storefront exactly as customers will see it. Scroll through and check it looks right.' } },
        { route: '/dashboard/builder', onEnter: setWizardStep(2), element: '[data-tour="builder-publish"]',
          advanceOn: { type: 'click' },
          popover: { title: 'Go live 🎉', description: 'Happy with it? Click Publish Website and your store is live on the internet — you\'ve built your site!' } },
      ],
    },
    {
      title: 'Keep editing anytime',
      steps: [
        { route: '/dashboard/website', onEnter: setEditorTab('sections'), element: '[data-tour="editor-tabs"]',
          popover: { title: 'Fine-tune after launch', description: 'Come back here anytime to reorder sections, manage pages, and set your navigation — no need to rebuild.' } },
      ],
    },
    {
      title: 'Design & SEO',
      steps: [
        { route: '/dashboard/website', onEnter: setEditorTab('design'), element: '[data-tour="editor-design"]',
          popover: { title: 'Make it yours', description: 'Pick a starter template, tune colours and fonts, and set your SEO and social preview so your store looks great when shared.' } },
      ],
    },
  ],
}
