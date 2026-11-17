/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// App's common configuration for any process (main, renderer, build pipeline, etc.)
import type { ThemeId } from "../renderer/themes/lens-theme";

export const defaultThemeId: ThemeId = "lens-dark";
export const defaultFontSize = 12;
// The terminal is read at a glance and xterm itself defaults to 15, so 12 (the editor default) looked
// tiny, especially on displays scaled above 100%.
export const defaultTerminalFontSize = 13;
// The same stack as `--font-monospace` (see app.scss), so the terminal matches the look of the
// built-in pod logs view instead of using the bundled RobotoMono webfont.
export const defaultTerminalFontFamily = "Lucida Console, Monaco, Consolas, monospace";
export const defaultEditorFontFamily = "RobotoMono";

// Apis
export const apiPrefix = "/api"; // local router apis
export const apiKubePrefix = "/api-kube"; // k8s cluster apis

// Links
export const issuesTrackerUrl = "https://github.com/lensapp/lens/issues" as string;
export const docsUrl = "https://docs.k8slens.dev" as string;
export const forumsUrl = "https://forums.k8slens.dev" as string;
