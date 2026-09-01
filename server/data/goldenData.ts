/**
 * Golden Datasets for deterministic and high-fidelity Financial Intelligence.
 * Includes complete price history, regulatory filings, earnings transcripts, news sentiment, and sector peer metrics.
 */

export interface StockPricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface GoldenDocument {
  id: string;
  ticker: string;
  docType: 'SEBI_FILING' | 'EARNINGS_TRANSCRIPT' | 'ANNUAL_REPORT' | 'PRESS_RELEASE';
  title: string;
  quarter: string;
  year: number;
  filingDate: string;
  pages: {
    pageNumber: number;
    section: string;
    content: string;
  }[];
}

export interface ContextEvent {
  id: string;
  ticker: string;
  headline: string;
  source: string;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  impactScore: number; // -1.0 to 1.0
  summary: string;
}

export interface CompanyProfile {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  isin: string;
  currentPrice: number;
  change24h: number;
  change24hPercent: number;
  marketCapCr: number;
  peRatio: number;
  industryPe: number;
  pbRatio: number;
  dividendYield: number;
  roe: number;
  debtToEquity: number;
  beta: number;
  high52w: number;
  low52w: number;
  avgVolume30d: number;
  revenueGrowthYoy: number;
  operatingMargin: number;
  netMargin: number;
  freeCashFlowCr: number;
}

// Generate realistic 90-day OHLCV series ending at currentPrice
function generatePriceHistory(basePrice: number, volatility: number, trendSlope: number): StockPricePoint[] {
  const points: StockPricePoint[] = [];
  const now = new Date('2026-08-30');
  let current = basePrice * 0.91; // Started 9% lower 90 days ago

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const dayNoise = (Math.sin(i * 0.35) * 0.6 + Math.cos(i * 0.7) * 0.4) * volatility;
    const dayTrend = trendSlope;
    const change = current * (dayNoise + dayTrend);
    
    const open = Math.round((current + (Math.sin(i * 1.1) * 0.003 * current)) * 100) / 100;
    const close = Math.round((current + change) * 100) / 100;
    const high = Math.round((Math.max(open, close) + (Math.abs(change) * 0.7) + (current * 0.004)) * 100) / 100;
    const low = Math.round((Math.min(open, close) - (Math.abs(change) * 0.7) - (current * 0.004)) * 100) / 100;
    const baseVol = 6500000;
    const volume = Math.round(baseVol * (0.8 + Math.abs(Math.sin(i * 0.5)) * 0.6 + (i < 5 ? 0.4 : 0)));

    points.push({
      date: d.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume
    });
    current = close;
  }
  // Ensure the last close matches target basePrice
  if (points.length > 0) {
    points[points.length - 1].close = basePrice;
  }
  return points;
}

export const GOLDEN_COMPANIES: Record<string, CompanyProfile> = {
  INFY: {
    ticker: 'INFY',
    name: 'Infosys Limited',
    sector: 'Information Technology',
    industry: 'IT Services & Consulting',
    isin: 'INE009A01021',
    currentPrice: 1824.50,
    change24h: 23.40,
    change24hPercent: 1.30,
    marketCapCr: 757800,
    peRatio: 28.4,
    industryPe: 27.2,
    pbRatio: 7.9,
    dividendYield: 2.1,
    roe: 31.8,
    debtToEquity: 0.08,
    beta: 0.94,
    high52w: 1940.00,
    low52w: 1358.35,
    avgVolume30d: 6840000,
    revenueGrowthYoy: 7.2,
    operatingMargin: 21.1,
    netMargin: 16.8,
    freeCashFlowCr: 18450
  },
  TCS: {
    ticker: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'Information Technology',
    industry: 'IT Services & Consulting',
    isin: 'INE467B01029',
    currentPrice: 4210.00,
    change24h: 31.50,
    change24hPercent: 0.75,
    marketCapCr: 1523400,
    peRatio: 29.8,
    industryPe: 27.2,
    pbRatio: 12.4,
    dividendYield: 1.8,
    roe: 48.2,
    debtToEquity: 0.05,
    beta: 0.82,
    high52w: 4590.00,
    low52w: 3310.00,
    avgVolume30d: 2450000,
    revenueGrowthYoy: 5.1,
    operatingMargin: 24.6,
    netMargin: 19.3,
    freeCashFlowCr: 42100
  },
  RELIANCE: {
    ticker: 'RELIANCE',
    name: 'Reliance Industries Limited',
    sector: 'Energy & Conglomerate',
    industry: 'Oil, Retail & Telecom',
    isin: 'INE002A01018',
    currentPrice: 2985.00,
    change24h: -14.20,
    change24hPercent: -0.47,
    marketCapCr: 2019500,
    peRatio: 26.1,
    industryPe: 21.5,
    pbRatio: 2.6,
    dividendYield: 0.35,
    roe: 9.8,
    debtToEquity: 0.42,
    beta: 1.08,
    high52w: 3217.00,
    low52w: 2220.00,
    avgVolume30d: 5900000,
    revenueGrowthYoy: 9.8,
    operatingMargin: 16.2,
    netMargin: 8.7,
    freeCashFlowCr: 34100
  },
  HDFCBANK: {
    ticker: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    sector: 'Financial Services',
    industry: 'Private Commercial Banking',
    isin: 'INE040A01034',
    currentPrice: 1642.00,
    change24h: 12.80,
    change24hPercent: 0.79,
    marketCapCr: 1248000,
    peRatio: 18.6,
    industryPe: 17.8,
    pbRatio: 2.7,
    dividendYield: 1.2,
    roe: 15.4,
    debtToEquity: 6.8,
    beta: 0.89,
    high52w: 1794.00,
    low52w: 1363.55,
    avgVolume30d: 14200000,
    revenueGrowthYoy: 14.5,
    operatingMargin: 38.4,
    netMargin: 24.1,
    freeCashFlowCr: 28900
  }
};

