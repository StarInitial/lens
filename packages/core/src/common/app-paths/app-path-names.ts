/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * The list of application paths Lens knows about.
 *
 * This used to be derived from `Parameters<electron.app["getPath"]>[0]`, but
 * Electron keeps adding path names (e.g. `assets` in Electron 44) and every
 * addition made `AppPaths` require a new key that the app does not populate.
 * The set Lens actually maintains is enumerated explicitly instead, and it is the
 * same set that is filled at startup from `pathNames` below.
 */
export type PathName =
  | "currentApp"
  | "home"
  | "appData"
  | "userData"
  | "sessionData"
  | "temp"
  | "exe"
  | "module"
  | "desktop"
  | "documents"
  | "downloads"
  | "music"
  | "pictures"
  | "videos"
  | "logs"
  | "crashDumps"
  | "recent";

export const pathNames: PathName[] = [
  "currentApp",
  "home",
  "appData",
  "userData",
  "sessionData",
  "temp",
  "exe",
  "module",
  "desktop",
  "documents",
  "downloads",
  "music",
  "pictures",
  "videos",
  "logs",
  "crashDumps",
  "recent",
];
