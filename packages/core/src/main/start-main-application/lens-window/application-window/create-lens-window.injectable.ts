/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { ContentSource, ElectronWindowTitleBarStyle } from "./create-electron-window.injectable";
import createElectronWindowInjectable from "./create-electron-window.injectable";
import setupSessionProxyBypassInjectable from "../setup-session-proxy-bypass.injectable";
import waitForWebpackDevServerInjectable from "../wait-for-webpack-dev-server.injectable";
import type { ClusterFrameInfo } from "../../../../common/cluster-frames.injectable";

export interface ElectronWindow {
  show: () => void;
  close: () => void;
  send: (args: SendToViewArgs) => void;
  loadFile: (filePath: string) => Promise<void>;
  loadUrl: (url: string) => Promise<void>;
  reload: () => void;
}

export interface SendToViewArgs {
  channel: string;
  frameInfo?: ClusterFrameInfo;
  data?: unknown;
}

export interface LensWindow {
  id: string;
  start: () => Promise<void>;
  close: () => void;
  show: () => void;
  send: (args: SendToViewArgs) => void;
  isVisible: boolean;
  isStarting: boolean;
  reload: () => void;
}

export interface LensWindowConfiguration {
  id: string;
  title: string;
  defaultHeight: number;
  defaultWidth: number;
  getContentSource: () => ContentSource;
  resizable: boolean;
  windowFrameUtilitiesAreShown: boolean;
  centered: boolean;
  titleBarStyle?: ElectronWindowTitleBarStyle;

  /**
   * This function is called before the ContentSource is used and then awaited after
   * the open call resolves
   */
  beforeOpen?: () => Promise<void>;
  onFocus?: () => void;
  onBlur?: () => void;
  onDomReady?: () => void;
  onClose?: () => void;
}

const createLensWindowInjectable = getInjectable({
  id: "create-lens-window",

  instantiate: (di) => {
    const createElectronWindow = di.inject(createElectronWindowInjectable);
    const logger = di.inject(loggerInjectionToken);
    const setupSessionProxyBypass = di.inject(setupSessionProxyBypassInjectable);
    const waitForWebpackDevServer = di.inject(waitForWebpackDevServerInjectable);

    return (configuration: LensWindowConfiguration): LensWindow => {
      /**
       * Electron 44 runs the main process on Node 24, where an unhandled promise
       * rejection terminates the entire process. A rejected `loadURL` used to be
       * survivable; now it kills the app before the window is shown ("no window and
       * no obvious error"). Failures are handled here instead, the detailed reason
       * is logged by the `did-fail-load` handler of the window.
       */
      const logFailedNavigation = (error: unknown, content: string) => {
        logger.error(`[LENS-WINDOW]: Failed to load content "${content}" for window "${configuration.id}"`, { error });
      };

      let browserWindow: ElectronWindow | undefined;

      let windowIsShown = false;
      let windowIsStarting = false;

      const showWindow = () => {
        if (!browserWindow) {
          throw new Error("Cannot show browserWindow, does not exist");
        }

        browserWindow.show();
        windowIsShown = true;
      };

      return {
        id: configuration.id,

        get isVisible() {
          return windowIsShown;
        },

        get isStarting() {
          return windowIsStarting;
        },

        start: async () => {
          if (!browserWindow) {
            windowIsStarting = true;

            // must happen before the window navigates to the Lens origin
            await waitForWebpackDevServer();
            await setupSessionProxyBypass();

            browserWindow = createElectronWindow({
              ...configuration,
              onClose: () => {
                browserWindow = undefined;
                windowIsShown = false;
              },
            });

            const {
              file: filePathForContent,
              url: urlForContent,
            } = configuration.getContentSource();

            const beforeOpen = configuration.beforeOpen?.();

            if (filePathForContent) {
              await browserWindow.loadFile(filePathForContent).catch(error => {
                logFailedNavigation(error, filePathForContent);
              });
            } else if (urlForContent) {
              await browserWindow.loadUrl(urlForContent).catch(error => {
                logFailedNavigation(error, urlForContent);
              });
            }

            await beforeOpen;
          }

          showWindow();

          windowIsStarting = false;
        },

        show: showWindow,

        close: () => {
          browserWindow?.close();
          browserWindow = undefined;
          windowIsShown = false;
          configuration.onClose?.();
        },

        send: (args: SendToViewArgs) => {
          if (!browserWindow) {
            throw new Error(`Tried to send message to window "${configuration.id}" but the window was closed`);
          }

          return browserWindow.send(args);
        },

        reload: () => {
          if (!browserWindow) {
            throw new Error(`Tried to reload window "${configuration.id}" but the window was closed`);
          }

          return browserWindow.reload();
        },
      };
    };
  },
});

export default createLensWindowInjectable;
