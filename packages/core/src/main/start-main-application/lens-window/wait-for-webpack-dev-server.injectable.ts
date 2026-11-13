/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import net from "net";
import { webpackDevServerPort } from "../../../../webpack/vars";
import isDevelopmentInjectable from "../../../common/vars/is-development.injectable";
import { loggerInjectionToken } from "@k8slens/logger";

export type WaitForWebpackDevServer = () => Promise<void>;

const retryIntervalMs = 500;
const timeoutMs = 5 * 60 * 1000;

const canConnect = () => new Promise<boolean>(resolve => {
  const socket = net.connect({ host: "127.0.0.1", port: webpackDevServerPort });

  socket.once("connect", () => {
    socket.destroy();
    resolve(true);
  });
  socket.once("error", () => {
    socket.destroy();
    resolve(false);
  });
});

/**
 * In development the renderer is served by the webpack dev server, and the Lens
 * proxy forwards every static file request to it. Electron is started in parallel
 * with the dev server, so without this the first navigation hits a closed port and
 * fails with `ECONNREFUSED`, leaving the window on an error page.
 */
const waitForWebpackDevServerInjectable = getInjectable({
  id: "wait-for-webpack-dev-server",

  instantiate: (di): WaitForWebpackDevServer => {
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const logger = di.inject(loggerInjectionToken);
    let ready: Promise<void> | undefined;

    return () => (ready ??= (async () => {
      if (!isDevelopment) {
        return;
      }

      const startedAt = Date.now();

      logger.info(`[DEV-SERVER]: waiting for http://127.0.0.1:${webpackDevServerPort} ...`);

      while (!(await canConnect())) {
        if (Date.now() - startedAt > timeoutMs) {
          logger.error(`[DEV-SERVER]: http://127.0.0.1:${webpackDevServerPort} did not come up within ${timeoutMs} ms`);

          return;
        }

        await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
      }

      logger.info(`[DEV-SERVER]: ready after ${Date.now() - startedAt} ms`);
    })());
  },
});

export default waitForWebpackDevServerInjectable;
