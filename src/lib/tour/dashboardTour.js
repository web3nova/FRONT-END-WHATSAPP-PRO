// Copy in each step is written against what the anchored element ACTUALLY is on
// the page (verified against the page source), not what we wish it were:
// - overview-metrics    → the 5 stat cards (Customers / Orders This Month /
//                         Monthly Revenue / Website Visits / Conversations)
// - products-add        → the "Add Product" header button
// - products-list       → the search + category-filter toolbar (always rendered,
//                         even with zero products)
// - payments-providers  → the first provider card on Payment Settings
//                         (Bank Transfer (Manual); Paystack/Monnify/Blockradar/
//                         custom gateways follow below it)
// - whatsapp-connect    → the Meta Embedded Signup connect button (only exists
//                         while not yet connected; engine skips it otherwise)
// - orders-row-status   → the status pill on the first order row (only exists
//                         when there is at least one order — falls back to the
//                         orders table). Real statuses: Pending → Confirmed →
//                         Paid → Fulfilled (+ Cancelled), changed via the ⋯ menu.
// - settings-team/domain→ the tab BUTTONS in Settings (owner-only; engine skips
//                         for non-owners)
export const dashboardTour = {
  id: 'dashboard',
  chapters: [
    {
      title: 'Getting Started',
      steps: [
        { route: '/dashboard', element: '[data-tour="overview-metrics"]',
          popover: { title: 'Your store at a glance', description: 'Customers, orders this month, revenue, website visits, and WhatsApp conversations — these cards update live as your store runs.' } },
        { route: '/dashboard/products', element: '[data-tour="products-add"]',
          popover: { title: 'Add your first product', description: 'Nothing can be sold until you add products. Click Add Product to create one — name, price, photos, stock.' } },
        { route: '/dashboard/products', element: '[data-tour="products-list"]',
          popover: { title: 'Find products fast', description: 'As your catalogue grows, search by name, SKU, or brand, filter by category, and switch between grid and list views here.' } },
      ],
    },
    {
      title: 'Get Paid & Reach Customers',
      steps: [
        { route: '/dashboard/payments', element: '[data-tour="payments-providers"]',
          popover: { title: 'Choose how you get paid', description: 'Each card on this page is a payment method — bank transfer you confirm yourself, Paystack, Monnify, crypto, or your own gateway. Toggle at least one on and fill in its details.' } },
        { route: '/dashboard/whatsapp', element: '[data-tour="whatsapp-connect"]',
          popover: { title: 'Connect WhatsApp', description: 'Link your WhatsApp Business number — it powers your AI sales agent, customer chats, and automatic order updates.' } },
      ],
    },
    {
      title: 'Selling',
      steps: [
        { route: '/dashboard/orders', element: '[data-tour="orders-row-status"]', fallback: '[data-tour="orders-list"]',
          popover: { title: 'Track every order’s status', description: 'Use the ⋯ menu on an order to move it from Pending to Confirmed, Paid, and Fulfilled. Your customer gets a WhatsApp update each time it changes.' } },
        { route: '/dashboard/orders', element: '[data-tour="orders-list"]',
          popover: { title: 'All your orders', description: 'Every order lands in this table. Switch the tabs above it to see Pending, Confirmed, Paid, Fulfilled, or Cancelled ones, or search by customer.' } },
        { route: '/dashboard/coupons', element: '[data-tour="coupons-root"]',
          popover: { title: 'Discount codes', description: 'Create percentage or fixed-amount coupons for your storefront, with optional expiry dates, usage limits, and minimum spend.' } },
        { route: '/dashboard/customers', element: '[data-tour="customers-root"]',
          popover: { title: 'Customers', description: 'Everyone who has ordered or signed up on your storefront, with their contact details and history in one place.' } },
        { route: '/dashboard/reviews', element: '[data-tour="reviews-root"]',
          popover: { title: 'Reviews', description: 'Customer reviews wait here for you to approve or reject — only approved ones appear on your storefront.' } },
      ],
    },
    {
      title: 'Setup',
      steps: [
        { route: '/dashboard/settings', element: '[data-tour="settings-team"]',
          popover: { title: 'Your team', description: 'Open the Team tab to invite staff and control what each person can access.' } },
        { route: '/dashboard/settings', element: '[data-tour="settings-domain"]',
          popover: { title: 'Custom domain', description: 'Open the Custom Domain tab to point your own domain (e.g. mystore.com) at your storefront.' } },
        { route: '/dashboard/website', onEnter: () => window.dispatchEvent(new CustomEvent('tour:open-sidebar')), element: '[data-tour="nav-website"]',
          popover: { title: 'Build your website', description: 'Design your storefront in the Website Builder — it has its own step-by-step tour that walks you through publishing your first site.' } },
      ],
    },
  ],
}
