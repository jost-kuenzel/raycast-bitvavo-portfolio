import { Array, Effect } from 'effect'
import { BitvavoService } from './bitvavo/service.js'
import type { AssetSummary, BitvavoBalance, BitvavoTrade } from './types.js'

export class AssetAnalyzer extends Effect.Service<AssetAnalyzer>()(
  'coiny/AssetAnalyzer',
  {
    accessors: true,
    dependencies: [BitvavoService.Default],
    effect: Effect.gen(function* () {
      const bitvavo = yield* BitvavoService

      const analyzeAssets = () =>
        Effect.gen(function* () {
          // Get current balances
          // Get all trades for analysis
          const [balances, allTrades] = yield* Effect.all(
            [bitvavo.getBalances(), bitvavo.getTrades()],
            { concurrency: 'unbounded' },
          )
          console.log(balances, allTrades)

          // Filter out EUR
          const balancesWithoutEur = Array.filter(
            balances,
            _ => _.symbol != 'EUR',
          )

          // Get current prices for all assets
          const summaries = yield* Effect.forEach(
            balancesWithoutEur,
            analyzeAsset(allTrades),
            { concurrency: 'unbounded' },
          )

          return summaries
        })

      // Helper function to analyze a single asset
      const analyzeAsset =
        (allTrades: BitvavoTrade[]) =>
        (balance: BitvavoBalance): Effect.Effect<AssetSummary, Error> =>
          Effect.gen(function* () {
            const symbol = balance.symbol
            const currentBalance =
              parseFloat(balance.available) + parseFloat(balance.inOrder)

            // Filter trades for this asset and determine the market
            const assetTrades = allTrades.filter(
              trade =>
                trade.market === `${symbol}-EUR` ||
                trade.market === `${symbol}-USDC`,
            )

            // Determine the market from trades or default to EUR
            let market = `${symbol}-EUR`
            if (assetTrades.length > 0) {
              // Use the market from the most recent trade
              const sortedTrades = assetTrades.sort(
                (a, b) => b.timestamp - a.timestamp,
              )
              const mostRecentTrade = sortedTrades[0]
              if (mostRecentTrade) {
                market = mostRecentTrade.market
              }
            } else {
              // If no trades, check if USDC market exists by trying to get ticker
              try {
                yield* bitvavo.getTicker(`${symbol}-USDC`)
                market = `${symbol}-USDC`
              } catch {
                // Default to EUR if USDC ticker fails
                market = `${symbol}-EUR`
              }
            }

            // Calculate purchase and sale totals
            const { totalPurchased, totalSold, totalInvested, totalReceived } =
              calculateTradeTotals(assetTrades)

            // Calculate average buy price
            const averageBuyPrice =
              totalPurchased > 0 ? totalInvested / totalPurchased : 0

            // Get current price
            const ticker = yield* bitvavo.getTicker(market)
            const currentPrice = parseFloat(ticker.price)

            // Calculate current value and gains/losses
            const totalValue = currentBalance * currentPrice
            const netInvestment = totalInvested - totalReceived
            const gainLoss = totalValue - netInvestment
            const gainLossPercent =
              netInvestment > 0 ? (gainLoss / netInvestment) * 100 : 0

            return {
              symbol,
              market,
              currentBalance,
              totalPurchased,
              totalSold,
              averageBuyPrice,
              currentPrice,
              totalValue,
              totalInvested: netInvestment,
              gainLoss,
              gainLossPercent,
            }
          })

      // Helper function to calculate trade totals
      const calculateTradeTotals = (trades: BitvavoTrade[]) => {
        return trades.reduce(
          (acc, trade) => {
            const amount = parseFloat(trade.amount)

            if (trade.side === 'buy') {
              acc.totalPurchased += amount
              // Use sentAmount (EUR spent) for totalInvested instead of amount * price
              acc.totalInvested += parseFloat(trade.sentAmount || '0')
            } else {
              acc.totalSold += amount
              // Use receivedAmount (EUR received) for totalReceived
              acc.totalReceived += parseFloat(trade.receivedAmount || '0')
            }

            return acc
          },
          {
            totalPurchased: 0,
            totalSold: 0,
            totalInvested: 0,
            totalReceived: 0,
          },
        )
      }

      return {
        analyzeAssets,
      }
    }),
  },
) {}
