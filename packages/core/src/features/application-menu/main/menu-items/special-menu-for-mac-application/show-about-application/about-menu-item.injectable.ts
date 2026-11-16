/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import productNameInjectable from "../../../../../../common/vars/product-name.injectable";
import showAboutInjectable from "./show-about.injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import isMacInjectable from "../../../../../../common/vars/is-mac.injectable";

const aboutMenuItemInjectable = getInjectable({
  id: "about-menu-item",

  instantiate: (di) => {
    const productName = di.inject(productNameInjectable);
    const showAbout = di.inject(showAboutInjectable);
    const isMac = di.inject(isMacInjectable);
    const i18n = di.inject(i18nInjectable);

    return {
      kind: "clickable-menu-item" as const,
      id: "about",
      parentId: isMac ? "mac" : "about-menu",
      orderNumber: 10,
      label: computed(() => i18n.t("menu.about", { productName })),

      onClick() {
        showAbout();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default aboutMenuItemInjectable;
