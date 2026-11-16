/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import type { SelectOption } from "../../../../../../renderer/components/select";
import { Select } from "../../../../../../renderer/components/select";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import type { I18n } from "../../../../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import type { LocalePreference } from "../../../../../../common/i18n/locale";
import { isLocalePreference, systemLocalePreference } from "../../../../../../common/i18n/locale";

interface Dependencies {
  state: UserPreferencesState;
  i18n: I18n;
}

const NonInjectedLanguage = observer(({ state, i18n }: Dependencies) => {
  const languageOptions: SelectOption<LocalePreference>[] = [
    {
      value: systemLocalePreference,
      label: i18n.t("preferences.application.language.system"),
    },
    ...i18n.availableLocales.map(({ id, label }) => ({
      value: id,
      label,
    })),
  ];

  return (
    <section id="language">
      <SubTitle title="preferences.application.language.title" />
      <Select
        id="language-input"
        options={languageOptions}
        value={state.locale}
        onChange={(option) => {
          const selected = option?.value;
          const preference = isLocalePreference(selected)
            ? selected
            : systemLocalePreference;

          state.locale = preference;
          i18n.setLocalePreference(preference);
        }}
        themeName="lens"
      />
    </section>
  );
});

export const Language = withInjectables<Dependencies>(NonInjectedLanguage, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
    i18n: di.inject(i18nInjectable),
  }),
});
