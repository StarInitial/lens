/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import navigateToCatalogInjectable from "../../../../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";

const navigateToCatalogMenuItemInjectable = getInjectable({
  id: "navigate-to-catalog-menu-item",

  instantiate: (di) => {
    const navigateToCatalog = di.inject(navigateToCatalogInjectable);
    const i18n = di.inject(i18nInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: "view",
      id: "navigate-to-catalog",
      orderNumber: 10,
      label: computed(() => i18n.t("menu.catalog")),
      keyboardShortcut: "Shift+CmdOrCtrl+C",

      onClick: () => {
        navigateToCatalog();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default navigateToCatalogMenuItemInjectable;
