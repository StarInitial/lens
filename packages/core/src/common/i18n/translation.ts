/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Translation catalogs are flat maps from a dotted key to a message, for example
 *
 * ```ts
 * {
 *   "preferences.tabs.application": "App",
 * }
 * ```
 *
 * Flat keys keep the catalogs diffable and make it trivial to check that every
 * catalog has the same set of keys.
 */
export type TranslationDictionary = Record<string, string>;

export type TranslateParams = Record<string, string | number>;

const interpolationPattern = /\{\{\s*([^{}\s]+)\s*\}\}/g;

/**
 * Replaces `{{placeholder}}` occurrences in `template` with the matching entry
 * of `params`. Unknown placeholders are left untouched so that a missing parameter
 * is visible instead of rendering `undefined`.
 */
export const interpolate = (template: string, params?: TranslateParams): string => {
  if (!params) {
    return template;
  }

  return template.replace(interpolationPattern, (match, name: string) => {
    const value = params[name];

    return value === undefined
      ? match
      : String(value);
  });
};

/**
 * Looks up `key` in `dictionary`, falling back to `fallbackDictionary` and
 * finally to the key itself. Returning the key for unknown entries keeps
 * extension-provided labels (which are plain strings, not keys) working without
 * a translation catalog.
 */
export const translateIn = (
  dictionaries: {
    dictionary: TranslationDictionary | undefined;
    fallbackDictionary: TranslationDictionary;
  },
  key: string,
  params?: TranslateParams,
): string => {
  const template = dictionaries.dictionary?.[key] ?? dictionaries.fallbackDictionary[key] ?? key;

  return interpolate(template, params);
};
