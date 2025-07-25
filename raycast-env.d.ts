/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Bitvavo API Key - Your Bitvavo API key from account settings */
  "bitvavoApiKey": string,
  /** Bitvavo API Secret - Your Bitvavo API secret from account settings */
  "bitvavoApiSecret": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `portfolio` command */
  export type Portfolio = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `portfolio` command */
  export type Portfolio = {}
}


declare module "swift:*" {
  function run<T = unknown, U = any>(command: string, input?: U): Promise<T>;
  export default run;
	export class SwiftError extends Error {
    stderr: string;
    stdout: string;
  }
}
