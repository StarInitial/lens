/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Resolve the absolute path of a `File` that came from a drag & drop operation or
 * from an `<input type="file">` element.
 *
 * Electron 32 removed the non-standard `File.path` property. The replacement is
 * `webUtils.getPathForFile(file)`, which lives in the renderer process. Lens
 * renders with `nodeIntegration: true` and without a preload script, so the
 * module is reached through the `electron` module of the renderer. The legacy
 * `File.path` is still read as a fallback so that the same code keeps working on
 * Electron < 32 (e.g. while a release branch is being kept alive).
 *
 * Once the renderer gets a preload script (see the renderer security track of
 * the Electron baseline ADR) this helper should be replaced by an API exposed
 * through `contextBridge`.
 */

import * as electron from "electron";

interface WebUtilsLike {
  getPathForFile(file: File): string;
}

const webUtils = (electronModule: unknown): WebUtilsLike | undefined =>
  (electronModule as { webUtils?: WebUtilsLike }).webUtils;

/**
 * @returns the absolute path of `file` or `undefined` when it cannot be determined
 */
export const getPathForFile = (file: File): string | undefined => {
  const webUtilsModule = webUtils(electron);

  if (webUtilsModule?.getPathForFile) {
    try {
      const filePath = webUtilsModule.getPathForFile(file);

      if (filePath) {
        return filePath;
      }
    } catch {
      // fall through to the legacy implementation below
    }
  }

  return (file as File & { path?: string }).path;
};
