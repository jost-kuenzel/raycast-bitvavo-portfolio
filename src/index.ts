#!/usr/bin/env node

import { Effect, Console, Runtime, Exit } from "effect";
import { Command } from "commander";
import { BitvavoClientLive } from "./lib/bitvavo-client.js";
import { AssetAnalyzer } from "./lib/asset-analyzer.js";
import { OutputFormatter } from "./lib/output-formatter.js";

const program = new Command();

program
  .name("coiny")
  .description("A CLI tool to track your Bitvavo cryptocurrency assets")
  .version("1.0.0");

program
  .command("assets")
  .description("List your cryptocurrency assets with gain/loss analysis")
  .action(() => {
    const program = Effect.gen(function* () {
      yield* Console.log(
        OutputFormatter.formatLoading("Fetching your Bitvavo assets..."),
      );

      const assets = yield* AssetAnalyzer.analyzeAssets;

      yield* Console.log(OutputFormatter.formatAssetSummary(assets));
    }).pipe(
      Effect.provide(BitvavoClientLive),
      Effect.catchAll((error) =>
        Console.log(OutputFormatter.formatError(error as Error)),
      ),
    );

    const runtime = Runtime.defaultRuntime;
    Runtime.runPromise(runtime)(program).catch((error) => {
      console.error(OutputFormatter.formatError(error));
      process.exit(1);
    });
  });

// Add default command
program.action(() => {
  const program = Effect.gen(function* () {
    yield* Console.log(
      OutputFormatter.formatLoading("Fetching your Bitvavo assets..."),
    );

    const assets = yield* AssetAnalyzer.analyzeAssets;

    yield* Console.log(OutputFormatter.formatAssetSummary(assets));
  }).pipe(
    Effect.provide(BitvavoClientLive),
    Effect.catchAll((error) =>
      Console.log(OutputFormatter.formatError(error as Error)),
    ),
  );

  const runtime = Runtime.defaultRuntime;
  Runtime.runPromise(runtime)(program).catch((error) => {
    console.error(OutputFormatter.formatError(error));
    process.exit(1);
  });
});

program.parse(process.argv);
