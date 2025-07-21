import {
  FetchHttpClient,
  HttpClient,
  HttpClientResponse,
} from '@effect/platform'
import { Array, Config, Effect, Order, pipe, Schedule } from 'effect'
import createAuthHeaders from './createAuthHeaders.js'
import { BitvavoApiError } from './errors.js'
import { Balance, TickerPrice, Trades } from './schema.js'

export class BitvavoService extends Effect.Service<BitvavoService>()(
  'coiny/BitvavoService',
  {
    accessors: true,
    dependencies: [FetchHttpClient.layer],
    effect: Effect.gen(function* () {
      const BITVAVO_API_BASE = yield* Config.string('BITVAVO_API_BASE')

      const client = yield* HttpClient.HttpClient
      const retrySchedule = Schedule.intersect(
        Schedule.exponential('100 millis'),
        Schedule.recurs(3),
      )

      /**
       *
       */
      const getBalances = () =>
        Effect.gen(function* () {
          const method = 'GET'
          const endpoint = '/balance'
          const headers = yield* createAuthHeaders(method, endpoint)

          return yield* pipe(
            client.get(`${BITVAVO_API_BASE}${endpoint}`, { headers }),
            Effect.retry(retrySchedule),
            Effect.andThen(HttpClientResponse.schemaBodyJson(Balance)),
            Effect.catchAll(
              error =>
                new BitvavoApiError({
                  method,
                  endpoint,
                  message: error.message,
                }),
            ),
          )
        })

      /**
       *
       */
      const getTrades = (market: string) =>
        Effect.gen(function* () {
          const method = 'GET'
          // @todo use stream paginaton
          const endpoint = `/trades?market=${market}&limit=100`
          const headers = yield* createAuthHeaders('GET', endpoint)

          return yield* pipe(
            client.get(`${BITVAVO_API_BASE}${endpoint}`, { headers }),
            Effect.retry(retrySchedule),
            Effect.andThen(HttpClientResponse.schemaBodyJson(Trades)),
            Effect.catchAll(
              error =>
                new BitvavoApiError({
                  method,
                  endpoint,
                  message: error.message,
                }),
            ),
            Effect.andThen(Array.sortWith(_ => _.timestamp, Order.number)),
          )
        })

      /**
       *
       */
      const getTicker = (market: string) =>
        Effect.gen(function* () {
          const method = 'GET'
          const endpoint = `/ticker/price?market=${market}`

          return yield* pipe(
            client.get(`${BITVAVO_API_BASE}${endpoint}`),
            Effect.retry(retrySchedule),
            Effect.andThen(HttpClientResponse.schemaBodyJson(TickerPrice)),
            Effect.catchAll(
              error =>
                new BitvavoApiError({
                  method,
                  endpoint,
                  message: error.message,
                }),
            ),
          )
        })

      return {
        getBalances,
        getTrades,
        getTicker,
      }
    }),
  },
) {}
