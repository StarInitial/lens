/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { TerminalFont } from "./token";

export type LoadTerminalFont = (font: TerminalFont) => Promise<void>;

const loadTerminalFontInjectable = getInjectable({
  id: "load-terminal-font",
  instantiate: (): LoadTerminalFont => async (font) => {
    // `document.fonts.check()` answers `true` for a family that is neither declared nor installed, so it
    // cannot tell whether a bundled font still has to be registered: it reported RobotoMono as available
    // and the terminal then fell back to a proportional font, which made xterm measure a cell far wider
    // than the glyphs it drew. Look the family up in the font set instead.
    const isRegistered = Array.from(document.fonts)
      .some((face) => face.family.replace(/["']/g, "") === font.name);

    if (isRegistered) {
      return;
    }

    const fontFace = new FontFace(font.name, `url(${font.url})`);

    document.fonts.add(fontFace);
    await fontFace.load();
  },
  causesSideEffects: true,
});

export default loadTerminalFontInjectable;
