/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { defaultTerminalConfig, isLegacyDefaultTerminalConfig, terminalConfigFromStore } from "./preferences-helpers";

describe("recognising the old untouched terminal defaults", () => {
  it("recognises the frozen 12px RobotoMono default", () => {
    expect(isLegacyDefaultTerminalConfig({ fontSize: 12, fontFamily: "RobotoMono" })).toBe(true);
  });

  it("does not treat a size the user picked as the old default", () => {
    expect(isLegacyDefaultTerminalConfig({ fontSize: 18, fontFamily: "RobotoMono" })).toBe(false);
  });

  it("does not treat a font the user picked as the old default", () => {
    expect(isLegacyDefaultTerminalConfig({ fontSize: 12, fontFamily: "JetBrains Mono" })).toBe(false);
  });

  it("ignores a missing stored configuration", () => {
    expect(isLegacyDefaultTerminalConfig(undefined)).toBe(false);
  });
});

describe("resolving the terminal configuration from the preferences file", () => {
  it("uses the current defaults for an installation that kept the old untouched default", () => {
    const resolved = terminalConfigFromStore({ fontSize: 12, fontFamily: "RobotoMono" });

    expect(resolved).toEqual(defaultTerminalConfig);
    expect(resolved.fontSize).toBe(13);
    expect(resolved.fontFamily).toContain("Lucida Console");
  });

  it("keeps a configuration the user picked", () => {
    expect(terminalConfigFromStore({ fontSize: 18, fontFamily: "JetBrains Mono" })).toEqual({
      fontSize: 18,
      fontFamily: "JetBrains Mono",
    });
  });

  it("fills in the missing half from the defaults", () => {
    expect(terminalConfigFromStore({ fontSize: 20 })).toEqual({
      fontSize: 20,
      fontFamily: defaultTerminalConfig.fontFamily,
    });
  });

  it("uses the defaults when nothing is stored", () => {
    expect(terminalConfigFromStore(undefined)).toEqual(defaultTerminalConfig);
  });
});
