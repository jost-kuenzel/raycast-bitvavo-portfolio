import type { AxiosInstance } from 'axios'
import axios from 'axios'
import crypto from 'crypto'
import { Config, Effect } from 'effect'
import type {
  BitvavoBalance,
  BitvavoCredentials,
  BitvavoTicker,
  BitvavoTrade,
} from '../types/bitvavo.js'

export class BitvavoClient extends Effect.Service<BitvavoClient>()(
  'coiny/BitvavoClient',
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const BITVAVO_API_BASE = 'https://api.bitvavo.com/v2'

      function createSignature(
        timestamp: number,
        method: string,
        url: string,
        body: string,
        apiSecret: string,
      ): string {
        const message = timestamp + method + url + body
        return crypto
          .createHmac('sha256', apiSecret)
          .update(message)
          .digest('hex')
      }

      function createAuthHeaders(
        method: string,
        endpoint: string,
        body: string,
        credentials: BitvavoCredentials,
      ) {
        const timestamp = Date.now()
        const url = `/v2${endpoint}`
        const signature = createSignature(
          timestamp,
          method,
          url,
          body,
          credentials.apiSecret,
        )

        return {
          'Bitvavo-Access-Key': credentials.apiKey,
          'Bitvavo-Access-Signature': signature,
          'Bitvavo-Access-Timestamp': timestamp.toString(),
          'Content-Type': 'application/json',
        }
      }

      const apiKey = yield* Config.string('BITVAVO_API_KEY')
      const apiSecret = yield* Config.string('BITVAVO_API_SECRET')

      const credentials: BitvavoCredentials = { apiKey, apiSecret }
      const client: AxiosInstance = axios.create({
        baseURL: BITVAVO_API_BASE,
        timeout: 10000,
      })

      /**
       *
       */
      const getBalances = Effect.gen(function* () {
        const endpoint = '/balance'
        const headers = createAuthHeaders('GET', endpoint, '', credentials)

        const response = yield* Effect.tryPromise({
          try: () => client.get<BitvavoBalance[]>(endpoint, { headers }),
          catch: error => new Error(`Failed to fetch balances: ${error}`),
        })

        return response.data
      })

      /**
       *
       */
      const getTrades = (market?: string) =>
        Effect.gen(function* () {
          // Get all executed trades from /trades endpoint for each market
          const markets = ['BTC-EUR', 'XRP-EUR', 'ETH-EUR']
          const allTrades: BitvavoTrade[] = []

          for (const tradeMarket of markets) {
            if (market && tradeMarket !== market) continue

            const endpoint = `/trades?market=${tradeMarket}&limit=100`
            const headers = createAuthHeaders('GET', endpoint, '', credentials)

            const response = yield* Effect.tryPromise({
              try: () => client.get<any[]>(endpoint, { headers }),
              catch: error =>
                new Error(
                  `Failed to fetch trades for ${tradeMarket}: ${error}`,
                ),
            })

            const trades = response.data.map((trade: any) => ({
              id: trade.id,
              timestamp: trade.timestamp,
              market: trade.market,
              side: trade.side,
              amount: trade.amount,
              price: trade.price,
              taker: trade.taker,
              fee: trade.fee,
              feeCurrency: trade.feeCurrency,
              settled: trade.settled,
              // Calculate sent/received amounts based on the trade
              sentAmount:
                trade.side === 'buy'
                  ? (
                      parseFloat(trade.amount) * parseFloat(trade.price)
                    ).toString()
                  : trade.amount,
              receivedAmount:
                trade.side === 'buy'
                  ? trade.amount
                  : (
                      parseFloat(trade.amount) * parseFloat(trade.price)
                    ).toString(),
            }))

            allTrades.push(...trades)
          }

          return allTrades.sort((a, b) => b.timestamp - a.timestamp)
        })

      /**
       *
       */
      const getTicker = (market: string) =>
        Effect.gen(function* () {
          // Use ticker/24h endpoint to get current price
          const endpoint = `/ticker/24h?market=${market}`

          const response = yield* Effect.tryPromise({
            try: () => client.get<any>(endpoint),
            catch: error =>
              new Error(`Failed to fetch ticker for ${market}: ${error}`),
          })

          return {
            market,
            price: response.data.last,
            timestamp: response.data.timestamp,
          } as BitvavoTicker
        })

      return {
        getBalances,
        getTrades,
        getTicker,
      }
    }),
  },
) {}
