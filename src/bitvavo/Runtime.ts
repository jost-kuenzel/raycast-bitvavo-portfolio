import { FetchHttpClient } from '@effect/platform'
import { ConfigProvider, Effect, Layer, ManagedRuntime, pipe } from 'effect'
import { BitvavoService } from './BitvavoService'
import { PortfolioService } from './PortfolioService'

export const runPromise =
  (config: Map<string, string>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    pipe(
      effect,
      Effect.provide(
        Layer.mergeAll(
          FetchHttpClient.layer,
          BitvavoService.Default,
          PortfolioService.Default,
        ),
      ),
      Effect.withConfigProvider(ConfigProvider.fromMap(config)),
      _ => _ as Effect.Effect<A, E, never>,
      Effect.runPromise,
    )
