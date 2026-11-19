/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../getDiForUnitTesting";
import applyLensThemeInjectable from "./apply-lens-theme.injectable";
import lensLightThemeInjectable from "./lens-light.injectable";
import lensDarkThemeInjectable from "./lens-dark.injectable";
import { defaultAccentColor } from "../../features/user-preferences/common/preference-descriptors.injectable";

describe.each(["light", "dark"])("%s workspace accent", mode => {
  const style = document.documentElement.style;

  afterEach(() => {
    document.documentElement.removeAttribute("style");
    delete document.documentElement.dataset.reduceMotion;
    document.body.classList.remove("theme-light");
  });

  it("updates settings, resource tabs and legacy selection colors together", () => {
    const di = getDiForUnitTesting();

    di.unoverride(applyLensThemeInjectable);
    di.permitSideEffects(applyLensThemeInjectable);
    const apply = di.inject(applyLensThemeInjectable);
    const theme = mode === "light" ? di.inject(lensLightThemeInjectable) : di.inject(lensDarkThemeInjectable);

    apply(theme, "#8b5cf6", false);

    expect(style.getPropertyValue("--primary")).toBe("#8b5cf6");
    expect(style.getPropertyValue("--navHoverColor")).toBe("#8b5cf6");
    expect(style.getPropertyValue("--layoutTabsActiveColor")).toBe("#8b5cf6");
    expect(style.getPropertyValue("--navSelectedBackground")).toBe("var(--surface-selected)");
    expect(style.getPropertyValue("--tableBgcSelected")).toBe("var(--surface-selected)");
    expect(style.getPropertyValue("--menuSelectedOptionBgc")).toBe("var(--surface-selected)");
    expect(style.getPropertyValue("--colorWarning")).toBe(theme.colors.colorWarning);
    expect(style.getPropertyValue("--colorError")).toBe(theme.colors.colorError);
    expect(style.getPropertyValue("--colorSuccess")).toBe(theme.colors.colorSuccess);

    apply(theme, defaultAccentColor, false);

    expect(style.getPropertyValue("--primary")).toBe(theme.colors.primary);
    expect(style.getPropertyValue("--layoutTabsActiveColor")).toBe(theme.colors.primary);
    expect(style.getPropertyValue("--navHoverColor")).toBe(theme.colors.primary);
  });
});
