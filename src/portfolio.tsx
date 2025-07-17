import {
  List,
  Detail,
  ActionPanel,
  Action,
  openExtensionPreferences,
  getPreferenceValues,
  showToast,
  Toast,
  Color,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { Effect, Runtime } from "effect";
import { createBitvavoClientLayer } from "./lib/bitvavo-client.js";
import { AssetAnalyzer } from "./lib/asset-analyzer.js";
import type { AssetSummary } from "./types/bitvavo.js";

interface Preferences {
  bitvavoApiKey: string;
  bitvavoApiSecret: string;
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatSignedNumber = (value: number) => {
  const formattedValue = formatNumber(Math.abs(value));
  return value >= 0 ? `+ ${formattedValue}` : `- ${formattedValue}`;
};

const formatSignedCurrency = (value: number) => {
  const formattedValue = formatNumber(Math.abs(value));
  return value >= 0 ? `+ €${formattedValue}` : `- €${formattedValue}`;
};

const formatSignedCurrencyWithColor = (value: number) => {
  const formattedValue = formatNumber(Math.abs(value));
  const color = value >= 0 ? Color.Green : Color.Red;
  const sign = value >= 0 ? "+ €" : "- €";
  return { color, value: `${sign}${formattedValue}` };
};

const formatSignedNumberWithColor = (value: number) => {
  const formattedValue = formatNumber(Math.abs(value));
  const color = value >= 0 ? Color.Green : Color.Red;
  const sign = value >= 0 ? "+ " : "- ";
  return { color, value: `${sign}${formattedValue}` };
};

export default function Portfolio() {
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const preferences = getPreferenceValues<Preferences>();

      if (!preferences.bitvavoApiKey || !preferences.bitvavoApiSecret) {
        setError(
          "Please configure your Bitvavo API credentials in extension preferences",
        );
        setIsLoading(false);
        return;
      }

      const bitvavoClientLayer = createBitvavoClientLayer(
        preferences.bitvavoApiKey,
        preferences.bitvavoApiSecret,
      );

      const program = Effect.gen(function* () {
        const assets = yield* AssetAnalyzer.analyzeAssets;
        return assets;
      }).pipe(
        Effect.provide(bitvavoClientLayer),
        Effect.catchAll((error) => Effect.fail(error as Error)),
      );

      const runtime = Runtime.defaultRuntime;
      const fetchedAssets = await Runtime.runPromise(runtime)(program);
      setAssets(fetchedAssets);
    } catch (err) {
      console.error("Error loading portfolio:", err);
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
      await showToast({
        style: Toast.Style.Failure,
        title: "Error loading portfolio",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  if (error) {
    return (
      <Detail
        markdown={`# ❌ Error\n\n${error}`}
        actions={
          <ActionPanel>
            <Action
              title="Open Extension Preferences"
              onAction={openExtensionPreferences}
            />
            <Action title="Retry" onAction={loadPortfolio} />
          </ActionPanel>
        }
      />
    );
  }

  const sortedAssets = [...assets].sort((a, b) =>
    a.symbol.localeCompare(b.symbol),
  );

  return (
    <List
      isShowingDetail
      isLoading={isLoading}
      searchBarPlaceholder="Search assets..."
    >
      {sortedAssets.map((asset) => (
        <List.Item
          key={asset.symbol}
          title={asset.symbol}
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Current Price"
                    text={`€${formatNumber(asset.currentPrice)}`}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Average Buy Price"
                    text={`€${formatNumber(asset.averageBuyPrice)}`}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Balance"
                    text={asset.currentBalance.toString()}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Invested"
                    text={`€${formatNumber(asset.totalInvested)}`}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Current Value"
                    text={`€${formatNumber(asset.totalValue)}`}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Gain/Loss"
                    text={formatSignedCurrencyWithColor(asset.gainLoss)}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Gain/Loss %"
                    text={formatSignedNumberWithColor(asset.gainLossPercent)}
                  />
                </List.Item.Detail.Metadata>
              }
            />
          }
        />
      ))}
      {!isLoading && (
        <List.Item
          key="totals"
          title="Totals"
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Total Value"
                    text={`€${formatNumber(
                      assets.reduce((sum, asset) => sum + asset.totalValue, 0),
                    )}`}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Invested"
                    text={`€${formatNumber(
                      assets.reduce(
                        (sum, asset) => sum + asset.totalInvested,
                        0,
                      ),
                    )}`}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Gain/Loss"
                    text={formatSignedCurrencyWithColor(
                      assets.reduce((sum, asset) => sum + asset.gainLoss, 0),
                    )}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Gain/Loss %"
                    text={formatSignedNumberWithColor(
                      assets.reduce(
                        (sum, asset) => sum + asset.gainLossPercent,
                        0,
                      ) / assets.length,
                    )}
                  />
                </List.Item.Detail.Metadata>
              }
            />
          }
        />
      )}
    </List>
  );
}
