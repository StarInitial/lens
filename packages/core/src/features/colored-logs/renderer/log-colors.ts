/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensTheme } from "../../../renderer/themes/lens-theme";
import type { LogLevel } from "./log-level";

export interface LogPalette {
  faint: string;
  pid: string;
  logger: string;
  error: string;
  level: Record<LogLevel, string>;
  text: string;
  muted: string;
  background: string;
  bar: string;
  border: string;
  accent: string;
}

const lightTerminalColors = {
  red: "#c4262e",
  green: "#2e7d32",
  yellow: "#a66a00",
  blue: "#1f63c6",
  magenta: "#a12fae",
  cyan: "#00838f",
  brightBlack: "#7a7a7a",
};

const darkTerminalColors = {
  red: "#f0626a",
  green: "#8cc265",
  yellow: "#e5c07b",
  blue: "#61afef",
  magenta: "#c678dd",
  cyan: "#56b6c2",
  brightBlack: "#7f848e",
};

/**
 * Colours for the colored logs panel, taken from the active theme the same way the
 * terminal palette is, so the panel looks like the app's own console.
 */
export function buildLogPalette(theme: LensTheme | undefined): LogPalette {
  const isLight = theme?.type === "light";
  const terminalColors = {
    ...(isLight ? lightTerminalColors : darkTerminalColors),
    ...(theme?.terminalColors ?? {}),
  };
  const colors = theme?.colors;

  return {
    faint: terminalColors.brightBlack,
    pid: terminalColors.magenta,
    logger: terminalColors.cyan,
    error: terminalColors.red,
    level: {
      ERROR: terminalColors.red,
      WARN: terminalColors.yellow,
      INFO: terminalColors.green,
      DEBUG: terminalColors.blue,
      TRACE: terminalColors.brightBlack,
    },
    text: colors?.textColorAccent ?? (isLight ? "#222" : "#e6e6e6"),
    muted: colors?.textColorSecondary ?? "#a0a0a0",
    background: colors?.mainBackground ?? (isLight ? "#fafafa" : "#1e2124"),
    bar: colors?.dockHeadBackground ?? colors?.layoutBackground ?? (isLight ? "#eee" : "#2e3136"),
    border: colors?.borderFaintColor ?? "#373a3e",
    accent: colors?.primary ?? "#3d90ce",
  };
}
