/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import attemptInstallsInjectable from "./attempt-installs.injectable";
import { getPathForFile } from "../../utils/get-path-for-file";

export type InstallOnDrop = (files: File[]) => Promise<void>;

const installOnDropInjectable = getInjectable({
  id: "install-on-drop",

  instantiate: (di): InstallOnDrop => {
    const attemptInstalls = di.inject(attemptInstallsInjectable);
    const logger = di.inject(loggerInjectionToken);

    return (files) => {
      logger.info("Install from D&D");

      // `File.path` was removed in Electron 32, `webUtils.getPathForFile` is the
      // replacement. Files with an unknown path are skipped rather than passed as
      // `undefined`, which would fail in the installer further down.
      const paths = files
        .map(getPathForFile)
        .filter((path): path is string => path !== undefined);

      return attemptInstalls(paths);
    };
  },
});

export default installOnDropInjectable;
