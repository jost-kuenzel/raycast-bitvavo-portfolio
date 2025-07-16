import {
  Detail,
  ActionPanel,
  Action,
  openExtensionPreferences,
  getPreferenceValues,
  showToast,
  Toast,
} from "@raycast/api";
import { useState, useEffect } from "react";
import { Effect, Runtime } from "effect";
import { createBitvavoClientLayer } from "./lib/bitvavo-client.js";
import { AssetAnalyzer } from "./lib/asset-analyzer.js";
import { MarkdownFormatter } from "./lib/markdown-formatter.js";
import type { AssetSummary } from "./types/bitvavo.js";

interface Preferences {
  bitvavoApiKey: string;
  bitvavoApiSecret: string;
}

export default function Portfolio() {
  const [markdown, setMarkdown] = useState<string>("Loading your portfolio...");
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

      // Use credentials from preferences
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
      const assets = await Runtime.runPromise(runtime)(program);
      const formattedMarkdown = MarkdownFormatter.formatAssetSummary(assets);
      setMarkdown(formattedMarkdown);
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

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action title="Refresh Portfolio" onAction={loadPortfolio} />
          <Action
            title="Open Extension Preferences"
            onAction={openExtensionPreferences}
          />
        </ActionPanel>
      }
    />
  );
}
