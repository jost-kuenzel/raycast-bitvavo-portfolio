import chalk from "chalk";
import Table from "cli-table3";
import type { AssetSummary } from "../types/bitvavo.js";

export class OutputFormatter {
  static formatAssetSummary(assets: AssetSummary[]): string {
    if (assets.length === 0) {
      return chalk.yellow(
        "No cryptocurrency assets found with positive balance.",
      );
    }

    // Create table with new column order
    const table = new Table({
      head: [
        chalk.bold.white("Asset"),
        chalk.bold.white("Current Price"),
        chalk.bold.white("Avg Buy Price"),
        chalk.bold.white("Balance"),
        chalk.bold.white("Total Value"),
        chalk.bold.white("Invested"),
        chalk.bold.white("Gain/Loss"),
        chalk.bold.white("Gain/Loss %"),
      ],
      style: {
        head: [],
        border: ["gray"],
      },
    });

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
    // Use cli-table3 hAlign property for right alignment

    // Sort assets by symbol ascending (e.g. BTC, ETH, XRP)
    const sortedAssets = [...assets].sort((a, b) =>
      a.symbol.localeCompare(b.symbol),
    );

    // Add asset rows with new column order
    sortedAssets.forEach((asset) => {
      const gainLoss = asset.gainLoss;
      const gainLossPercent = asset.gainLossPercent;

      // Color coding for gain/loss
      const gainLossColor = gainLoss >= 0 ? chalk.green : chalk.red;
      const gainLossPercentColor =
        gainLossPercent >= 0 ? chalk.green : chalk.red;

      table.push([
        chalk.cyan(asset.symbol),
        { content: `€ ${fmt(asset.currentPrice)}`, hAlign: "right" },
        { content: `€ ${fmt(asset.averageBuyPrice)}`, hAlign: "right" },
        { content: fmtBalance(asset.currentBalance), hAlign: "right" },
        { content: `€ ${fmt(asset.totalValue)}`, hAlign: "right" },
        { content: `€ ${fmt(asset.totalInvested)}`, hAlign: "right" },
        { content: gainLossColor(`€ ${fmt(gainLoss)}`), hAlign: "right" },
        {
          content: gainLossPercentColor(`${fmt(gainLossPercent)} %`),
          hAlign: "right",
        },
      ]);
    });

    // Calculate totals
    const totalValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
    const totalInvested = assets.reduce(
      (sum, asset) => sum + asset.totalInvested,
      0,
    );
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent =
      totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    // Add totals row
    const totalGainLossColor =
      totalGainLoss >= 0 ? chalk.bold.green : chalk.bold.red;
    const totalGainLossPercentColor =
      totalGainLossPercent >= 0 ? chalk.bold.green : chalk.bold.red;

    table.push([
      chalk.bold.white("TOTAL"),
      "",
      "",
      "",
      { content: chalk.bold.white(`€ ${fmt(totalValue)}`), hAlign: "right" },
      { content: chalk.bold.white(`€ ${fmt(totalInvested)}`), hAlign: "right" },
      {
        content: totalGainLossColor(`€ ${fmt(totalGainLoss)}`),
        hAlign: "right",
      },
      {
        content: totalGainLossPercentColor(`${fmt(totalGainLossPercent)} %`),
        hAlign: "right",
      },
    ]);

    return [
      chalk.cyan("\n🪙 Bitvavo Asset Portfolio"),
      table.toString(),
      "",
    ].join("\n");
  }

  static formatError(error: Error): string {
    return chalk.red(`❌ Error: ${error.message}`);
  }

  static formatLoading(message: string): string {
    return chalk.blue(`⏳ ${message}`);
  }
}
