import {
  Action,
  ActionPanel,
  Detail,
  getPreferenceValues,
  List,
  openExtensionPreferences,
  showToast,
  Toast,
} from '@raycast/api'
import { ConfigProvider, Effect, Layer, pipe } from 'effect'
import { useEffect, useState } from 'react'
import { AssetAnalyzer } from './lib/asset-analyzer.js'
import { BitvavoClient } from './lib/bitvavo-client.js'
import {
  formatMarketDisplay,
  formatNumber,
  formatSignedCurrencyWithColor,
  formatSignedNumberWithColor,
  getCryptocurrencyIcon,
  getCurrencySymbolFromMarket,
} from './lib/utils.js'
import type { AssetSummary } from './types/bitvavo.js'

interface Preferences {
  bitvavoApiKey: string
  bitvavoApiSecret: string
}

export default function Portfolio() {
  const [assets, setAssets] = useState<AssetSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadPortfolio = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const preferences = getPreferenceValues<Preferences>()

      if (!preferences.bitvavoApiKey || !preferences.bitvavoApiSecret) {
        setError(
          'Please configure your Bitvavo API credentials in extension preferences',
        )
        setIsLoading(false)
        return
      }

      const fetchedAssets = await pipe(
        AssetAnalyzer.analyzeAssets(),
        Effect.provide(
          Layer.mergeAll(BitvavoClient.Default, AssetAnalyzer.Default),
        ),
        Effect.withConfigProvider(
          ConfigProvider.fromMap(
            new Map<string, string>([
              ['BITVAVO_API_KEY', preferences.bitvavoApiKey],
              ['BITVAVO_API_SECRET', preferences.bitvavoApiSecret],
            ]),
          ),
        ),
        Effect.runPromise,
      )

      setAssets(fetchedAssets)
    } catch (err) {
      console.error('Error loading portfolio:', err)
      setError(err instanceof Error ? err.message : 'Failed to load portfolio')
      await showToast({
        style: Toast.Style.Failure,
        title: 'Error loading portfolio',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolio()
  }, [])

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
    )
  }

  const sortedAssets = [...assets].sort((a, b) =>
    a.symbol.localeCompare(b.symbol),
  )

  return (
    <List
      isShowingDetail
      isLoading={isLoading}
      searchBarPlaceholder="Search assets..."
    >
      {sortedAssets.map(asset => {
        const currencySymbol = getCurrencySymbolFromMarket(asset.market)
        const iconPath = getCryptocurrencyIcon(asset.symbol)
        return (
          <List.Item
            key={asset.symbol}
            title={formatMarketDisplay(asset.market)}
            icon={iconPath}
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                      title="Current Price"
                      text={`${currencySymbol}${formatNumber(
                        asset.currentPrice,
                      )}`}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Average Buy Price"
                      text={`${currencySymbol}${formatNumber(
                        asset.averageBuyPrice,
                      )}`}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Balance"
                      text={asset.currentBalance.toString()}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Invested"
                      text={`${currencySymbol}${formatNumber(
                        asset.totalInvested,
                      )}`}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Current Value"
                      text={`${currencySymbol}${formatNumber(
                        asset.totalValue,
                      )}`}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Gain/Loss"
                      text={formatSignedCurrencyWithColor(
                        asset.gainLoss,
                        currencySymbol,
                      )}
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
        )
      })}
      {!isLoading && (
        <List.Item
          key="totals"
          title="Totals"
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Total Value (EUR)"
                    text={`€${formatNumber(
                      assets
                        .filter(asset => asset.market.endsWith('-EUR'))
                        .reduce((sum, asset) => sum + asset.totalValue, 0),
                    )}`}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Total Value (USDC)"
                    text={`$${formatNumber(
                      assets
                        .filter(asset => asset.market.endsWith('-USDC'))
                        .reduce((sum, asset) => sum + asset.totalValue, 0),
                    )}`}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Invested (EUR)"
                    text={`€${formatNumber(
                      assets
                        .filter(asset => asset.market.endsWith('-EUR'))
                        .reduce((sum, asset) => sum + asset.totalInvested, 0),
                    )}`}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Invested (USDC)"
                    text={`$${formatNumber(
                      assets
                        .filter(asset => asset.market.endsWith('-USDC'))
                        .reduce((sum, asset) => sum + asset.totalInvested, 0),
                    )}`}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Gain/Loss (EUR)"
                    text={formatSignedCurrencyWithColor(
                      assets
                        .filter(asset => asset.market.endsWith('-EUR'))
                        .reduce((sum, asset) => sum + asset.gainLoss, 0),
                      '€',
                    )}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Gain/Loss (USDC)"
                    text={formatSignedCurrencyWithColor(
                      assets
                        .filter(asset => asset.market.endsWith('-USDC'))
                        .reduce((sum, asset) => sum + asset.gainLoss, 0),
                      '$',
                    )}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Gain/Loss % (Avg)"
                    text={formatSignedNumberWithColor(
                      assets.length > 0
                        ? assets.reduce(
                            (sum, asset) => sum + asset.gainLossPercent,
                            0,
                          ) / assets.length
                        : 0,
                    )}
                  />
                </List.Item.Detail.Metadata>
              }
            />
          }
        />
      )}
    </List>
  )
}
