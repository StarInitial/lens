/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "../../electron-app/electron-app.injectable";
import { beforeElectronIsReadyInjectionToken } from "@k8slens/application-for-electron-main";

const setupHostnamesInjectable = getInjectable({
  id: "setup-hostnames",

  instantiate: (di) => ({
    run: () => {
      const app = di.inject(electronAppInjectable);

      /**
       * Lens serves the application renderer through its own HTTPS proxy on
       * https://lens.app:<port>/ (and uses *.lens.app for cluster frames), so those
       * names have to resolve to the loopback interface.
       *
       * Up to Electron 22 this was done with the `host-rules` switch. That switch is
       * deprecated since Electron 40 and has no effect anymore in Electron 44: the
       * name was resolved through public DNS and the main window failed to load with
       * ERR_CONNECTION_CLOSED. The Chromium replacement is `host-resolver-rules`.
       */
      app.commandLine.appendSwitch("host-resolver-rules", [
        "MAP localhost 127.0.0.1",
        "MAP lens.app 127.0.0.1",
        "MAP *.lens.app 127.0.0.1",
      ].join());

      /**
       * Requests to the Lens origins must also bypass a configured system proxy,
       * otherwise the main window is proxied and fails to load. That is done in
       * `setup-session-proxy-bypass` because it cannot be expressed with
       * `--proxy-bypass-list` alone (Chromium only reads it together with
       * `--proxy-server`).
       */

      return undefined;
    },
  }),

  injectionToken: beforeElectronIsReadyInjectionToken,
});

export default setupHostnamesInjectable;
