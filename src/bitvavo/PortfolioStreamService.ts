import {
  Array,
  Chunk,
  Config,
  Console,
  Effect,
  Fiber,
  Order,
  pipe,
  PubSub,
  Schedule,
  Schema,
  Stream,
} from 'effect'
import { BitvavoSdkError } from './errors'
import { getSummary } from './getSummary'
import { Balance, Ticker24h, Trades } from './schema'

export class PortfolioStreamService extends Effect.Service<PortfolioStreamService>()(
  'coiny/PortfolioStreamService',
  {
    accessors: true,
    dependencies: [],
    effect: Effect.gen(function* () {
      const apiKey = yield* Config.string('BITVAVO_API_KEY')
      const apiSecret = yield* Config.string('BITVAVO_API_SECRET')
      const apiRestUrl = yield* Config.string('BITVAVO_API_REST_URL')
      const apiWsUrl = yield* Config.string('BITVAVO_API_WS_URL')

      const bitvavo = require('bitvavo')().options({
        APIKEY: apiKey,
        APISECRET: apiSecret,
        ACCESSWINDOW: 10000,
        RESTURL: apiRestUrl,
        WSURL: apiWsUrl,
        DEBUGGING: false,
      })

      const retrySchedule = Schedule.intersect(
        Schedule.exponential('100 millis'),
        Schedule.recurs(3),
      )

      const balance = yield* pipe(
        Effect.tryPromise({
          try: () => bitvavo.balance(),
          catch: err =>
            Effect.fail(
              new BitvavoSdkError({
                method: 'balance',
                message: 'unknown',
              }),
            ),
        }),
        Effect.retry(retrySchedule),
        Effect.andThen(Schema.decodeUnknown(Balance)),
        Effect.andThen(Array.sortWith(b => b.symbol, Order.string)),
        Effect.andThen(Array.filter(_ => _.symbol !== 'EUR')),
      )

      // derive markets from balances
      const markets = Array.map(balance, _ => `${_.symbol}-EUR`)

      // Determine trades
      const allTrades = yield* pipe(
        Effect.forEach(markets, market =>
          pipe(
            Effect.promise(() => bitvavo.trades(market)),
            Effect.andThen(Schema.decodeUnknownSync(Trades)),
            Effect.andThen(Array.filter(trade => trade.side === 'buy')),
          ),
        ),
        Effect.andThen(Array.flatten),
      )

      // create a Ref of a Map of market to current price
      const currentPricesMap = new Map<string, number>()

      // use a pubsub to notify on price updates
      const pubsub = yield* PubSub.unbounded<number>()

      const setup = () =>
        Effect.gen(function* () {
          // Initialize WebSocket connection
          yield* Effect.promise(() => bitvavo.websocket.checkSocket())

          // log WebSocket errors
          const wsErrorLogFiber = yield* pipe(
            Stream.async(emit => {
              bitvavo.getEmitter().on('error', (error: any) => {
                emit(Effect.succeed(Chunk.of(error)))
              })
            }),
            Stream.tap(error => {
              console.error('WebSocket error:', error)
              return Effect.void
            }),
            Stream.runDrain,
            Effect.forkDaemon,
          )

          // use the ticker stream to update the current prices ref
          const tickerFiber = yield* pipe(
            Array.map(markets, market =>
              pipe(
                Stream.async(emit => {
                  bitvavo.websocket.subscriptionTicker24h(
                    market,
                    (response: any) => {
                      emit(Effect.succeed(Chunk.of(response)))
                    },
                  )
                }),
                Stream.filter(Schema.is(Ticker24h)),
                Stream.map(Schema.decodeUnknownSync(Ticker24h)),
              ),
            ),
            Stream.mergeAll({ concurrency: 'unbounded' }),
            Stream.tap(_ => {
              currentPricesMap.set(_.market, parseFloat(_.bid))
              return PubSub.publish(pubsub, _.timestamp)
            }),
            Stream.runDrain,
            Effect.forkDaemon,
            Effect.onInterrupt(() => Console.log('Ticker stream interrupted')),
          )

          //yield* Effect.addFinalizer(exit =>
          //  Effect.gen(function* () {
          //    console.log('finalizing..', exit)
          //    yield* Fiber.interrupt(tickerFiber)
          //    yield* Fiber.interrupt(wsErrorLogFiber)
          //    console.log('..finalized')
          //  }),
          //)

          // consume the pubsub stream to update the summary
          return Stream.fromPubSub(pubsub).pipe(
            Stream.map(_ => {
              return getSummary(balance, allTrades)(currentPricesMap)
            }),
          )
        }).pipe(Effect.scoped)

      return { setup }
    }),
  },
) {}
