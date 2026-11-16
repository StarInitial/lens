/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { reaction } from "mobx";
import type { I18n, LocaleOption } from "../../common/i18n/i18n.injectable";
import type { SupportedLocale } from "../../common/i18n/locale";
import type { TranslateParams } from "../../common/i18n/translation";

export const I18nContext = React.createContext<I18n | undefined>(undefined);

export interface UseTranslation {
  /** Translates a key of the catalogs, see {@link I18n.t} */
  t: (key: string, params?: TranslateParams) => string;

  /** The locale that is currently rendered */
  locale: SupportedLocale;

  /** The raw user preference, which may be the `system` sentinel */
  localePreference: string;

  /** All locales that can be selected */
  availableLocales: readonly LocaleOption[];

  /** Applies a new language (and persists it through the caller) */
  setLocalePreference: I18n["setLocalePreference"];
}

/**
 * Translates text from a function component. The component re-renders when the
 * language changes.
 *
 * ```tsx
 * const { t } = useTranslation();
 * return <SubTitle title={t("preferences.application.theme.title")} />;
 * ```
 */
export const useTranslation = (): UseTranslation => {
  const i18n = React.useContext(I18nContext);
  const [, forceUpdate] = React.useState(0);

  React.useEffect(() => {
    if (!i18n) {
      return undefined;
    }

    return reaction(
      () => i18n.currentLocale,
      () => forceUpdate(count => count + 1),
    );
  }, [i18n]);

  if (!i18n) {
    throw new Error("useTranslation() has to be used within an <I18nProvider />, see i18n-provider-react-application-hoc.injectable.tsx");
  }

  return {
    t: i18n.t,
    locale: i18n.currentLocale,
    localePreference: i18n.localePreference,
    availableLocales: i18n.availableLocales,
    setLocalePreference: i18n.setLocalePreference,
  };
};
