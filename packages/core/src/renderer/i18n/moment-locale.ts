/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "moment/locale/zh-cn";
import type { SupportedLocale } from "../../common/i18n/locale";

/**
 * The locale identifiers moment uses. It has to be imported for every locale so
 * that `moment().locale(...)` can find the data.
 */
const momentLocales: Record<SupportedLocale, string> = {
  en: "en",
  "zh-CN": "zh-cn",
};

export const toMomentLocale = (locale: SupportedLocale): string => momentLocales[locale];
