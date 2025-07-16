import { Effect, Array } from "effect";
import { BitvavoClient } from "./bitvavo-client.js";
import type {
  AssetSummary,
  BitvavoTrade,
  BitvavoBalance,
} from "../types/bitvavo.js";

export class AssetAnalyzer {
  static analyzeAssets = Effect.gen(function* () {
    const client = yield* BitvavoClient;

    // Get current balances
    const balances = yield* client.getBalances;

    // Filter out zero balances and fiat currencies
    const cryptoBalances = balances.filter(
      (balance) =>
        parseFloat(balance.available) > 0 &&
        !["EUR", "USD"].includes(balance.symbol),
    );

    if (cryptoBalances.length === 0) {
      return [];
    }

    // Get all trades for analysis
    const allTrades = yield* client.getTrades();

    // Get current prices for all assets
    const summaries = yield* Effect.forEach(
      cryptoBalances,
      (balance) => AssetAnalyzer.analyzeAsset(balance, allTrades, client),
      { concurrency: "unbounded" },
    );

    return summaries;
  });

  private static analyzeAsset = (
    balance: BitvavoBalance,
    allTrades: BitvavoTrade[],
    client: typeof BitvavoClient.Service,
  ): Effect.Effect<AssetSummary, Error> =>
    Effect.gen(function* () {
      const symbol = balance.symbol;
      const currentBalance =
        parseFloat(balance.available) + parseFloat(balance.inOrder);

      // Filter trades for this asset
      const assetTrades = allTrades.filter(
        (trade) =>
          trade.market === `${symbol}-EUR` || trade.market === `${symbol}-USD`,
      );

      // Calculate purchase and sale totals
      const { totalPurchased, totalSold, totalInvested, totalReceived } =
        AssetAnalyzer.calculateTradeTotals(assetTrades);

      // Calculate average buy price
      const averageBuyPrice =
        totalPurchased > 0 ? totalInvested / totalPurchased : 0;

      // Get current price
      const market = `${symbol}-EUR`;
      const ticker = yield* client.getTicker(market);
      const currentPrice = parseFloat(ticker.price);

      // Calculate current value and gains/losses
      const totalValue = currentBalance * currentPrice;
      const netInvestment = totalInvested - totalReceived;
      const gainLoss = totalValue - netInvestment;
      const gainLossPercent =
        netInvestment > 0 ? (gainLoss / netInvestment) * 100 : 0;

      return {
        symbol,
        currentBalance,
        totalPurchased,
        totalSold,
        averageBuyPrice,
        currentPrice,
        totalValue,
        totalInvested: netInvestment,
        gainLoss,
        gainLossPercent,
      };
    });

  private static calculateTradeTotals = (trades: BitvavoTrade[]) => {
    return trades.reduce(
      (acc, trade) => {
        const amount = parseFloat(trade.amount);

        if (trade.side === "buy") {
          acc.totalPurchased += amount;
          // Use sentAmount (EUR spent) for totalInvested instead of amount * price
          acc.totalInvested += parseFloat(trade.sentAmount || "0");
        } else {
          acc.totalSold += amount;
          // Use receivedAmount (EUR received) for totalReceived
          acc.totalReceived += parseFloat(trade.receivedAmount || "0");
        }

        return acc;
      },
      {
        totalPurchased: 0,
        totalSold: 0,
        totalInvested: 0,
        totalReceived: 0,
      },
    );
  };
}
