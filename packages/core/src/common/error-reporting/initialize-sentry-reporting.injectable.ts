/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Event as SentryEvent } from "@sentry/electron/main";
import isProductionInjectable from "../vars/is-production.injectable";
import sentryDataSourceNameInjectable from "../vars/sentry-dsn-url.injectable";
import { inspect } from "util";
import userPreferencesStateInjectable from "../../features/user-preferences/common/state.injectable";

/**
 * `init` of `@sentry/electron` is overloaded per process (main vs renderer), so the
 * callback is typed with a `never` parameter: every concrete `init` is assignable
 * to it and the cast to the concrete options stays in the single place below.
 */
export type InitializeSentryReportingWith = (initSentry: (opts: never) => void) => void;

/**
 * Electron 44 can also report `service-worker` as the process type.
 */
const mapProcessName = (type: "browser" | "renderer" | "worker" | "utility" | "service-worker") => type === "browser" ? "main" : type;

const initializeSentryReportingWithInjectable = getInjectable({
  id: "initialize-sentry-reporting-with",
  instantiate: (di): InitializeSentryReportingWith => {
    const sentryDataSourceName = di.inject(sentryDataSourceNameInjectable);
    const isProduction = di.inject(isProductionInjectable);
    const state = di.inject(userPreferencesStateInjectable);

    if (!sentryDataSourceName) {
      return () => {};
    }

    /**
     * The same options are handed to either the main or the renderer `init` of
     * `@sentry/electron` depending on which process injects this. The runtime shape
     * is shared, only the parameter type of `init` differs per process, so the
     * options are built once and narrowed at the call below.
     */
    const options = {
      beforeSend: (event: SentryEvent) => {
        if (state.allowErrorReporting) {
          return event;
        }

        /**
         * Directly write to stdout so that no other integrations capture this and create an infinite loop
         */
        process.stdout.write(`🔒  [SENTRY-BEFORE-SEND-HOOK]: Sentry event is caught but not sent to server.`);
        process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: === START OF SENTRY EVENT ===");
        process.stdout.write(inspect(event, false, null, true));
        process.stdout.write("🔒  [SENTRY-BEFORE-SEND-HOOK]: ===  END OF SENTRY EVENT  ===");

        // if return null, the event won't be sent
        // ref https://github.com/getsentry/sentry-javascript/issues/2039
        return null;
      },
      dsn: sentryDataSourceName,
      /**
       * `@sentry/electron` v8 (Sentry JS v8) ships the dedupe integration as part
       * of its default integrations, and the offline caching that the removed
       * `Offline` integration of `@sentry/integrations` provided is now available
       * as a transport (`makeElectronOfflineTransport`). Nothing has to be wired
       * up here, the defaults already cover the behaviour of the previous setup.
       */
      initialScope: {
        tags: {
          "process": mapProcessName(process.type),
        },
      },
      environment: isProduction ? "production" : "development",
    };

    return (initSentry) => initSentry(options as unknown as never);
  },
  causesSideEffects: true,
});

export default initializeSentryReportingWithInjectable;
