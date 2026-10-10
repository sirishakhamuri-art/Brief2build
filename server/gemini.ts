import { GoogleGenAI } from '@google/genai';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface BusinessPlanPromptInput {
  proposedName: string;
  category: string;
  categoryLabel?: string;
  description: string;
  location: string;
  productsOrServices?: string;
  startingBudget?: number;
  targetCustomers?: string;
  preferredSize?: string;
  equipmentNeeded?: string;
  expectedLaunchDate?: string;
  additionalRequirements?: string;
  currency?: string;
}

export async function generateAIBusinessPlan(input: BusinessPlanPromptInput) {
  const ai = getGeminiClient();
  const currency = input.currency || 'INR';

  if (!ai) {
    return {
      isAIAvailable: false,
      message: 'GEMINI_API_KEY is not configured in environment variables. You can configure your key in Settings > Secrets. Here is a baseline structured planning template to get you started immediately.',
      plan: getFallbackPlan(input),
    };
  }

  const prompt = `You are Brief2Build AI, an expert pragmatic business strategist and financial feasibility consultant.
Create an exhaustive, realistic, structured business plan for this entrepreneur:

- Business Name: ${input.proposedName}
- Industry Category: ${input.category} (${input.categoryLabel || input.category})
- Concept Description: ${input.description}
- Target Location: ${input.location}
- Products or Services: ${input.productsOrServices || 'Standard offering for category'}
- Available Starting Budget: ${currency} ${input.startingBudget || 500000}
- Target Customers: ${input.targetCustomers || 'Local demographic'}
- Preferred Business Size: ${input.preferredSize || 'Small-to-medium boutique storefront / workshop'}
- Equipment & Raw Materials: ${input.equipmentNeeded || 'Commercial equipment suitable for this sector'}
- Expected Launch Date: ${input.expectedLaunchDate || 'Within 3-6 months'}
- Additional Specifics: ${input.additionalRequirements || 'None specified'}

IMPORTANT REQUIREMENTS:
1. Do not present estimates as guaranteed results. Label all sales and break-even projections as estimates with explicit assumptions.
2. Outline specific required equipment, startup expenses, monthly operating expenses, and recommended budget allocation percentages.
3. Provide realistic cost figures in ${currency}.
4. Provide actionable risks and practical risk-mitigation recommendations.
5. If details are sparse, include 2-3 specific follow-up questions for the entrepreneur.

Return ONLY a valid JSON object matching this exact schema:
{
  "summary": "Comprehensive 2-paragraph executive summary of the business concept, positioning, and market opportunity.",
  "targetMarket": "Detailed analysis of target customer personas, buying behaviors, local competitive landscape, and market size.",
  "requiredEquipment": [
    { "name": "Equipment / Asset name", "estimatedCost": 25000, "purpose": "Operational purpose" }
  ],
  "startupExpenses": [
    { "item": "Security Deposit / Storefront Advance", "cost": 150000, "category": "Premises" },
    { "item": "Renovation & Interior Fit-out", "cost": 120000, "category": "Setup" }
  ],
  "monthlyOperatingExpenses": [
    { "item": "Commercial Rent", "cost": 35000, "category": "Rent" },
    { "item": "Utilities & Power", "cost": 8000, "category": "Utilities" },
    { "item": "Staff Salaries (2 members)", "cost": 30000, "category": "Labor" },
    { "item": "Local Marketing & Packaging", "cost": 7000, "category": "Marketing" }
  ],
  "budgetAllocation": [
    { "category": "Equipment & Machinery", "percentage": 35, "amount": 175000 },
    { "category": "Working Capital & Initial Inventory", "percentage": 30, "amount": 150000 },
    { "category": "Storefront Setup & Licenses", "percentage": 25, "amount": 125000 },
    { "category": "Contingency & Marketing", "percentage": 10, "amount": 50000 }
  ],
  "launchTimeline": [
    { "phase": "Phase 1: Legal & Premises", "timeframe": "Month 1", "milestones": ["Secure FSSAI/Trade license", "Finalize lease agreement", "Utility approvals"] },
    { "phase": "Phase 2: Equipment & Sourcing", "timeframe": "Month 2", "milestones": ["Procure ovens & prep counters", "Establish wholesale supplier accounts", "Initial inventory trial"] },
    { "phase": "Phase 3: Soft Launch & Grand Opening", "timeframe": "Month 3", "milestones": ["Menu tasting & packaging testing", "Staff onboarding", "Grand opening campaign"] }
  ],
  "risksAndRecommendations": [
    { "risk": "Supply chain price volatility on key ingredients/materials", "recommendation": "Lock in 30-day contracts with primary and secondary suppliers." },
    { "risk": "Perishable inventory spoilage during initial low-traffic weeks", "recommendation": "Adopt small-batch production schedules and strict FIFO inventory management." }
  ],
  "salesAndBreakEvenEstimates": {
    "estimatedMonthlySalesUnits": 1200,
    "averageUnitPrice": 150,
    "estimatedMonthlyRevenue": 180000,
    "estimatedCOGS": 72000,
    "breakEvenMonthlyUnits": 800,
    "breakEvenMonthlyRevenue": 120000,
    "assumptions": "Assumes 60% gross margin, ₹80,000 fixed monthly overhead, and 6 days/week operation.",
    "missingInfoNotes": "Actual retail footfall, seasonal demand spikes, and utility tariff rate can alter these projections.",
    "disclaimer": "These projections are simulated financial models based on category averages and stated assumptions. They are not guaranteed revenue guarantees."
  },
  "followUpQuestions": [
    "What is your target daily customer footfall or order capacity?",
    "Will you offer delivery partnerships or strictly over-the-counter sales?"
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleaned = text.trim();
    const parsed = JSON.parse(cleaned);

    return {
      isAIAvailable: true,
      plan: parsed,
    };
  } catch (err: any) {
    console.error('Gemini API plan generation error:', err);
    return {
      isAIAvailable: false,
      message: `Gemini generation encountered an error: ${err.message || 'Unknown error'}. Falling back to baseline template.`,
      plan: getFallbackPlan(input),
    };
  }
}

export async function generateAIBusinessInsights(data: {
  businessName: string;
  category: string;
  currency: string;
  financials: any;
  products: any[];
  recentSales: any[];
  expenses: any[];
  stockAlerts: any[];
}) {
  const ai = getGeminiClient();

  // Integrity Check: If there are fewer than 2 sales recorded, state insufficient data honestly
  if (data.recentSales.length < 2) {
    return {
      isAIAvailable: true,
      hasSufficientData: false,
      summary: `Insufficient historical sales transactions recorded for ${data.businessName}. You have recorded ${data.recentSales.length} sale(s) to date.`,
      recommendation: "Record at least 3-5 daily customer sales and 2 operational expense entries. Brief2Build AI will then synthesize actual revenue trends, velocity metrics, and margin optimization recommendations from your live ledger.",
      insights: [
        {
          type: "status",
          title: "Awaiting Live Transaction History",
          description: `To deliver meaningful statistical insights, Brief2Build AI requires active transaction flow. Current recorded sales count: ${data.recentSales.length}.`,
        },
      ],
    };
  }

  if (!ai) {
    // Generate statistical insights strictly from data calculations
    return {
      isAIAvailable: false,
      hasSufficientData: true,
      summary: `Automated Ledger Analysis for ${data.businessName} (AI generative synthesis paused - attach GEMINI_API_KEY in Secrets for natural-language advisory).`,
      recommendation: `Your current gross margin is ${data.financials.grossMarginPercent.toFixed(1)}% on lifetime revenue of ${data.currency} ${data.financials.totalRevenue.toLocaleString()}. Focus on restocking top sellers and auditing highest expense category (${Object.keys(data.financials.expenseByCategory)[0] || 'None'}).`,
      insights: getRuleBasedInsights(data),
    };
  }

  const prompt = `You are Brief2Build AI's Senior Operations & Financial Analyst.
Analyze the actual recorded business data for ${data.businessName} (${data.category}) in ${data.currency}:

FINANCIAL METRICS:
- Total Sales Revenue: ${data.currency} ${data.financials.totalRevenue}
- Total Cost of Goods Sold (COGS): ${data.currency} ${data.financials.totalCOGS}
- Gross Profit: ${data.currency} ${data.financials.grossProfit} (Gross Margin: ${data.financials.grossMarginPercent.toFixed(1)}%)
- Total Operating Expenses: ${data.currency} ${data.financials.totalOperatingExpenses}
- Net Profit: ${data.currency} ${data.financials.netProfit} (Net Margin: ${data.financials.netMarginPercent.toFixed(1)}%)
- Current Inventory Held Value: ${data.currency} ${data.financials.totalInventoryValue}
- Expense Categories: ${JSON.stringify(data.financials.expenseByCategory)}

PRODUCT PERFORMANCE:
- Best Selling Products: ${JSON.stringify(data.financials.topSellingProducts)}
- Low Stock Count: ${data.financials.lowStockCount}
- Out of Stock Count: ${data.financials.outOfStockCount}
- Expired Stock Count: ${data.financials.expiredCount}
- Total Catalog Items: ${data.products.length}

RULES:
1. Base all conclusions strictly on the actual stored numbers above.
2. Highlight high-performing items, slow-moving or low-stock risks, and expense control recommendations.
3. Explain the "why" behind each recommendation.

Return ONLY a valid JSON object matching:
{
  "summary": "Executive summary of current business health, margins, and operational performance.",
  "recommendation": "Single most impactful strategic priority for this business owner right now.",
  "insights": [
    {
      "type": "best_seller" | "inventory_risk" | "expense_optimization" | "margin_growth",
      "title": "Clear headline",
      "metric": "Key figure (e.g. 68% margin, 2 low stock SKUs)",
      "description": "Detailed explanation with reasoning based on the recorded data."
    }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text.trim());
    return {
      isAIAvailable: true,
      hasSufficientData: true,
      ...parsed,
    };
  } catch (err: any) {
    console.error('Gemini insights error:', err);
    return {
      isAIAvailable: false,
      hasSufficientData: true,
      summary: `Automated Data Analysis for ${data.businessName}`,
      recommendation: "Review stock thresholds and operating expenses.",
      insights: getRuleBasedInsights(data),
    };
  }
}

