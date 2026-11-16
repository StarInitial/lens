/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * The locales that the application ships a translation for. Adding a locale means:
 *
 * 1. adding it to this list,
 * 2. adding a catalog to `./translations`,
 * 3. adding its display name to `localeNames`.
 */
export const supportedLocales = ["en", "zh-CN"] as const;

export type SupportedLocale = typeof supportedLocales[number];

/**
 * The locale that is used when nothing else matches. It is also the locale the
 * translation catalogs are written in, i.e. it is always complete.
 */
export const defaultLocale: SupportedLocale = "en";

/**
 * The sentinel value of the `locale` user preference meaning "follow the
 * operating system / browser".
 */
export const systemLocalePreference = "system";

export type LocalePreference = typeof systemLocalePreference | SupportedLocale;

/**
 * Names of the locales as they are written in the locale itself, so that a user
 * who cannot read the current language can still find their own one.
 */
export const localeNames: Record<SupportedLocale, string> = {
  en: "English",
  "zh-CN": "简体中文",
};

/**
 * Fallback for locales we do not translate yet: a user with `zh-TW` or
 * `zh-Hans-CN` gets the Simplified Chinese catalog rather than English.
 */
const localesByLanguage: Record<string, SupportedLocale> = {
  en: "en",
  zh: "zh-CN",
};

export const isSupportedLocale = (value: unknown): value is SupportedLocale =>
  supportedLocales.includes(value as SupportedLocale);

export const isLocalePreference = (value: unknown): value is LocalePreference =>
  value === systemLocalePreference || isSupportedLocale(value);

/**
 * The locale of the environment as a BCP 47 tag, for example `zh-CN`, `en-US`
 * or `zh-Hans-CN`. In the renderer this is the Chromium locale, in the main
 * process this is the POSIX locale of the environment. It deliberately does not
 * depend on Electron so that it can be used by both processes.
 */
export const getSystemLocale = (): string | undefined => {
  if (typeof navigator !== "undefined" && typeof navigator.language === "string") {
    return navigator.language;
  }

  if (typeof process !== "undefined") {
    return process.env.LC_ALL ?? process.env.LC_MESSAGES ?? process.env.LANG;
  }

  return undefined;
};

/**
 * Turns a `locale` user preference (which may be the `system` sentinel) plus the
 * locale of the environment into a locale we actually have a catalog for.
 */
export const resolveLocale = (preference: string | undefined, systemLocale: string | undefined): SupportedLocale => {
  if (isSupportedLocale(preference)) {
    return preference;
  }

  const requested = systemLocale?.trim().replace(/_/g, "-");

  if (!requested) {
    return defaultLocale;
  }

  const [language] = requested.split("-");

  return localesByLanguage[language.toLowerCase()] ?? defaultLocale;
};
