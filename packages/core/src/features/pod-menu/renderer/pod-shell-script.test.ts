/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { containerShellScript } from "./pod-shell-menu.injectable";

describe("the script that hands the terminal over to the container", () => {
  it("clears the screen first so nothing the host shell printed stays visible", () => {
    expect(containerShellScript.startsWith("clear 2>/dev/null || true;")).toBe(true);
  });

  it("prefers bash, then ash, then plain sh", () => {
    expect(containerShellScript.indexOf("exec bash")).toBeLessThan(containerShellScript.indexOf("exec ash"));
    expect(containerShellScript.indexOf("exec ash")).toBeLessThan(containerShellScript.indexOf("exec sh"));
  });

  it("only uses exec behind a command check, so a missing shell cannot abort with 127", () => {
    for (const shell of ["bash", "ash"]) {
      expect(containerShellScript).toContain(`command -v ${shell} >/dev/null 2>&1 && exec ${shell}`);
    }
  });

  it("contains no quotes, so either host shell can wrap it as a single argument", () => {
    expect(containerShellScript).not.toMatch(/["']/);
  });
});