function getRuleBasedInsights(data: any) {
  const insights = [];
  const topProd = data.financials.topSellingProducts[0];
  if (topProd) {
    insights.push({
      type: "best_seller",
      title: `Top Revenue Driver: ${topProd.name}`,
      metric: `${topProd.quantity} units sold (${data.currency} ${topProd.revenue})`,
      description: `This product is driving the bulk of sales velocity. Ensure buffer inventory with primary suppliers to prevent stockout disruptions.`,
    });
  }

  if (data.financials.lowStockCount > 0) {
    insights.push({
      type: "inventory_risk",
      title: "Immediate Reorder Attention",
      metric: `${data.financials.lowStockCount} SKU(s) below threshold`,
      description: `Items are approaching safety stock limits. Check the Supplier Directory to issue purchase requests before lead times impact sales.`,
    });
  }

  const highestExpCat = Object.entries(data.financials.expenseByCategory)
    .sort((a: any, b: any) => b[1] - a[1])[0];
  if (highestExpCat) {
    insights.push({
      type: "expense_optimization",
      title: `Largest Operating Overhead: ${highestExpCat[0].toUpperCase()}`,
      metric: `${data.currency} ${Number(highestExpCat[1]).toLocaleString()}`,
      description: `This represents your highest recurring operational outflow. Monitor this closely against monthly revenue to preserve net margins.`,
    });
  }

  return insights;
}

