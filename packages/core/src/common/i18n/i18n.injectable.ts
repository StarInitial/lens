/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { observable, runInAction } from "mobx";
import type { LocalePreference, SupportedLocale } from "./locale";
import { defaultLocale, getSystemLocale, localeNames, resolveLocale, supportedLocales, systemLocalePreference } from "./locale";
import type { TranslateParams } from "./translation";
import { translateIn } from "./translation";
import { translationCatalogs } from "./translations";

export interface LocaleOption {
  /** The locale identifier, for example `zh-CN` */
  id: SupportedLocale;

  /** The name of the locale in that very locale, for example `简体中文` */
  label: string;
}

export interface I18n {
  /** The locale that is currently rendered */
  readonly currentLocale: SupportedLocale;

  /** The raw `locale` user preference, which may be the `system` sentinel */
  readonly localePreference: LocalePreference;

  /** All locales that can be selected */
  readonly availableLocales: readonly LocaleOption[];

  /** The locale used when a catalog does not contain a key */
  readonly fallbackLocale: SupportedLocale;

  /**
   * Applies `preference`, resolving the `system` sentinel against the locale of
   * the environment. Rendering is reactive: any `observer` component (or
   * `useTranslation()` consumer) re-renders when this changes.
   */
  setLocalePreference(preference: LocalePreference): void;

  /**
   * Translates `key`, falling back to the English catalog and finally to the key
   * itself. `{{name}}` placeholders are replaced with `params.name`.
   */
  t(key: string, params?: TranslateParams): string;
}

const i18nInjectable = getInjectable({
  id: "i18n",

  instantiate: (): I18n => {
    const systemLocale = getSystemLocale();

    const state = observable({
      preference: systemLocalePreference as LocalePreference,
      locale: resolveLocale(systemLocalePreference, systemLocale),
    });

    return {
      get currentLocale() {
        return state.locale;
      },

      get localePreference() {
        return state.preference;
      },

      availableLocales: supportedLocales.map(id => ({ id, label: localeNames[id] })),

      fallbackLocale: defaultLocale,

      setLocalePreference: (preference) => {
        runInAction(() => {
          state.preference = preference;
          state.locale = resolveLocale(preference, systemLocale);
        });
      },

      t: (key, params) => translateIn({
        dictionary: translationCatalogs[state.locale],
        fallbackDictionary: translationCatalogs[defaultLocale],
      }, key, params),
    };
  },
});

export default i18nInjectable;
