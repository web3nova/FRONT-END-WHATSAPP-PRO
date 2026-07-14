export const dashboardTour = {
  id: 'dashboard',
  chapters: [
    {
      title: 'Getting Started',
      steps: [
        { route: '/dashboard', element: '[data-tour="overview-metrics"]',
          popover: { title: 'Your dashboard', description: 'A live snapshot of orders, revenue, and activity across your store.' } },
        { route: '/dashboard/products', element: '[data-tour="products-add"]',
          popover: { title: 'Add your first product', description: 'Nothing can be sold until you add products. Tap here to create one.' } },
        { route: '/dashboard/products', element: '[data-tour="products-list"]',
          popover: { title: 'Your catalogue', description: 'Every product you add appears here, ready to edit or feature.' } },
      ],
    },
    {
      title: 'Get Paid & Reach Customers',
      steps: [
        { route: '/dashboard/payments', element: '[data-tour="payments-providers"]',
          popover: { title: 'Connect a payment method', description: 'Turn on Paystack, Monnify, or bank transfer so customers can actually pay you at checkout.' } },
        { route: '/dashboard/whatsapp', element: '[data-tour="whatsapp-connect"]',
          popover: { title: 'Connect WhatsApp', description: 'Link your WhatsApp Business number — this powers your AI sales agent and order updates.' } },
      ],
    },
    {
      title: 'Selling',
      steps: [
        { route: '/dashboard/orders', element: '[data-tour="orders-row-status"]',
          popover: { title: 'Manage orders', description: 'Move each order through Confirmed → Shipped → Delivered here. Customers get a WhatsApp update at every step.' } },
        { route: '/dashboard/orders', element: '[data-tour="orders-list"]',
          popover: { title: 'All your orders', description: 'Filter, search, and open any order to see items, payment, and delivery details.' } },
        { route: '/dashboard/coupons', element: '[data-tour="coupons-root"]',
          popover: { title: 'Discount codes', description: 'Create percentage or fixed-amount coupons to run promotions.' } },
        { route: '/dashboard/customers', element: '[data-tour="customers-root"]',
          popover: { title: 'Customers', description: 'Everyone who has ordered or signed up, with their history in one place.' } },
        { route: '/dashboard/reviews', element: '[data-tour="reviews-root"]',
          popover: { title: 'Reviews', description: 'Approve or reject customer reviews before they show on your storefront.' } },
      ],
    },
    {
      title: 'Setup',
      steps: [
        { route: '/dashboard/settings', element: '[data-tour="settings-team"]',
          popover: { title: 'Your team', description: 'Invite staff and control what each teammate can access.' } },
        { route: '/dashboard/settings', element: '[data-tour="settings-domain"]',
          popover: { title: 'Custom domain', description: 'Point your own domain (e.g. mystore.com) at your storefront from here.' } },
        { route: '/dashboard/website', onEnter: () => window.dispatchEvent(new CustomEvent('tour:open-sidebar')), element: '[data-tour="nav-website"]',
          popover: { title: 'Build your website', description: 'Design your storefront in the Website Builder — start its own guided tour from there anytime.' } },
      ],
    },
  ],
}
