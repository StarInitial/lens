/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { defaultLocale, isLocalePreference, isSupportedLocale, resolveLocale, supportedLocales } from "./locale";

describe("locale", () => {
  describe("isSupportedLocale", () => {
    it.each(supportedLocales)("accepts %s", locale => {
      expect(isSupportedLocale(locale)).toBe(true);
    });

    it.each([
      undefined,
      null,
      "",
      "de",
      "zh",
      "zh-TW",
    ])("rejects %p", value => {
      expect(isSupportedLocale(value)).toBe(false);
    });
  });

  describe("isLocalePreference", () => {
    it("accepts the system sentinel", () => {
      expect(isLocalePreference("system")).toBe(true);
    });

    it.each(supportedLocales)("accepts %s", locale => {
      expect(isLocalePreference(locale)).toBe(true);
    });

    it("rejects unknown values", () => {
      expect(isLocalePreference("klingon")).toBe(false);
      expect(isLocalePreference(undefined)).toBe(false);
    });
  });

  describe("resolveLocale", () => {
    it("returns an explicitly selected locale", () => {
      expect(resolveLocale("zh-CN", "en-US")).toBe("zh-CN");
    });

    it("resolves the system locale when the preference is system", () => {
      expect(resolveLocale("system", "zh-CN")).toBe("zh-CN");
    });

    it("resolves the system locale when there is no preference", () => {
      expect(resolveLocale(undefined, "zh-Hans-CN")).toBe("zh-CN");
    });

    it("resolves POSIX style locales", () => {
      expect(resolveLocale("system", "zh_CN.UTF-8")).toBe("zh-CN");
    });

    it("falls back to Simplified Chinese for other Chinese variants", () => {
      expect(resolveLocale("system", "zh-TW")).toBe("zh-CN");
      expect(resolveLocale("system", "zh-Hant-HK")).toBe("zh-CN");
    });

    it("falls back to English for locales without a catalog", () => {
      expect(resolveLocale("system", "de-DE")).toBe(defaultLocale);
      expect(resolveLocale("system", "")).toBe(defaultLocale);
      expect(resolveLocale("system", undefined)).toBe(defaultLocale);
    });

    it("falls back to English for an invalid preference", () => {
      expect(resolveLocale("klingon", "zh-CN")).toBe("zh-CN");
    });
  });
});
