/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getAccentForeground } from "./apply-lens-theme.injectable";

describe("getAccentForeground", () => {
  it("uses white text on the default OpenLens blue accent", () => {
    expect(getAccentForeground("#3d90ce")).toBe("#ffffff");
  });

  it("uses dark text on light accents", () => {
    expect(getAccentForeground("#ffff00")).toBe("#1e2124");
  });

  it("uses light text on dark accents", () => {
    expect(getAccentForeground("#004080")).toBe("#ffffff");
  });
});
