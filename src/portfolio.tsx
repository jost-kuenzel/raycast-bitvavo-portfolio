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
import { Effect } from 'effect'
import { useEffect, useState } from 'react'
import { PortfolioService } from './bitvavo/PortfolioService.js'
import type { Summary } from './bitvavo/schema.js'
import {
  formatMarketDisplay,
  formatNumber,
  formatSignedCurrencyWithColor,
  formatSignedNumberWithColor,
  getCryptocurrencyIcon,
  getCurrencySymbolFromMarket,
} from './utils.js'
import { runPromise } from './bitvavo/Runtime.js'

type SummaryType = typeof Summary.Type

interface Preferences {
  bitvavoApiKey: string
  bitvavoApiSecret: string
}

export default function Portfolio() {
  const [summary, setSummary] = useState<SummaryType | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const preferences = getPreferenceValues<Preferences>()

  const loadPortfolio = async () =>
    runPromise(
      new Map([
        ['BITVAVO_API_BASE', 'https://api.bitvavo.com/v2'],
        ['BITVAVO_API_KEY', preferences.bitvavoApiKey],
        ['BITVAVO_API_SECRET', preferences.bitvavoApiSecret],
      ]),
    )(
      Effect.gen(function* () {
        setIsLoading(true)
        setError(null)
        const fetchedSummary = yield* PortfolioService.getAssetSummary()
        setSummary(fetchedSummary)
        setIsLoading(false)
      }).pipe(
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
      ),
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

  return (
    <List
      isShowingDetail
      isLoading={isLoading}
      searchBarPlaceholder="Search assets..."
    >
      {summary?.assets.map(asset => {
        const currencySymbol = getCurrencySymbolFromMarket(asset.market)
        const iconPath = getCryptocurrencyIcon(asset.symbol)
        return (
          <List.Item
            key={asset.symbol}
            title={formatMarketDisplay(asset.market)}
            icon={iconPath}
            accessories={[
              {
                text: `${currencySymbol} ${formatNumber(asset.currentPrice)}`,
              },
            ]}
            detail={
              <List.Item.Detail
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                      title="Current Price"
                      text={`${currencySymbol} ${formatNumber(
                        asset.currentPrice,
                      )}`}
                    />
                    <List.Item.Detail.Metadata.Separator />
                    <List.Item.Detail.Metadata.Label
                      title="Average Buy Price"
                      text={`${currencySymbol} ${formatNumber(
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
                      text={`${currencySymbol} ${formatNumber(
                        asset.totalInvested,
                      )}`}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Current Value"
                      text={`${currencySymbol} ${formatNumber(
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
      {!isLoading && summary && (
        <List.Item
          key="totals"
          title="Totals"
          detail={
            <List.Item.Detail
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.Label
                    title="Total Value"
                    text={`€${formatNumber(summary.totals.currentValue)}`}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Invested"
                    text={`€${formatNumber(summary.totals.invested)}`}
                  />
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label
                    title="Gain/Loss"
                    text={formatSignedCurrencyWithColor(
                      summary.totals.gainLoss,
                      '€',
                    )}
                  />
                  <List.Item.Detail.Metadata.Label
                    title="Gain/Loss %"
                    text={formatSignedNumberWithColor(
                      summary.totals.gainLossPercent,
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