function getFallbackPlan(input: BusinessPlanPromptInput) {
  const budget = input.startingBudget || 500000;
  return {
    summary: `${input.proposedName} is designed as a focused ${input.categoryLabel || input.category} venture situated in ${input.location}. The concept centers around high-quality product delivery, community engagement, and lean inventory cycles.`,
    targetMarket: `Targeting local consumers and commercial clients in ${input.location} seeking consistent quality and personalized customer service.`,
    requiredEquipment: [
      { name: "Primary Commercial Production Unit", estimatedCost: Math.round(budget * 0.25), purpose: "Core daily output operations" },
      { name: "Storage, Refrigeration & Display Counter", estimatedCost: Math.round(budget * 0.15), purpose: "Product preservation and merchandising" },
      { name: "Point of Sale & Inventory Hardware", estimatedCost: 15000, purpose: "Billing, receipt printing, and stock audit" },
    ],
    startupExpenses: [
      { item: "Premises Security Deposit & Advance", cost: Math.round(budget * 0.25), category: "Premises" },
      { item: "Storefront Fixtures & Interior Setup", cost: Math.round(budget * 0.2), category: "Renovation" },
      { item: "Licenses, Registrations & Working Capital", cost: Math.round(budget * 0.1), category: "Legal & Reserves" },
    ],
    monthlyOperatingExpenses: [
      { item: "Storefront Lease", cost: 30000, category: "Rent" },
      { item: "Electricity, Water & Utilities", cost: 7500, category: "Utilities" },
      { item: "Personnel Salaries", cost: 28000, category: "Salaries" },
      { item: "Packaging & Sanitation", cost: 4500, category: "Packaging" },
    ],
    budgetAllocation: [
      { category: "Equipment & Hardware", percentage: 40, amount: Math.round(budget * 0.4) },
      { category: "Premises & Fit-out", percentage: 35, amount: Math.round(budget * 0.35) },
      { category: "Initial Raw Materials & Packaging", percentage: 15, amount: Math.round(budget * 0.15) },
      { category: "Contingency Cash Reserve", percentage: 10, amount: Math.round(budget * 0.1) },
    ],
    launchTimeline: [
      { phase: "Phase 1: Registration & Property", timeframe: "Month 1", milestones: ["Secure trade licenses & tax registration", "Finalize commercial lease"] },
      { phase: "Phase 2: Fit-out & Vendor Onboarding", timeframe: "Month 2", milestones: ["Install equipment", "Connect with verified wholesale suppliers", "Staff training"] },
      { phase: "Phase 3: Soft Launch", timeframe: "Month 3", milestones: ["Trial batch runs", "Launch local promotions", "Commence full retail operations"] },
    ],
    risksAndRecommendations: [
      { risk: "Initial consumer adoption latency", recommendation: "Offer introductory tasting/samples and localized social media outreach." },
      { risk: "Working capital depletion before break-even", recommendation: "Maintain strict 60-day buffer reserve and negotiate vendor credit terms." },
    ],
    salesAndBreakEvenEstimates: {
      estimatedMonthlySalesUnits: 900,
      averageUnitPrice: 180,
      estimatedMonthlyRevenue: 162000,
      estimatedCOGS: 64800,
      breakEvenMonthlyUnits: 650,
      breakEvenMonthlyRevenue: 117000,
      assumptions: "Assumes 60% gross profit margin and ₹70,000 monthly operational overhead.",
      missingInfoNotes: "Detailed rental rate agreements and seasonal demand shifts can impact break-even point.",
      disclaimer: "These figures are modeled estimations and do not constitute guaranteed financial outcomes.",
    },
    followUpQuestions: [
      "What is your target daily customer footfall or order capacity?",
      "Will you offer delivery partnerships or strictly over-the-counter sales?"
    ],
  };
}

