import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BusinessPlan, Product, Supplier, Sale, Purchase, Expense, FinancialSummary, CashFlowForecastReport } from '../types';

interface HeaderOptions {
  doc: jsPDF;
  businessName: string;
  reportTitle: string;
  currency?: string;
  period?: string;
}

function addStandardHeader({ doc, businessName, reportTitle, currency = 'INR', period }: HeaderOptions) {
  // Brand Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('Brief2Build AI', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('From Business Idea to Business Growth', 14, 18);

  const now = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${now}`, 196, 12, { align: 'right' });
  doc.text(`Currency: ${currency}`, 196, 18, { align: 'right' });

  // Document Title & Business Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(businessName, 14, 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(reportTitle, 14, 44);

  if (period) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Reporting Period: ${period}`, 14, 50);
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(14, period ? 54 : 48, 196, period ? 54 : 48);
}

function addFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.line(14, 282, 196, 282);
    doc.text('Brief2Build AI • Confidential Business Record • https://brief2build.ai', 14, 288);
    doc.text(`Page ${i} of ${pageCount}`, 196, 288, { align: 'right' });
  }
}

export function exportBusinessPlanPDF(plan: BusinessPlan, businessName: string, currency: string = 'INR') {
  const doc = new jsPDF();
  addStandardHeader({
    doc,
    businessName,
    reportTitle: 'Comprehensive Strategic Business Plan & Feasibility Report',
    currency,
  });

  let currentY = 56;

  // Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Executive Summary & Concept Description', 14, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(plan.summary, 182);
  doc.text(summaryLines, 14, currentY);
  currentY += summaryLines.length * 4.5 + 4;

  // Target Market
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('2. Target Customer Analysis & Market Considerations', 14, currentY);
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const marketLines = doc.splitTextToSize(plan.targetMarket, 182);
  doc.text(marketLines, 14, currentY);
  currentY += marketLines.length * 4.5 + 6;

  // Equipment Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. Required Equipment & Operational Assets', 14, currentY);
  currentY += 4;

  const equipmentRows = (plan.requiredEquipment || []).map((e) => [
    e.name,
    e.purpose,
    `${currency} ${e.estimatedCost.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Asset / Equipment Name', 'Operational Purpose', 'Estimated Cost']],
    body: equipmentRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Startup Expenses Table
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('4. Estimated Startup & Capital Expenses', 14, currentY);
  currentY += 4;

  const startupRows = (plan.startupExpenses || []).map((s) => [
    s.item,
    s.category,
    `${currency} ${s.cost.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Expense Item', 'Category', 'Projected Cost']],
    body: startupRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Monthly Operating Expenses Table
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('5. Projected Monthly Operating Expenses (Overhead)', 14, currentY);
  currentY += 4;

  const monthlyRows = (plan.monthlyOperatingExpenses || []).map((m) => [
    m.item,
    m.category,
    `${currency} ${m.cost.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Operating Cost Item', 'Category', 'Monthly Allocation']],
    body: monthlyRows,
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Sales & Break-Even Estimates
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('6. Sales Projections & Break-Even Analysis (Estimates)', 14, currentY);
  currentY += 6;

  const est = plan.salesAndBreakEvenEstimates;
  if (est) {
    const breakEvenData = [
      ['Estimated Monthly Unit Volume', `${est.estimatedMonthlySalesUnits} units`],
      ['Estimated Average Selling Price', `${currency} ${est.averageUnitPrice}`],
      ['Estimated Monthly Revenue', `${currency} ${est.estimatedMonthlyRevenue?.toLocaleString()}`],
      ['Estimated Cost of Goods Sold (COGS)', `${currency} ${est.estimatedCOGS?.toLocaleString()}`],
      ['Monthly Break-Even Sales Units', `${est.breakEvenMonthlyUnits} units`],
      ['Monthly Break-Even Revenue', `${currency} ${est.breakEvenMonthlyRevenue?.toLocaleString()}`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Projected Estimate']],
      body: breakEvenData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Assumptions: ${est.assumptions || 'Based on market category baseline'}`, 14, currentY);
    currentY += 5;
    doc.text(`Disclaimer: ${est.disclaimer || 'All figures are modeled projections and not financial guarantees.'}`, 14, currentY);
  }

  addFooter(doc);
  doc.save(`${businessName.replace(/\s+/g, '_')}_Business_Plan.pdf`);
}

export function exportStartupBudgetPDF(plan: BusinessPlan, businessName: string, currency: string = 'INR') {
  const doc = new jsPDF();
  addStandardHeader({
    doc,
    businessName,
    reportTitle: 'Startup Budget & Capital Allocation Plan',
    currency,
  });

  let currentY = 56;

  // Budget Allocation Summary Table
  const allocRows = (plan.budgetAllocation || []).map((b) => [
    b.category,
    `${b.percentage}%`,
    `${currency} ${b.amount.toLocaleString()}`,
  ]);

  const totalAlloc = (plan.budgetAllocation || []).reduce((acc, b) => acc + b.amount, 0);
  allocRows.push(['TOTAL STARTUP BUDGET', '100%', `${currency} ${totalAlloc.toLocaleString()}`]);

  autoTable(doc, {
    startY: currentY,
    head: [['Budget Category', 'Allocation (%)', 'Allocated Amount']],
    body: allocRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    footStyles: { fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Line item startup expenses
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Itemized Initial Capital Expenditure', 14, currentY);
  currentY += 4;

  const itemizedRows = (plan.startupExpenses || []).map((item) => [
    item.item,
    item.category,
    `${currency} ${item.cost.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Expense Classification', 'Estimated Capital Outlay']],
    body: itemizedRows,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`${businessName.replace(/\s+/g, '_')}_Startup_Budget.pdf`);
}

export function exportSupplierComparisonPDF(suppliers: Supplier[], businessName: string, currency: string = 'INR') {
  const doc = new jsPDF('landscape');
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('Brief2Build AI', 14, 12);
  doc.setFontSize(8);
  doc.text('Supplier Directory & Sourcing Comparison Matrix', 14, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(businessName, 14, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Recorded Suppliers: ${suppliers.length} • Generated on ${new Date().toLocaleDateString()}`, 14, 43);

  const rows = suppliers.map((s) => [
    s.name,
    s.verified ? 'Verified Trade' : 'Unverified Listing',
    s.productCategories.join(', '),
    s.contactPerson,
    s.phone,
    s.minOrderQuantity || 'N/A',
    s.priceNotes || 'Custom Quote',
    s.paymentTerms || 'Standard',
  ]);

  autoTable(doc, {
    startY: 48,
    head: [['Supplier / Wholesaler', 'Verification Status', 'Categories', 'Contact', 'Phone', 'MOQ', 'Price Notes', 'Terms']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 28 },
      2: { cellWidth: 45 },
      3: { cellWidth: 25 },
      4: { cellWidth: 28 },
      5: { cellWidth: 28 },
      6: { cellWidth: 45 },
      7: { cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`${businessName.replace(/\s+/g, '_')}_Supplier_Comparison.pdf`);
}

export function exportInventoryReportPDF(products: Product[], businessName: string, currency: string = 'INR') {
  const doc = new jsPDF();
  addStandardHeader({
    doc,
    businessName,
    reportTitle: 'Inventory Valuation & Current Stock Audit Report',
    currency,
  });

  const totalValue = products.reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.minThreshold).length;

  let currentY = 56;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Total SKU Count: ${products.length}  |  Total Inventory Valuation: ${currency} ${totalValue.toLocaleString()}  |  Low Stock Alerts: ${lowStockCount}`, 14, currentY);
  currentY += 6;

  const rows = products.map((p) => [
    p.sku,
    p.name,
    p.category,
    `${p.currentStock} ${p.unit}`,
    `${p.minThreshold} ${p.unit}`,
    `${currency} ${p.purchasePrice}`,
    `${currency} ${p.sellingPrice}`,
    `${currency} ${(p.currentStock * p.purchasePrice).toLocaleString()}`,
    p.status.toUpperCase().replace('_', ' '),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['SKU', 'Product Name', 'Category', 'Stock', 'Min', 'Cost', 'Price', 'Held Value', 'Status']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`${businessName.replace(/\s+/g, '_')}_Inventory_Report.pdf`);
}

export function exportSalesReportPDF(sales: Sale[], businessName: string, period: string, currency: string = 'INR') {
  const doc = new jsPDF();
  addStandardHeader({
    doc,
    businessName,
    reportTitle: 'Sales Transactions & Revenue Register',
    period,
    currency,
  });

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalCogs = sales.reduce((acc, s) => acc + s.cogsTotal, 0);
  const totalMargin = totalRevenue - totalCogs;

  let currentY = 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Total Transactions: ${sales.length}  |  Revenue: ${currency} ${totalRevenue.toLocaleString()}  |  COGS: ${currency} ${totalCogs.toLocaleString()}  |  Gross Profit: ${currency} ${totalMargin.toLocaleString()}`,
    14,
    currentY
  );
  currentY += 6;

  const rows = sales.map((s) => [
    s.invoiceNumber,
    new Date(s.date).toLocaleDateString(),
    s.customerName || 'Walk-in',
    s.items.map((i) => `${i.productName} (x${i.quantity})`).join(', '),
    s.paymentMethod.toUpperCase(),
    `${currency} ${s.totalAmount.toLocaleString()}`,
    `${currency} ${s.cogsTotal.toLocaleString()}`,
    s.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Invoice #', 'Date', 'Customer', 'Items Sold', 'Payment', 'Total', 'COGS', 'Status']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`${businessName.replace(/\s+/g, '_')}_Sales_Report.pdf`);
}

export function exportPurchasesReportPDF(purchases: Purchase[], businessName: string, currency: string = 'INR') {
  const doc = new jsPDF();
  addStandardHeader({
    doc,
    businessName,
    reportTitle: 'Procurement & Purchase Orders Log',
    currency,
  });

  const totalSpend = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

  let currentY = 56;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total Purchase Orders: ${purchases.length}  |  Total Procurement Spend: ${currency} ${totalSpend.toLocaleString()}`, 14, currentY);
  currentY += 6;

  const rows = purchases.map((p) => [
    p.poNumber,
    new Date(p.date).toLocaleDateString(),
    p.supplierName,
    p.items.map((i) => `${i.productName} (x${i.quantity})`).join(', '),
    `${currency} ${p.totalAmount.toLocaleString()}`,
    p.paymentStatus.toUpperCase(),
    p.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['PO #', 'Date', 'Supplier', 'Items Received', 'Total Cost', 'Payment', 'Status']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`${businessName.replace(/\s+/g, '_')}_Purchases_Report.pdf`);
}

export function exportIncomeExpenseReportPDF(expenses: Expense[], financials: FinancialSummary, businessName: string, period: string, currency: string = 'INR') {
  const doc = new jsPDF();
  addStandardHeader({
    doc,
    businessName,
    reportTitle: 'Operating Income & Expense Statement',
    period,
    currency,
  });

  let currentY = 60;

  // Breakdown by category
  const catRows = Object.entries(financials.expenseByCategory).map(([cat, amt]) => [
    cat.toUpperCase().replace('_', ' '),
    `${currency} ${amt.toLocaleString()}`,
    `${((amt / (financials.totalOperatingExpenses || 1)) * 100).toFixed(1)}%`,
  ]);

  catRows.push(['TOTAL OPERATING EXPENSES', `${currency} ${financials.totalOperatingExpenses.toLocaleString()}`, '100%']);

  autoTable(doc, {
    startY: currentY,
    head: [['Expense Category', 'Total Amount', 'Share of Total']],
    body: catRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Individual expense line items
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Recent Operational Expense Entries', 14, currentY);
  currentY += 4;

  const itemRows = expenses.map((e) => [
    new Date(e.date).toLocaleDateString(),
    e.category.toUpperCase().replace('_', ' '),
    e.description,
    e.paymentMethod,
    `${currency} ${e.amount.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Category', 'Description', 'Method', 'Amount']],
    body: itemRows,
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`${businessName.replace(/\s+/g, '_')}_Income_Expense_Report.pdf`);
}

export function exportProfitLossReportPDF(financials: FinancialSummary, businessName: string, period: string, currency: string = 'INR') {
  const doc = new jsPDF();
  addStandardHeader({
    doc,
    businessName,
    reportTitle: 'Formal Profit and Loss Statement (P&L)',
    period,
    currency,
  });

  let currentY = 60;

  const statementRows = [
    ['Gross Revenue from Sales', `${currency} ${financials.totalRevenue.toLocaleString()}`],
    ['Less: Cost of Goods Sold (COGS)', `(${currency} ${financials.totalCOGS.toLocaleString()})`],
    ['GROSS PROFIT', `${currency} ${financials.grossProfit.toLocaleString()}`],
    ['Gross Margin %', `${financials.grossMarginPercent.toFixed(1)}%`],
    ['', ''],
    ['Operating Overhead & Administrative Expenses:', ''],
    ...Object.entries(financials.expenseByCategory).map(([cat, amt]) => [
      `  • ${cat.toUpperCase().replace('_', ' ')}`,
      `${currency} ${amt.toLocaleString()}`,
    ]),
    ['TOTAL OPERATING EXPENSES', `(${currency} ${financials.totalOperatingExpenses.toLocaleString()})`],
    ['', ''],
    ['NET PROFIT / (LOSS) BEFORE TAX', `${currency} ${financials.netProfit.toLocaleString()}`],
    ['Net Margin %', `${financials.netMarginPercent.toFixed(1)}%`],
    ['', ''],
    ['Memorandum Asset Balance: Held Inventory Value', `${currency} ${financials.totalInventoryValue.toLocaleString()}`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Financial Line Item', 'Amount']],
    body: statementRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 62, halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Accounting Note: COGS reflects the direct cost of inventory units sold. Held inventory purchases are recorded as asset changes and not double-counted in operating expenses.', 14, currentY);

  addFooter(doc);
  doc.save(`${businessName.replace(/\s+/g, '_')}_Profit_and_Loss.pdf`);
}

export function exportCashFlowForecastPDF(forecast: CashFlowForecastReport, businessName: string, currency: string = 'INR') {
  const doc = new jsPDF();
  addStandardHeader({
    doc,
    businessName,
    reportTitle: '3-Month Rolling Cash Flow Forecast & Liquidity Prediction',
    period: 'Next 90 Days Forward Projection',
    currency,
  });

  let currentY = 60;

  // Key KPI Summary
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  const runwayText = forecast.metrics.projectedRunwayMonths === 99
    ? 'Positive Operating Cash Flow'
    : `${forecast.metrics.projectedRunwayMonths} Months`;
  doc.text(
    `Current Opening Cash: ${currency} ${forecast.currentCashBalance.toLocaleString()}  |  Lowest Projected Balance: ${currency} ${forecast.metrics.lowestProjectedBalance.toLocaleString()}  |  Projected Runway: ${runwayText}`,
    14,
    currentY
  );
  currentY += 6;

  // Table 1: Historical Cash Movements
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Historical Monthly Cash Trajectory (Preceding Months)', 14, currentY);
  currentY += 4;

  const histRows = (forecast.historicalMonths || []).map((h) => [
    h.month,
    `${currency} ${h.revenue.toLocaleString()}`,
    `${currency} ${h.cogs.toLocaleString()}`,
    `${currency} ${h.expenses.toLocaleString()}`,
    `${currency} ${(h.netCash).toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Month', 'Inflows (Sales)', 'COGS (Inventory)', 'Operating Overhead', 'Net Cash Generated']],
    body: histRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Table 2: 3-Month Forward Forecast (Expected Baseline)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. 3-Month Forward Expected Projections (Baseline Scenario)', 14, currentY);
  currentY += 4;

  const forecastRows = (forecast.forecastMonths || []).map((f) => [
    `Month +${f.monthIndex} (${f.monthLabel})`,
    `${currency} ${f.openingCashBalance.toLocaleString()}`,
    `${currency} ${f.projectedRevenue.toLocaleString()}`,
    `${currency} ${(f.projectedCOGS + f.projectedOperatingExpenses).toLocaleString()}`,
    `${currency} ${f.netCashFlow.toLocaleString()}`,
    `${currency} ${f.closingCashBalance.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Forecast Period', 'Opening Cash', 'Projected Inflows', 'Projected Outflows', 'Net Monthly Flow', 'Closing Balance']],
    body: forecastRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59] },
    columnStyles: {
      4: { fontStyle: 'bold' },
      5: { fontStyle: 'bold', halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Table 3: Stress-Testing Scenarios (Month 3 Ending Balance)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. 90-Day Stress-Testing & Scenario Analysis', 14, currentY);
  currentY += 4;

  const scenarioRows = [
    [
      'Conservative (Stress Test: -15% Sales, +8% Costs)',
      `${currency} ${forecast.scenarios.conservative[0]?.closingCashBalance.toLocaleString()}`,
      `${currency} ${forecast.scenarios.conservative[1]?.closingCashBalance.toLocaleString()}`,
      `${currency} ${forecast.scenarios.conservative[2]?.closingCashBalance.toLocaleString()}`,
      forecast.scenarios.conservative[2]?.closingCashBalance < 0 ? 'Deficit Risk' : 'Sufficient',
    ],
    [
      'Expected (Baseline: Steady run-rate +5% growth)',
      `${currency} ${forecast.scenarios.expected[0]?.closingCashBalance.toLocaleString()}`,
      `${currency} ${forecast.scenarios.expected[1]?.closingCashBalance.toLocaleString()}`,
      `${currency} ${forecast.scenarios.expected[2]?.closingCashBalance.toLocaleString()}`,
      'Target Path',
    ],
    [
      'Aggressive (Growth: +20% Sales Upside)',
      `${currency} ${forecast.scenarios.aggressive[0]?.closingCashBalance.toLocaleString()}`,
      `${currency} ${forecast.scenarios.aggressive[1]?.closingCashBalance.toLocaleString()}`,
      `${currency} ${forecast.scenarios.aggressive[2]?.closingCashBalance.toLocaleString()}`,
      'Growth Surplus',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Scenario', 'Month 1 Close', 'Month 2 Close', 'Month 3 Close', 'Buffer Outcome']],
    body: scenarioRows,
    theme: 'striped',
    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  if (forecast.aiRecommendations?.summary) {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Executive Cash Flow Advisory:', 14, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const advisoryLines = doc.splitTextToSize(forecast.aiRecommendations.summary, 182);
    doc.text(advisoryLines, 14, currentY);
  }

  addFooter(doc);
  doc.save(`${businessName.replace(/\s+/g, '_')}_Cash_Flow_Forecast.pdf`);
}
