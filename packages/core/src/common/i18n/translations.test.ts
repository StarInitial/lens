/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { translationCatalogs } from "./translations";
import { supportedLocales } from "./locale";

const placeholdersOf = (message: string): string[] =>
  Array.from(message.matchAll(/\{\{\s*([^{}\s]+)\s*\}\}/g), ([, name]) => name).sort();

describe("translation catalogs", () => {
  const englishKeys = Object.keys(translationCatalogs.en).sort();

  it("has a catalog for every supported locale", () => {
    expect(Object.keys(translationCatalogs).sort()).toEqual([...supportedLocales].sort());
  });

  it("has no empty messages", () => {
    for (const [key, message] of Object.entries(translationCatalogs.en)) {
      expect({ key, message }).not.toEqual({ key, message: "" });
    }
  });

  describe.each(supportedLocales.filter(locale => locale !== "en"))("%s", locale => {
    const catalog = translationCatalogs[locale];

    it("has exactly the keys of the English catalog", () => {
      expect(Object.keys(catalog).sort()).toEqual(englishKeys);
    });

    it("uses the same placeholders as the English catalog", () => {
      for (const key of englishKeys) {
        expect({
          key,
          placeholders: placeholdersOf(catalog[key]),
        }).toEqual({
          key,
          placeholders: placeholdersOf(translationCatalogs.en[key]),
        });
      }
    });

    it("has no empty messages", () => {
      for (const [key, message] of Object.entries(catalog)) {
        expect({ key, message }).not.toEqual({ key, message: "" });
      }
    });
  });
});