export const GOLDEN_PRICE_HISTORIES: Record<string, StockPricePoint[]> = {
  INFY: generatePriceHistory(1824.50, 0.012, 0.0016),
  TCS: generatePriceHistory(4210.00, 0.009, 0.0011),
  RELIANCE: generatePriceHistory(2985.00, 0.014, 0.0004),
  HDFCBANK: generatePriceHistory(1642.00, 0.011, 0.0012)
};

export const GOLDEN_DOCUMENTS: GoldenDocument[] = [
  {
    id: 'INFY_SEBI_Q1_2026',
    ticker: 'INFY',
    docType: 'SEBI_FILING',
    title: 'Infosys Q1 FY2026 Audited Consolidated Financial Results (SEBI LODR Reg 33)',
    quarter: 'Q1 FY26',
    year: 2026,
    filingDate: '2026-07-18',
    pages: [
      {
        pageNumber: 3,
        section: 'Financial Performance Highlights',
        content: 'Consolidated revenue for the quarter ended June 30, 2026 stood at INR 40,296 crore (USD 4,814 million), representing a year-on-year growth of 7.2% in INR terms and 3.8% sequentially in constant currency. Operating profit reached INR 8,502 crore with an operating margin of 21.1%, expanding by 30 basis points sequentially due to Project Maximus cost optimization and higher automation deployment across software delivery.'
      },
      {
        pageNumber: 5,
        section: 'Segmental & Geography Breakdown',
        content: 'Digital revenues accounted for 62.4% of total revenue, growing at 11.2% YoY driven by enterprise AI adoption and cloud modernization programs. Financial Services grew 4.2% YoY, Manufacturing grew 8.9% YoY, and Life Sciences grew 12.1% YoY. North America contributed 59.8% of revenues, while Europe expanded to 28.6% with strong traction in public cloud transformation engagements.'
      },
      {
        pageNumber: 8,
        section: 'Deal Wins, Bookings & Headcount',
        content: 'Large deal Total Contract Value (TCV) for Q1 FY26 stood at USD 3.4 billion, with 52% net new deals. The company closed 18 large deals across North America and Continental Europe, including 3 marquee generative AI workflow modernization contracts. Voluntary annualized attrition further reduced to 12.7% compared to 17.3% in the prior year, enhancing employee retention and reducing subcontractor costs.'
      },
      {
        pageNumber: 12,
        section: 'Balance Sheet & Capital Allocation',
        content: 'Free cash flow generation for the quarter was robust at INR 6,840 crore (USD 817 million), representing a FCF-to-Net Profit conversion of 108%. The Board declared an interim dividend of INR 20 per equity share. Cash and investments totaled INR 37,450 crore with zero long-term debt, providing superior balance sheet stability and dividend safety.'
      }
    ]
  },
  {
    id: 'INFY_TRANSCRIPT_Q1_2026',
    ticker: 'INFY',
    docType: 'EARNINGS_TRANSCRIPT',
    title: 'Infosys Limited Q1 FY2026 Earnings Conference Call Transcript',
    quarter: 'Q1 FY26',
    year: 2026,
    filingDate: '2026-07-19',
    pages: [
      {
        pageNumber: 2,
        section: 'Management Commentary - CEO Salil Parekh',
        content: 'Salil Parekh (CEO & MD): "We had a strong start to FY26 with constant currency revenue expansion of 3.8% sequential. Our Topaz generative AI suite is now integrated into over 450 client projects. Clients are moving beyond pilot programs into enterprise-scale autonomous coding and AI agent orchestrations. Our pipeline of mega-deals is the highest in four quarters, giving us confidence to raise our FY26 revenue guidance band to 4.0% - 5.5% in constant currency."'
      },
      {
        pageNumber: 6,
        section: 'Financial Review - CFO Jayesh Sanghrajka',
        content: 'Jayesh Sanghrajka (CFO): "Operating margin of 21.1% was resilient despite wage increments rolled out in June. Our Project Maximus efficiency program delivered 80 bps of operational benefits, offsetting pricing pressures in legacy infrastructure management. Our DSO improved by 2 days to 66 days, reflecting high cash collection efficiency across global accounts."'
      },
      {
        pageNumber: 9,
        section: 'Analyst Q&A - Discretionary Spend Outlook',
        content: 'Question from Morgan Stanley Analyst on US IT spending: Salil Parekh: "While macroeconomic caution persists in mortgage banking and telecom hardware clients, we observe clear budget reallocation toward cost takeout, application modernization, and generative AI data preparation. Discretionary spending is not booming, but strategic transformational budgets are committed and executing."'
      }
    ]
  },
  {
    id: 'TCS_SEBI_Q1_2026',
    ticker: 'TCS',
    docType: 'SEBI_FILING',
    title: 'Tata Consultancy Services Q1 FY2026 Results',
    quarter: 'Q1 FY26',
    year: 2026,
    filingDate: '2026-07-12',
    pages: [
      {
        pageNumber: 2,
        section: 'Financial Performance',
        content: 'TCS reported quarterly revenue of INR 63,575 crore, an increase of 5.1% YoY. Operating margin stood at 24.6%, industry-leading. TCV deal wins reached USD 8.3 billion for the quarter with continued leadership in BFS and Retail.'
      }
    ]
  }
];