export async function generateAICashFlowForecast(data: {
  businessName: string;
  category: string;
  currency: string;
  cashFlowData: any;
}) {
  const ai = getGeminiClient();
  const cf = data.cashFlowData;

  if (!ai) {
    return {
      isAIAvailable: false,
      summary: `3-Month Cash Flow Model for ${data.businessName}: Projected to finish Month 3 with ${data.currency} ${cf.forecastMonths[2]?.closingCashBalance?.toLocaleString() || '0'}. Working capital health is classified as ${cf.metrics.surplusOrDeficit}.`,
      riskLevel: cf.metrics.surplusOrDeficit === 'deficit' ? 'high' : cf.metrics.lowestProjectedBalance < cf.metrics.safetyBufferNeeded ? 'moderate' : 'low',
      keyAlerts: [
        `Lowest projected balance over next 90 days: ${data.currency} ${cf.metrics.lowestProjectedBalance?.toLocaleString()}`,
        cf.metrics.averageMonthlyBurnRate > 0
          ? `Estimated cash runway is ${cf.metrics.projectedRunwayMonths} month(s) at current burn rate.`
          : 'Business demonstrates positive operational cash generation.',
      ],
      actionItems: [
        `Maintain an operational liquidity buffer of at least ${data.currency} ${cf.metrics.safetyBufferNeeded?.toLocaleString()} for unanticipated delays.`,
        'Align supplier payables with customer collection cycles to protect intra-month bank balances.',
        'Review discretionary marketing and equipment purchases during low-velocity weeks.',
      ],
    };
  }

  const prompt = `You are Brief2Build AI's Chief Financial Officer & Cash Flow Strategist.
Analyze the actual and projected cash flow trends for ${data.businessName} (${data.category}) in ${data.currency}:

CURRENT LIQUIDITY & HISTORICAL CASH TRENDS:
- Current Opening Cash Balance: ${data.currency} ${cf.currentCashBalance}
- Recent Historical Monthly Flows: ${JSON.stringify(cf.historicalMonths)}

3-MONTH FORWARD PREDICTIONS:
- Month 1 (${cf.forecastMonths[0]?.monthLabel}): Inflows: ${cf.forecastMonths[0]?.projectedRevenue}, Outflows: ${cf.forecastMonths[0]?.projectedOperatingExpenses + cf.forecastMonths[0]?.projectedCOGS}, Net Cash: ${cf.forecastMonths[0]?.netCashFlow}, Closing: ${cf.forecastMonths[0]?.closingCashBalance}
- Month 2 (${cf.forecastMonths[1]?.monthLabel}): Inflows: ${cf.forecastMonths[1]?.projectedRevenue}, Outflows: ${cf.forecastMonths[1]?.projectedOperatingExpenses + cf.forecastMonths[1]?.projectedCOGS}, Net Cash: ${cf.forecastMonths[1]?.netCashFlow}, Closing: ${cf.forecastMonths[1]?.closingCashBalance}
- Month 3 (${cf.forecastMonths[2]?.monthLabel}): Inflows: ${cf.forecastMonths[2]?.projectedRevenue}, Outflows: ${cf.forecastMonths[2]?.projectedOperatingExpenses + cf.forecastMonths[2]?.projectedCOGS}, Net Cash: ${cf.forecastMonths[2]?.netCashFlow}, Closing: ${cf.forecastMonths[2]?.closingCashBalance}

STRESS-TEST SCENARIOS (Month 3 Closing Balance):
- Expected: ${data.currency} ${cf.scenarios.expected[2]?.closingCashBalance}
- Conservative (Worst Case): ${data.currency} ${cf.scenarios.conservative[2]?.closingCashBalance}
- Aggressive (Upside): ${data.currency} ${cf.scenarios.aggressive[2]?.closingCashBalance}

METRICS:
- Lowest Projected Cash Dip: ${data.currency} ${cf.metrics.lowestProjectedBalance}
- Recommended Safety Buffer: ${data.currency} ${cf.metrics.safetyBufferNeeded}
- Status: ${cf.metrics.surplusOrDeficit}
- Projected Runway: ${cf.metrics.projectedRunwayMonths === 99 ? 'Cash Flow Positive' : cf.metrics.projectedRunwayMonths + ' months'}

TASK:
Provide an executive, realistic, actionable assessment of liquidity trends for the next 3 months.
Return ONLY a valid JSON object matching:
{
  "summary": "2-3 sentence strategic summary of predicted cash trajectory, highlighting working capital health and liquidity inflection points.",
  "riskLevel": "low" | "moderate" | "high" | "critical",
  "keyAlerts": [
    "Alert item 1 explaining timing or buffer risks",
    "Alert item 2 explaining stress test outcome"
  ],
  "actionItems": [
    "Concrete recommendation 1 (e.g. receivables, credit terms, inventory replenishment)",
    "Concrete recommendation 2 (e.g. overhead pruning or buffer preservation)"
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse((response.text || '').trim());
    return {
      isAIAvailable: true,
      ...parsed,
    };
  } catch (err: any) {
    console.error('Gemini cash flow forecast error:', err);
    return {
      isAIAvailable: false,
      summary: `Automated Cash Flow Projections for ${data.businessName}`,
      riskLevel: cf.metrics.lowestProjectedBalance < 0 ? 'high' : 'moderate',
      keyAlerts: [`Projected cash balance reaches ${data.currency} ${cf.forecastMonths[2]?.closingCashBalance?.toLocaleString()}`],
      actionItems: ['Monitor receivables and keep 2 months fixed overhead in reserve.'],
    };
  }
}
