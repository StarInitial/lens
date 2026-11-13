/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import showApplicationWindowInjectable from "../start-main-application/lens-window/show-application-window.injectable";
import type { RequestChannelHandler } from "@k8slens/messaging";
import type { openPathPickingDialogChannel } from "../../features/path-picking-dialog/common/channel";
import showOpenDialogInjectable from "../electron-app/features/show-open-dialog.injectable";
import electronAppInjectable from "../electron-app/electron-app.injectable";

// TODO: Replace leaking electron with abstraction
export type AskUserForFilePaths = RequestChannelHandler<typeof openPathPickingDialogChannel>;

const askUserForFilePathsInjectable = getInjectable({
  id: "ask-user-for-file-paths",

  instantiate: (di): AskUserForFilePaths => {
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const showOpenDialog = di.inject(showOpenDialogInjectable);
    const app = di.inject(electronAppInjectable);

    return async (dialogOptions) => {
      await showApplicationWindow();

      const { canceled, filePaths } = await showOpenDialog({
        // Starting with Electron 43 the default location of the dialog is the
        // "Downloads" directory. Keep the previous behaviour of Electron 22 and
        // start in the user's home directory unless the caller asked for
        // something else.
        defaultPath: app.getPath("home"),
        ...dialogOptions,
      });

      if (canceled) {
        return {
          canceled,
        };
      }

      return {
        canceled: false,
        paths: filePaths,
      };
    };
  },
});

export default askUserForFilePathsInjectable;
