/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { SupportedLocale } from "../locale";
import type { TranslationDictionary } from "../translation";
import { en } from "./en";
import { zhCN } from "./zh-cn";

/**
 * Every catalog the application ships. The keys of this record are the locales
 * of `supportedLocales`, so adding a locale is a compile time error until its
 * catalog is added here.
 */
export const translationCatalogs: Record<SupportedLocale, TranslationDictionary> = {
  en,
  "zh-CN": zhCN,
};

export { en, zhCN };
