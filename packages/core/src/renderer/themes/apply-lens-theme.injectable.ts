/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import { object } from "@k8slens/utilities";
import type { LensTheme } from "./lens-theme";
import resetThemeInjectable from "../../features/user-preferences/common/reset-theme.injectable";

export type ApplyLensTheme = (theme: LensTheme, accentColor: string, reduceMotion: boolean) => void;

export const getAccentForeground = (hex: string): string => {
  const channels = hex.slice(1).match(/.{2}/g)?.map(channel => parseInt(channel, 16) / 255) ?? [0, 0, 0];
  const luminance = channels
    .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);

  return luminance > 0.32 ? "#1e2124" : "#ffffff";
};

const applyLensThemeInjectable = getInjectable({
  id: "apply-lens-theme",
  instantiate: (di): ApplyLensTheme => {
    const logger = di.inject(loggerInjectionToken);
    const resetTheme = di.inject(resetThemeInjectable);

    return (theme, accentColor, reduceMotion) => {
      try {
        const colors = object.entries(theme.colors);

        for (const [name, value] of colors) {
          document.documentElement.style.setProperty(`--${name}`, value);
        }

        for (const name of ["primary", "blue", "buttonPrimaryBackground", "sidebarSubmenuActiveColor", "iconActiveBackground"]) {
          document.documentElement.style.setProperty(`--${name}`, accentColor);
        }

        document.documentElement.style.setProperty("--accentForeground", getAccentForeground(accentColor));
        document.documentElement.style.setProperty("--iconActiveColor", getAccentForeground(accentColor));

        const systemReduceMotion = typeof window.matchMedia === "function"
          && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        document.documentElement.dataset.reduceMotion = String(reduceMotion || systemReduceMotion);

        // Adding universal theme flag which can be used in component styles
        document.body.classList.toggle("theme-light", theme.type === "light");
      } catch (error) {
        logger.error("[THEME]: Failed to apply active theme", error);
        resetTheme();
      }
    };
  },
  causesSideEffects: true,
});

export default applyLensThemeInjectable;
