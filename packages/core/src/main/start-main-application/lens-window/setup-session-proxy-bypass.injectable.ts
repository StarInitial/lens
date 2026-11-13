/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { session } from "electron";
import { loggerInjectionToken } from "@k8slens/logger";

export type SetupSessionProxyBypass = () => Promise<void>;

/**
 * The application renderer (and its cluster frames) is served on
 * `https://lens.app:<port>` by the Lens proxy. Chromium resolves proxies before it
 * connects and only bypasses implicitly for `localhost` and literal loopback
 * addresses, so on machines with a system proxy configured the main window was
 * routed through that proxy and failed to load with `ERR_CONNECTION_CLOSED`.
 *
 * A proxy bypass cannot be expressed with a command line switch: Chromium only
 * evaluates `--proxy-bypass-list` together with `--proxy-server`. The system
 * configuration is therefore read back with `resolveProxy()` and re-applied as a
 * `fixed_servers` proxy that has the Lens origins in its bypass list, so the
 * system proxy keeps working for everything else.
 */
const setupSessionProxyBypassInjectable = getInjectable({
  id: "setup-session-proxy-bypass",

  instantiate: (di): SetupSessionProxyBypass => {
    const logger = di.inject(loggerInjectionToken);
    let configured: Promise<void> | undefined;

    return () => (configured ??= (async () => {
      try {
        // `resolveProxy` reports the proxy in PAC syntax, e.g. `DIRECT` or
        // `PROXY 127.0.0.1:7890`. `proxyRules` of `fixed_servers` expects server
        // specs instead, so the PAC prefixes are stripped. Feeding `DIRECT` into
        // `proxyRules` would make Chromium use a proxy literally named "DIRECT".
        const pacResult = await session.defaultSession.resolveProxy("https://lens.app");
        const proxyRules = pacResult
          .split(";")
          .map(entry => entry.trim())
          .filter(entry => entry && entry.toUpperCase() !== "DIRECT")
          .map(entry => entry
            .replace(/^PROXY\s+/i, "")
            .replace(/^HTTPS\s+/i, "https://")
            .replace(/^SOCKS5\s+/i, "socks5://")
            .replace(/^SOCKS4\s+/i, "socks4://")
            .replace(/^SOCKS\s+/i, "socks://"))
          .join(",");

        if (!proxyRules) {
          await session.defaultSession.setProxy({ mode: "direct" });
          logger.info("[PROXY-BYPASS]: no system proxy detected, Chromium connects directly");

          return;
        }

        await session.defaultSession.setProxy({
          mode: "fixed_servers",
          proxyRules,
          proxyBypassRules: [
            "lens.app",
            "*.lens.app",
            "<local>",
            "127.0.0.1/8",
            "[::1]",
          ].join(","),
        });

        logger.info(`[PROXY-BYPASS]: system proxy "${proxyRules}" kept, Lens origins bypass it`);
      } catch (error) {
        logger.error("[PROXY-BYPASS]: failed to configure the session proxy bypass", { error });
      }
    })());
  },
});

export default setupSessionProxyBypassInjectable;
