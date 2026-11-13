/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import commandLineArgumentsInjectable from "../../utils/command-line-arguments.injectable";

const shouldStartHiddenInjectable = getInjectable({
  id: "should-start-hidden",

  instantiate: (di) => {
    const commandLineArguments = di.inject(commandLineArgumentsInjectable);

    /**
     * Start the app without showing the main window when auto starting on login.
     * The login item is registered with the `--hidden` argument on every platform
     * (see `sync-open-at-login-with-os`), so the argument is the single source of
     * truth. The macOS only `LoginItemSettings.wasOpenedAsHidden` that used to be
     * checked here was removed in Electron 44.
     */
    return commandLineArguments.includes("--hidden");
  },
});

export default shouldStartHiddenInjectable;
