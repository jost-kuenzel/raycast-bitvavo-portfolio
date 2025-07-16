import type { AssetSummary } from "../types/bitvavo.js";

export class MarkdownFormatter {
  static formatAssetSummary(assets: AssetSummary[]): string {
    if (assets.length === 0) {
      return "# 🪙 Bitvavo Asset Portfolio\n\n⚠️ No cryptocurrency assets found with positive balance.";
    }

    // Helper for number formatting with thousands separator
    const fmt = (n: number, decimals = 2) =>
      n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

    const fmtBalance = (n: number) =>
      n.toLocaleString("en-US", {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8,
      });

    // Sort assets by symbol ascending (e.g. BTC, ETH, XRP)
    const sortedAssets = [...assets].sort((a, b) =>
      a.symbol.localeCompare(b.symbol),
    );

    // Calculate totals
    const totalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const totalInvested = assets.reduce(
      (sum, asset) => sum + asset.totalInvested,
      0,
    );
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent =
      totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    // Build markdown table
    let markdown = "# 🪙 Bitvavo Asset Portfolio\n\n";

    // Table header
    markdown +=
      "| Asset | Current Price | Avg Buy Price | Balance | Total Value | Invested | Gain/Loss | Gain/Loss % |\n";
    markdown +=
      "|-------|---------------|---------------|---------|-------------|----------|-----------|-------------|\n";

    // Asset rows
    sortedAssets.forEach((asset) => {
      const gainLoss = asset.gainLoss;
      const gainLossPercent = asset.gainLossPercent;

      // Format gain/loss with appropriate symbols
      const gainLossFormatted =
        gainLoss >= 0 ? `+€${fmt(gainLoss)}` : `-€${fmt(Math.abs(gainLoss))}`;
      const gainLossPercentFormatted =
        gainLossPercent >= 0
          ? `+${fmt(gainLossPercent)}%`
          : `-${fmt(Math.abs(gainLossPercent))}%`;

      markdown += `| **${asset.symbol}** | €${fmt(asset.currentPrice)} | €${fmt(
        asset.averageBuyPrice,
      )} | ${fmtBalance(asset.currentBalance)} | €${fmt(
        asset.totalValue,
      )} | €${fmt(
        asset.totalInvested,
      )} | ${gainLossFormatted} | ${gainLossPercentFormatted} |\n`;
    });

    // Totals row
    const totalGainLossFormatted =
      totalGainLoss >= 0
        ? `+€${fmt(totalGainLoss)}`
        : `-€${fmt(Math.abs(totalGainLoss))}`;
    const totalGainLossPercentFormatted =
      totalGainLossPercent >= 0
        ? `+${fmt(totalGainLossPercent)}%`
        : `-${fmt(Math.abs(totalGainLossPercent))}%`;

    markdown += `| **TOTAL** | | | | **€${fmt(totalValue)}** | **€${fmt(
      totalInvested,
    )}** | **${totalGainLossFormatted}** | **${totalGainLossPercentFormatted}** |\n`;

    // Add summary info
    markdown += `\n---\n\n`;
    markdown += `**Portfolio Summary:**\n\n`;
    markdown += `- **Total Value:** €${fmt(totalValue)}\n`;
    markdown += `- **Total Invested:** €${fmt(totalInvested)}\n`;
    markdown += `- **Total Gain/Loss:** ${totalGainLossFormatted}\n`;
    markdown += `- **Total Gain/Loss %:** ${totalGainLossPercentFormatted}\n`;

    return markdown;
  }

  static formatError(error: Error): string {
    return `# ❌ Error\n\n${error.message}`;
  }

  static formatLoading(message: string): string {
    return `# ⏳ Loading\n\n${message}`;
  }
}
