/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { Select } from "../../../../../../renderer/components/select";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { LensTheme } from "../../../../../../renderer/themes/lens-theme";
import defaultLensThemeInjectable from "../../../../../../renderer/themes/default-theme.injectable";
import { lensThemeDeclarationInjectionToken } from "../../../../../../renderer/themes/declaration";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import { useTranslation } from "../../../../../../renderer/i18n/i18n-context";
import { Switch } from "../../../../../../renderer/components/switch/switch";
import activeThemeInjectable from "../../../../../../renderer/themes/active.injectable";
import type { IComputedValue } from "mobx";
import { defaultAccentColor } from "../../../../../user-preferences/common/preference-descriptors.injectable";

const accentColors = ["#3d90ce", "#3f83f8", "#8b5cf6", "#e84665", "#0ca678", "#d28a12", "#e76f2e"];

interface Dependencies {
  state: UserPreferencesState;
  defaultTheme: LensTheme;
  themes: LensTheme[];
  activeTheme: IComputedValue<LensTheme>;
}

const NonInjectedTheme = observer(({
  state,
  themes,
  defaultTheme,
  activeTheme,
}: Dependencies) => {
  const { t } = useTranslation();
  const themeOptions = [
    {
      value: "system", // TODO: replace with a sentinel value that isn't string (and serialize it differently)
      label: t("preferences.application.theme.system"),
    },
    ...themes.map(theme => ({
      value: theme.name,
      label: theme.name,
    })),
  ];

  return (
    <section id="appearance">
      <SubTitle title="preferences.application.theme.title" />
      <Select
        id="theme-input"
        options={themeOptions}
        value={state.colorTheme}
        onChange={(value) =>
          (state.colorTheme = value?.value ?? defaultTheme.name)
        }
        themeName="lens"
      />
      <div className="lens-accent-settings">
        <SubTitle title="preferences.application.theme.accent" />
        <div
          className="lens-accent-swatches"
          role="group"
          aria-label={t("preferences.application.theme.accent")}
        >
          {accentColors.map(color => (
            <button
              key={color}
              type="button"
              className="lens-accent-swatch"
              style={{ "--accent-swatch": color === defaultAccentColor ? activeTheme.get().colors.primary : color } as React.CSSProperties}
              aria-label={color === defaultAccentColor ? t("preferences.application.theme.accent-default") : color}
              aria-pressed={state.accentColor.toLowerCase() === color}
              onClick={() => (state.accentColor = color)}
            />
          ))}
          <label className="lens-accent-custom">
            <span>{t("preferences.application.theme.accent-custom")}</span>
            <input
              type="color"
              value={state.accentColor === defaultAccentColor ? activeTheme.get().colors.primary : state.accentColor}
              onChange={event => (state.accentColor = event.target.value)}
              aria-label={t("preferences.application.theme.accent-custom")}
            />
          </label>
        </div>
        <Switch
          checked={state.reduceMotion}
          onChange={value => (state.reduceMotion = value)}
        >
          {t("preferences.application.theme.reduce-motion")}
        </Switch>
      </div>
    </section>
  );
});

export const Theme = withInjectables<Dependencies>(NonInjectedTheme, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
    defaultTheme: di.inject(defaultLensThemeInjectable),
    activeTheme: di.inject(activeThemeInjectable),
    themes: di.injectMany(lensThemeDeclarationInjectionToken),
  }),
});
