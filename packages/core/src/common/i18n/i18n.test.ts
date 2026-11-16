/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../renderer/getDiForUnitTesting";
import i18nInjectable from "./i18n.injectable";
import type { I18n } from "./i18n.injectable";

describe("i18n", () => {
  let i18n: I18n;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    i18n = di.inject(i18nInjectable);
  });

  it("starts in the locale of the environment, which is English in tests", () => {
    expect(i18n.currentLocale).toBe("en");
  });

  it("translates to English by default", () => {
    expect(i18n.t("preferences.tabs.application")).toBe("App");
  });

  it("returns the key itself for unknown keys", () => {
    expect(i18n.t("This is not a key")).toBe("This is not a key");
  });

  it("replaces placeholders with parameters", () => {
    expect(i18n.t("preferences.application.extension-registry.description-prefix", {
      defaultRegistryUrl: "https://registry.npmjs.org",
    })).toContain("(https://registry.npmjs.org)");
  });

  it("leaves unknown placeholders untouched", () => {
    expect(i18n.t("preferences.application.extension-registry.description-prefix"))
      .toContain("({{defaultRegistryUrl}})");
  });

  describe("when the language is changed to Simplified Chinese", () => {
    beforeEach(() => {
      i18n.setLocalePreference("zh-CN");
    });

    it("reports the new locale", () => {
      expect(i18n.currentLocale).toBe("zh-CN");
      expect(i18n.localePreference).toBe("zh-CN");
    });

    it("translates the catalog of that locale", () => {
      expect(i18n.t("preferences.tabs.application")).toBe("应用");
      expect(i18n.t("common.cancel")).toBe("取消");
    });

    it("keeps translating unknown keys to themselves", () => {
      expect(i18n.t("Not a key")).toBe("Not a key");
    });

    describe("when the language is changed back to the system default", () => {
      beforeEach(() => {
        i18n.setLocalePreference("system");
      });

      it("falls back to the locale of the environment", () => {
        expect(i18n.currentLocale).toBe("en");
      });
    });
  });

  it("offers every supported locale with its native name", () => {
    expect(i18n.availableLocales).toEqual([
      { id: "en", label: "English" },
      { id: "zh-CN", label: "简体中文" },
    ]);
  });
});
