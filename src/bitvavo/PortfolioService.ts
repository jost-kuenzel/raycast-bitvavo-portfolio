import { Array, Effect, pipe } from 'effect'
import { BitvavoService } from './BitvavoService.js'
import { plus, times, divide, enableBoundaryChecking } from 'number-precision'
import { Asset, Summary, Balance } from './schema.js'
enableBoundaryChecking(false)

export class PortfolioService extends Effect.Service<PortfolioService>()(
  'coiny/PortfolioService',
  {
    accessors: true,
    dependencies: [BitvavoService.Default],
    effect: Effect.gen(function* () {
      const bitvavo = yield* BitvavoService

      const getAssetSummary = () =>
        Effect.gen(function* () {
          // Get balances
          const balances = yield* pipe(
            bitvavo.getBalances(),
            Effect.andThen(Array.filter(_ => _.symbol != 'EUR')),
          )

          const assets = yield* Effect.forEach(balances, buildAsset, {
            concurrency: 'unbounded',
          })

          const invested = Array.reduce(assets, 0, (acc, asset) =>
            plus(acc, asset.totalInvested),
          )
          const currentValue = Array.reduce(assets, 0, (acc, asset) =>
            plus(acc, asset.totalValue),
          )
          const gainLoss = Array.reduce(assets, 0, (acc, asset) =>
            plus(acc, asset.gainLoss),
          )
          const gainLossPercent = Array.reduce(assets, 0, (acc, asset) =>
            plus(acc, asset.gainLossPercent),
          )

          return Summary.make({
            totals: {
              invested,
              currentValue,
              gainLoss,
              gainLossPercent,
            },
            assets: assets,
          })
        })

      // Helper function to analyze a single asset
      const buildAsset = (balance: (typeof Balance.Type)[number]) =>
        Effect.gen(function* () {
          const symbol = balance.symbol
          const market = `${symbol}-EUR`
          const currentBalance = parseFloat(balance.available)

          // Determine trades
          const trades = yield* pipe(
            bitvavo.getTrades(market),
            Effect.andThen(Array.filter(trade => trade.side === 'buy')),
          )

          // Calculate total purchased
          const totalPurchased = Array.reduce(trades, 0, (acc, trade) =>
            plus(acc, parseFloat(trade.amount)),
          )

          // Calculate total invested
          const totalInvested = Array.reduce(trades, 0, (acc, trade) =>
            plus(acc, times(parseFloat(trade.amount), parseFloat(trade.price))),
          )

          // Calculate the weigthed average buy price.
          const averageBuyPrice = pipe(
            trades,
            Array.reduce(0, (acc, trade) =>
              plus(
                acc,
                divide(
                  times(parseFloat(trade.amount), parseFloat(trade.price)),
                  totalPurchased,
                ),
              ),
            ),
          )

          // Get current price
          const ticker = yield* bitvavo.getTicker(market)
          const currentPrice = parseFloat(ticker.price)

          // Calculate current value and gains/losses
          const totalValue = currentBalance * currentPrice
          const gainLoss = totalValue - totalInvested
          const gainLossPercent =
            totalInvested > 0 ? times(divide(gainLoss, totalInvested), 100) : 0

          return Asset.make({
            symbol,
            market,
            currentBalance,
            averageBuyPrice,
            currentPrice,
            totalValue,
            totalInvested,
            gainLoss,
            gainLossPercent,
          })
        })

      return {
        getAssetSummary,
      }
    }),
  },
) {}
