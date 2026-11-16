/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import userPreferencesStateInjectable from "../user-preferences/common/state.injectable";

describe("preferences - language preference", () => {
  let builder: ApplicationBuilder;
  let rendered: RenderResult;

  beforeEach(async () => {
    builder = getApplicationBuilder();

    rendered = await builder.render();

    builder.preferences.navigate();
  });

  it("renders the language preference in the application page", () => {
    expect(rendered.container.querySelector("#language-input")).not.toBeNull();
  });

  it("starts with the system default", () => {
    expect(builder.select.getValue("language-input")).toBe("System default");
  });

  it("renders the user interface in English", () => {
    expect(rendered.container.textContent).toContain("Preferences");
  });

  describe("when choosing Simplified Chinese", () => {
    beforeEach(() => {
      const { selectOption } = builder.select.openMenu("language-input");

      selectOption("简体中文");
    });

    it("renders the user interface in Simplified Chinese", () => {
      expect(rendered.container.textContent).toContain("偏好设置");
      expect(rendered.container.textContent).toContain("应用");
      expect(rendered.container.textContent).not.toContain("Preferences");
    });

    it("shows the chosen language as the selected value", () => {
      expect(builder.select.getValue("language-input")).toBe("简体中文");
    });

    it("remembers the chosen language in the user preferences", () => {
      const state = builder.applicationWindow.only.di.inject(userPreferencesStateInjectable);

      expect(state.locale).toBe("zh-CN");
    });

    describe("when choosing the system default again", () => {
      beforeEach(() => {
        const { selectOption } = builder.select.openMenu("language-input");

        selectOption("跟随系统");
      });

      it("renders the user interface in English again", () => {
        expect(rendered.container.textContent).toContain("Preferences");
        expect(rendered.container.textContent).not.toContain("偏好设置");
      });
    });
  });
});
