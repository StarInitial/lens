/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { action, computed } from "mobx";
import React from "react";
import type { SingleValue } from "react-select";
import { defaultTerminalFontFamily } from "../../../../../../common/vars";
import type { SelectOption } from "../../../../../../renderer/components/select";
import { terminalFontInjectionToken } from "../../../../../terminal/renderer/fonts/token";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import type { I18n } from "../../../../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";

export interface TerminalFontPreferencePresenter {
  readonly options: IComputedValue<SelectOption<string>[]>;
  readonly current: IComputedValue<string>;
  onSelection: (selection: SingleValue<SelectOption<string>>) => void;
}

const terminalFontPreferencePresenterInjectable = getInjectable({
  id: "terminal-font-preference-presenter",
  instantiate: (di): TerminalFontPreferencePresenter => {
    const state = di.inject(userPreferencesStateInjectable);
    const terminalFonts = di.injectMany(terminalFontInjectionToken);
    const i18n: I18n = di.inject(i18nInjectable);

    return {
      options: computed(() => [{
        // Keep the default (the system monospace stack) selectable, otherwise the list has no entry for it.
        label: (
          <span style={{ fontFamily: defaultTerminalFontFamily, fontSize: state.terminalConfig.fontSize }}>
            {i18n.t("preferences.terminal.font-family.system-monospace")}
          </span>
        ),
        value: defaultTerminalFontFamily,
        isSelected: state.terminalConfig.fontFamily === defaultTerminalFontFamily,
      }, ...terminalFonts.map(font => ({
        label: (
          <span
            style={{
              fontFamily: `${font.name}, var(--font-terminal)`,
              fontSize: state.terminalConfig.fontSize,
            }}
          >
            {font.name}
          </span>
        ),
        value: font.name,
        isSelected: state.terminalConfig.fontFamily === font.name,
      }))]),
      current: computed(() => state.terminalConfig.fontFamily),
      onSelection: action(selection => {
        state.terminalConfig.fontFamily = selection?.value ?? defaultTerminalFontFamily;
      }),
    };
  },
});

export default terminalFontPreferencePresenterInjectable;
