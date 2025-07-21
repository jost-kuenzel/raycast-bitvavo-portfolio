import { FetchHttpClient } from '@effect/platform'
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
import { ConfigProvider, Effect, Layer } from 'effect'
import { useEffect, useState } from 'react'
import { BitvavoService } from './bitvavo/BitvavoService.js'
import { PortfolioService } from './bitvavo/PortfolioService.js'
import type { AssetSummary } from './types.js'
import {
  formatMarketDisplay,
  formatNumber,
  formatSignedCurrencyWithColor,
  formatSignedNumberWithColor,
  getCryptocurrencyIcon,
  getCurrencySymbolFromMarket,
} from './utils.js'

interface Preferences {
  bitvavoApiKey: string
  bitvavoApiSecret: string
}

export default function Portfolio() {
  const [assets, setAssets] = useState<AssetSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const preferences = getPreferenceValues<Preferences>()

  const loadPortfolio = async () =>
    Effect.gen(function* () {
      setIsLoading(true)
      setError(null)

      const fetchedAssets = yield* PortfolioService.getAssets()

      setAssets(fetchedAssets)
      setIsLoading(false)
    })
      .pipe(
        // error handling
        Effect.catchAll(error => {
          setIsLoading(false)
          setError(error.message)
          console.error(error)
          return Effect.promise(() =>
            showToast({
              style: Toast.Style.Failure,
              title: 'Error loading portfolio',
              message: error instanceof Error ? error.message : 'Unknown error',
            }),
          )
        }),
      )
      .pipe(
        // running
        Effect.provide(
          Layer.mergeAll(
            FetchHttpClient.layer,
            BitvavoService.Default,
            PortfolioService.Default,
          ),
        ),
        Effect.withConfigProvider(
          ConfigProvider.fromMap(
            new Map<string, string>([
              ['BITVAVO_API_BASE', 'https://api.bitvavo.com/v2'],
              ['BITVAVO_API_KEY', preferences.bitvavoApiKey],
              ['BITVAVO_API_SECRET', preferences.bitvavoApiSecret],
            ]),
          ),
        ),
        Effect.runPromise,
      )

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
