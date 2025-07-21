import { Array, Effect, pipe } from 'effect'
import type { AssetSummary, BitvavoBalance, BitvavoTrade } from '../types.js'
import { BitvavoService } from './BitvavoService.js'

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
          const currentBalance =
            parseFloat(balance.available) + parseFloat(balance.inOrder)

          // Filter trades for this asset and determine the market
          const assetTrades = yield* bitvavo.getTrades(`${symbol}-EUR`)

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
      const calculateTradeTotals = (trades: BitvavoTrade[]) =>
        trades.reduce(
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

      return {
        getAssets,
      }
    }),
  },
) {}
