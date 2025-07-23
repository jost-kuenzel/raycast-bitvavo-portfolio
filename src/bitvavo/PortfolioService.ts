import { Array, Effect, pipe } from 'effect'
import type { BitvavoBalance } from '../types.js'
import { BitvavoService } from './BitvavoService.js'
import { plus, times, divide, enableBoundaryChecking } from 'number-precision'
enableBoundaryChecking(false)

export class PortfolioService extends Effect.Service<PortfolioService>()(
  'coiny/PortfolioService',
  {
    accessors: true,
    dependencies: [BitvavoService.Default],
    effect: Effect.gen(function* () {
      const bitvavo = yield* BitvavoService

      const getAssets = () =>
        Effect.gen(function* () {
          // Get balances
          const balances = yield* pipe(
            bitvavo.getBalances(),
            Effect.andThen(Array.filter(_ => _.symbol != 'EUR')),
          )

          const summaries = yield* Effect.forEach(balances, summarize, {
            concurrency: 'unbounded',
          })

          return summaries
        })

      // Helper function to analyze a single asset
      const summarize = (balance: BitvavoBalance) =>
        Effect.gen(function* () {
          const symbol = balance.symbol
          const market = `${symbol}-EUR`
          const currentBalance = parseFloat(balance.available)

          // Filter trades for this asset and determine the market
          const assetTrades = yield* bitvavo.getTrades(`${symbol}-EUR`)

          // Calculate total purchased
          const totalPurchased = Array.reduce(assetTrades, 0, (acc, trade) =>
            plus(acc, trade.side === 'buy' ? parseFloat(trade.amount) : 0),
          )

          // Calculate total invested
          const totalInvested = Array.reduce(assetTrades, 0, (acc, trade) =>
            plus(
              acc,
              trade.side === 'buy'
                ? times(parseFloat(trade.amount), parseFloat(trade.price))
                : 0,
            ),
          )

          // Calculate average buy price
          const averageBuyPrice =
            totalPurchased > 0 ? divide(totalInvested, totalPurchased) : 0

          // Get current price
          const ticker = yield* bitvavo.getTicker(market)
          const currentPrice = parseFloat(ticker.price)

          // Calculate current value and gains/losses
          const totalValue = currentBalance * currentPrice
          const gainLoss = totalValue - totalInvested
          const gainLossPercent =
            totalInvested > 0 ? times(divide(gainLoss, totalInvested), 100) : 0

          return {
            symbol,
            market,
            balance: currentBalance,
            averageBuyPrice,
            currentPrice,
            totalValue,
            totalInvested,
            gainLoss,
            gainLossPercent,
          }
        })

      return {
        getAssets,
      }
    }),
  },
) {}
