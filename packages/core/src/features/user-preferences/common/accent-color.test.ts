/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { accentColorFromStore, accentColorToStore, defaultAccentColor } from "./preference-descriptors.injectable";

describe("accent color preference", () => {
  it("defaults to OpenLens blue when no value is stored", () => {
    expect(accentColorFromStore(undefined)).toBe(defaultAccentColor);
  });

  it("normalizes valid hex colors", () => {
    expect(accentColorFromStore("#AABBCC")).toBe("#aabbcc");
  });

  it("rejects malformed stored values", () => {
    expect(accentColorFromStore("red")).toBe(defaultAccentColor);
    expect(accentColorFromStore("#12345")).toBe(defaultAccentColor);
  });

  it("omits the default color from persisted preferences", () => {
    expect(accentColorToStore(defaultAccentColor)).toBeUndefined();
  });

  it("persists valid custom colors in normalized form", () => {
    expect(accentColorToStore("#ABCDEF")).toBe("#abcdef");
  });

  it("does not persist malformed values", () => {
    expect(accentColorToStore("blue")).toBeUndefined();
  });
});
