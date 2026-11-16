/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import showAboutInjectable from "./main/menu-items/special-menu-for-mac-application/show-about-application/show-about.injectable";
import showMessagePopupInjectable from "../../main/electron-app/features/show-message-popup.injectable";

describe("about dialog", () => {
  let builder: ApplicationBuilder;
  let showMessagePopupMock: jest.Mock;

  const getBody = (): string => showMessagePopupMock.mock.calls[0][2];

  beforeEach(async () => {
    showMessagePopupMock = jest.fn();

    builder = getApplicationBuilder();

    builder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(showMessagePopupInjectable, () => showMessagePopupMock);
    });

    await builder.startHidden();

    builder.mainDi.inject(showAboutInjectable)();
  });

  it("tells the versions of the bundled run times", () => {
    expect(getBody()).toContain(`Electron: ${process.versions.electron}`);
    expect(getBody()).toContain(`Chrome: ${process.versions.chrome}`);
    expect(getBody()).toContain(`Node: ${process.versions.node}`);
  });

  it("does not show a copyright line", () => {
    expect(getBody()).not.toContain("©");
  });
});
