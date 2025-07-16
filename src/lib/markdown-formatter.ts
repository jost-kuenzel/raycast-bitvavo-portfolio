export class MarkdownFormatter {
  static formatAssetSummary(assets: { [key: string]: any }[]): string {
    return assets
      .map((asset) => {
        const rows = Object.entries(asset)
          .map(([key, value]) => `| **${key}** | ${value} |`)
          .join("\n");

        return (
          `### Asset: ${asset.symbol || "Totals"}\n\n` +
          `| **Property** | **Value** |\n` +
          `|--------------|-----------|\n` +
          rows
        );
      })
      .join("\n\n");
  }
}
