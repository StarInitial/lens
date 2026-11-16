/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import populateApplicationMenuInjectable, { getApplicationMenuTemplate } from "./main/populate-application-menu.injectable";
import { advanceFakeTime } from "../../test-utils/use-fake-time";
import platformInjectable from "../../common/vars/platform.injectable";
import productNameInjectable from "../../common/vars/product-name.injectable";
import userPreferencesStateInjectable from "../user-preferences/common/state.injectable";
import { runInAction } from "mobx";

describe("menus following the language preference", () => {
  let builder: ApplicationBuilder;
  let populateApplicationMenuMock: jest.Mock;
  let productName: string;

  const getMenuTemplate = () => {
    const calls = populateApplicationMenuMock.mock.calls;

    return getApplicationMenuTemplate(calls[calls.length - 1][0]);
  };

  const getTopLevelLabels = () => getMenuTemplate()
    .map((menuItem) => menuItem.label);

  const getLabelsOfSubMenu = (id: string) => getMenuTemplate()
    .find((menuItem) => menuItem.id === id)
    ?.submenu
    ?.map((menuItem) => menuItem.label);

  beforeEach(async () => {
    populateApplicationMenuMock = jest.fn();

    builder = getApplicationBuilder();

    builder.beforeApplicationStart(({ mainDi }) => {
      mainDi.override(platformInjectable, () => "win32");

      mainDi.override(
        populateApplicationMenuInjectable,
        () => populateApplicationMenuMock,
      );
    });

    await builder.startHidden();

    productName = builder.mainDi.inject(productNameInjectable);

    advanceFakeTime(100);
  });

  it("translates the application menu to English by default", () => {
    expect(getTopLevelLabels()).toEqual(["File", "Edit", "View", "Help"]);
  });

  it("translates the file menu to English by default", () => {
    expect(getLabelsOfSubMenu("file")).toEqual([
      "Add Cluster",
      "Preferences",
      "Extensions",
      "Quit",
    ]);
  });

  it("shows the labels of the tray in English by default", () => {
    expect(builder.tray.get("open-app")?.label).toBe(`Open ${productName}`);
    expect(builder.tray.get("open-preferences")?.label).toBe("Preferences");
    expect(builder.tray.get("quit-app")?.label).toBe("Quit App");
  });

  it("does not offer an about item in the tray", () => {
    expect(builder.tray.get("about-app")).toBeNull();
  });

  describe("when the language preference is simplified Chinese", () => {
    beforeEach(() => {
      const userPreferencesState = builder.mainDi.inject(userPreferencesStateInjectable);

      runInAction(() => {
        userPreferencesState.locale = "zh-CN";
      });

      advanceFakeTime(100);
    });

    it("translates the top level of the application menu", () => {
      expect(getTopLevelLabels()).toEqual(["文件", "编辑", "视图", "帮助"]);
    });

    it("translates the items of the file menu", () => {
      expect(getLabelsOfSubMenu("file")).toEqual([
        "添加集群",
        "偏好设置",
        "扩展",
        "退出",
      ]);
    });

    it("translates the operating system actions of the edit menu", () => {
      expect(getLabelsOfSubMenu("edit")?.slice(0, 2)).toEqual(["撤销", "重做"]);
    });

    it("translates the items of the view menu", () => {
      expect(getLabelsOfSubMenu("view")).toContain("资源目录");
    });

    it("translates the items of the help menu", () => {
      expect(getLabelsOfSubMenu("help")).toContain("欢迎页");
    });

    it("translates the labels of the tray", () => {
      expect(builder.tray.get("open-app")?.label).toBe(`打开 ${productName}`);
      expect(builder.tray.get("open-preferences")?.label).toBe("偏好设置");
      expect(builder.tray.get("quit-app")?.label).toBe("退出应用");
    });
  });
});
