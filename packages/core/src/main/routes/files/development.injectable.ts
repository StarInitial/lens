/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import httpProxy from "http-proxy";
import path from "path";
import { webpackDevServerPort } from "../../../../webpack/vars";
import type { LensApiRequest, RouteResponse } from "../../router/route";
import { loggerInjectionToken } from "@k8slens/logger";
import type { ServerResponse } from "http";

const devStaticFileRouteHandlerInjectable = getInjectable({
  id: "dev-static-file-route-handler",
  instantiate: (di) => {
    const logger = di.inject(loggerInjectionToken);
    const proxy = httpProxy.createProxy();
    const proxyTarget = `http://127.0.0.1:${webpackDevServerPort}`;

    /**
     * Without an `error` listener the emitter throws, which used to be a logged
     * warning and is a fatal uncaught exception in the main process since Electron 44
     * (Node 24). The dev server can legitimately be unavailable while it compiles.
     */
    proxy.on("error", (error, _req, res) => {
      logger.warn(`[FILE-ROUTE]: webpack dev server is not reachable at ${proxyTarget}`, { error });

      if (res && "writeHead" in res && !(res as ServerResponse).headersSent) {
        const serverResponse = res as ServerResponse;

        serverResponse.writeHead(502, { "Content-Type": "text/html; charset=utf-8" });
        serverResponse.end([
          "<!doctype html><html><head><meta charset=\"utf-8\">",
          "<meta http-equiv=\"refresh\" content=\"2\">",
          "<title>Waiting for the dev server</title></head>",
          "<body style=\"font-family: system-ui, sans-serif; padding: 2rem\">",
          `<h3>The webpack dev server at ${proxyTarget} is not reachable yet.</h3>`,
          "<p>It is probably still compiling. This page retries every 2 seconds.</p>",
          "</body></html>",
        ].join(""));
      } else if (res && "destroy" in res) {
        (res as unknown as { destroy: () => void }).destroy();
      }
    });

    return async ({ raw: { req, res }, params }: LensApiRequest<"/{path*}">): Promise<RouteResponse<Buffer>> => {
      const filePath = (!params.path || params.path === "/")
        ? "/build/index.html"
        : path.posix.extname(params.path)
          ? params.path
          : "/build/index.html";

      req.url = filePath;

      proxy.web(req, res, { target: proxyTarget });

      return { proxy };
    };
  },
});

export default devStaticFileRouteHandlerInjectable;
