export interface BitvavoBalance {
  symbol: string;
  available: string;
  inOrder: string;
}

export interface BitvavoTrade {
  id: string;
  timestamp: number;
  market: string;
  side: "buy" | "sell";
  amount: string;
  price: string;
  taker: boolean;
  fee: string;
  feeCurrency: string;
  settled: boolean;
  // Additional fields for proper calculation
  sentAmount?: string;
  receivedAmount?: string;
}

export interface BitvavoTicker {
  market: string;
  price: string;
  timestamp?: number;
}

export interface AssetSummary {
  symbol: string;
  currentBalance: number;
  totalPurchased: number;
  totalSold: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  totalInvested: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface BitvavoCredentials {
  apiKey: string;
  apiSecret: string;
}