export const GOLDEN_CONTEXT_EVENTS: ContextEvent[] = [
  {
    id: 'EV_INFY_01',
    ticker: 'INFY',
    headline: 'Infosys expands generative AI partnership with Microsoft & Nvidia for enterprise agent workflows',
    source: 'Economic Times / Press Release',
    publishedAt: '2026-08-25T09:30:00Z',
    sentiment: 'POSITIVE',
    impactScore: 0.85,
    summary: 'Infosys Topaz platform integrates deeper with Nvidia NIM microservices and Azure OpenAI, enabling autonomous enterprise process automation for Fortune 500 clients.'
  },
  {
    id: 'EV_INFY_02',
    ticker: 'INFY',
    headline: 'Major European logistics conglomerate awards multi-year $420M digital transformation mandate to Infosys',
    source: 'Reuters Financial',
    publishedAt: '2026-08-18T14:15:00Z',
    sentiment: 'POSITIVE',
    impactScore: 0.78,
    summary: 'A 5-year engagement to rebuild supply chain logistics platforms using cloud-native microservices and real-time IoT tracking across 24 European distribution hubs.'
  },
  {
    id: 'EV_INFY_03',
    ticker: 'INFY',
    headline: 'US Federal Reserve interest rate trajectory and tech sector discretionary spend pace remains moderate',
    source: 'Bloomberg Quint',
    publishedAt: '2026-08-28T11:00:00Z',
    sentiment: 'NEUTRAL',
    impactScore: 0.05,
    summary: 'US corporate treasuries maintain measured capital expenditure on non-critical software upgrades, balancing GenAI investments with operational cost cuts.'
  },
  {
    id: 'EV_INFY_04',
    ticker: 'INFY',
    headline: 'IT Sector compensation cycles normalized; voluntary attrition hits 3-year low across Tier-1 Indian IT firms',
    source: 'Mint Markets',
    publishedAt: '2026-08-12T08:00:00Z',
    sentiment: 'POSITIVE',
    impactScore: 0.65,
    summary: 'Subcontracting expense ratios declined by 110 bps as domestic talent pools stabilize and campus onboarding returns to predictable quarterly cohorts.'
  }
];

export const SECTOR_BENCHMARKS = {
  'Information Technology': {
    name: 'Nifty IT Index',
    momentumPercent30d: 4.8,
    peRatio: 27.2,
    ytdReturnPercent: 12.4,
    sectorHealth: 'EXPANDING',
    sentiment: 'POSITIVE'
  },
  'Energy & Conglomerate': {
    name: 'Nifty Energy Index',
    momentumPercent30d: 1.2,
    peRatio: 21.5,
    ytdReturnPercent: 8.1,
    sectorHealth: 'STABLE',
    sentiment: 'NEUTRAL'
  },
  'Financial Services': {
    name: 'Nifty Bank Index',
    momentumPercent30d: 3.4,
    peRatio: 17.8,
    ytdReturnPercent: 9.6,
    sectorHealth: 'STEADY',
    sentiment: 'POSITIVE'
  }
};
