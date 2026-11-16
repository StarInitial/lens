/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";
import i18nInjectable from "../../common/i18n/i18n.injectable";
import type { TranslateParams } from "../../common/i18n/translation";
import type { SupportedLocale } from "../../common/i18n/locale";
import { supportedLocales } from "../../common/i18n/locale";

export type { TranslateParams } from "../../common/i18n/translation";
export type { SupportedLocale } from "../../common/i18n/locale";

/**
 * Translates a key of the Lens catalogs. Unknown keys are returned untouched, so
 * extensions can pass their own plain text as well.
 *
 * ```ts
 * import { Renderer } from "@k8slens/extensions";
 *
 * const text = Renderer.I18n.translate("common.cancel");
 * ```
 */
export const translate = (key: string, params?: TranslateParams): string =>
  getLegacyGlobalDiForExtensionApi().inject(i18nInjectable).t(key, params);

/**
 * The locale the user interface is currently rendered in, for example `en` or
 * `zh-CN`.
 */
export const getCurrentLocale = (): SupportedLocale =>
  getLegacyGlobalDiForExtensionApi().inject(i18nInjectable).currentLocale;

/**
 * The locales that the application ships a catalog for.
 */
export const getSupportedLocales = (): readonly SupportedLocale[] => supportedLocales;
