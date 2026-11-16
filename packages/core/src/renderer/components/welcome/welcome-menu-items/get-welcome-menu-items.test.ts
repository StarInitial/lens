/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed } from "mobx";
import type { I18n } from "../../../../common/i18n/i18n.injectable";
import { getWelcomeMenuItems } from "./get-welcome-menu-items";

describe("getWelcomeMenuItems", () => {
  const navigateToCatalog = jest.fn();
  const translations: Record<string, string> = {
    "welcome.menu.browse-clusters-in-catalog": "在集群目录中浏览集群",
  };
  const i18n = {
    t: (key: string) => translations[key] ?? key,
  } as Partial<I18n> as I18n;

  const getMenuItems = () => getWelcomeMenuItems({
    extensions: computed(() => []),
    navigateToCatalog,
    i18n,
  }).get();

  it("translates the title of the built-in menu item", () => {
    const title = getMenuItems()[0].title;

    expect(typeof title === "function" ? title() : title).toBe("在集群目录中浏览集群");
  });

  it("navigates to the catalog when the built-in menu item is clicked", async () => {
    await getMenuItems()[0].click();

    expect(navigateToCatalog).toHaveBeenCalledWith({
      group: "entity.k8slens.dev",
      kind: "KubernetesCluster",
    });
  });

  it("adds the menu items of the enabled extensions after the built-in one", () => {
    const extensionMenuItem = {
      title: "Some extension menu item",
      icon: "some-icon",
      click: () => {},
    };

    const items = getWelcomeMenuItems({
      extensions: computed(() => [{
        welcomeMenus: [extensionMenuItem],
      } as never]),
      navigateToCatalog,
      i18n,
    }).get();

    expect(items.at(-1)).toBe(extensionMenuItem);
  });
});
