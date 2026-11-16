/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../common/i18n/i18n.injectable";
import isMacInjectable from "../../../../../common/vars/is-mac.injectable";
import applicationMenuItemInjectionToken from "../application-menu-item-injection-token";

/**
 * On macOS "About" belongs to the application menu, so this top level menu is
 * only shown on the other platforms.
 */
const aboutTopLevelMenuItemInjectable = getInjectable({
  id: "about-top-level-application-menu-item",

  instantiate: (di) => {
    const i18n = di.inject(i18nInjectable);
    const isMac = di.inject(isMacInjectable);

    return {
      kind: "top-level-menu" as const,
      id: "about-menu",
      parentId: "root" as const,
      orderNumber: 50,
      label: computed(() => i18n.t("menu.about-menu")),
      isShown: !isMac,
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default aboutTopLevelMenuItemInjectable;
