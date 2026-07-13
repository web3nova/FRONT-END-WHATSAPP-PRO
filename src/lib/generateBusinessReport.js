import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const PRIMARY = [65, 102, 245] // #4166F5 as RGB for jsPDF

function formatAmount(minor = 0) {
  return `NGN ${(minor / 100).toLocaleString()}`
}

// Builds and downloads a PDF business summary — uses the exact same
// stats/dailyRevenue/topProducts/recentOrders/customerSources the Overview
// dashboard already computed, so the report always matches what's on screen.
export function generateBusinessReport({ businessName, stats, dailyRevenue, topProducts, recentOrders, customerSources }) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  // Header
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('BizIQ Business Report', 14, 18)

  doc.setTextColor(30, 41, 59)
  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  doc.text(`${businessName || 'Your business'} — generated ${today}`, 14, 38)
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('Summary period: last 30 days', 14, 44)

  // Stats grid
  let y = 56
  doc.setFontSize(12)
  doc.setTextColor(30, 41, 59)
  doc.setFont(undefined, 'bold')
  doc.text('Overview', 14, y)
  y += 6

  const statRows = [
    ['Total Customers', (stats?.customers ?? 0).toLocaleString()],
    ['Orders This Month', String(stats?.orders ?? 0)],
    ['Monthly Revenue', formatAmount(stats?.revenue ?? 0)],
    ['Website Visits (30d)', (stats?.visits ?? 0).toLocaleString()],
    ['Total Conversations', (stats?.conversations ?? 0).toLocaleString()],
  ]
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: statRows,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: PRIMARY, textColor: 255 },
    margin: { left: 14, right: 14 },
  })
  y = doc.lastAutoTable.finalY + 12

  // Customer sources
  if (customerSources) {
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Customer Sources', 14, y)
    y += 6
    const sourceRows = Object.entries(customerSources).map(([k, v]) => [
      k.charAt(0).toUpperCase() + k.slice(1),
      String(v),
    ])
    autoTable(doc, {
      startY: y,
      head: [['Source', 'Customers']],
      body: sourceRows,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 12
  }

  // Top products
  if (topProducts?.length) {
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Top Products', 14, y)
    y += 6
    autoTable(doc, {
      startY: y,
      head: [['Product', 'Units Sold', 'Revenue']],
      body: topProducts.map(p => [p.name, String(p.sales ?? 0), formatAmount(p.revenue ?? 0)]),
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      margin: { left: 14, right: 14 },
    })
    y = doc.lastAutoTable.finalY + 12
  }

  // Recent orders
  if (recentOrders?.length) {
    if (y > 240) { doc.addPage(); y = 20 }
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Recent Orders', 14, y)
    y += 6
    autoTable(doc, {
      startY: y,
      head: [['Customer', 'Product', 'Amount', 'Status', 'Date']],
      body: recentOrders.map(o => [
        o.customer?.name || 'Unknown',
        (o.items?.[0]?.name) || '—',
        formatAmount(o.totalMinor),
        o.status,
        new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      ]),
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: PRIMARY, textColor: 255 },
      margin: { left: 14, right: 14 },
    })
  }

  const filename = `biziq-report-${(businessName || 'business').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
