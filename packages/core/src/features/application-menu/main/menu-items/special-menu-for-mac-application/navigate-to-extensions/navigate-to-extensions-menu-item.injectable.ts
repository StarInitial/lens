/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import navigateToExtensionsInjectable from "../../../../../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";
import isMacInjectable from "../../../../../../common/vars/is-mac.injectable";

const navigateToExtensionsMenuItem = getInjectable({
  id: "navigate-to-extensions-menu-item",

  instantiate: (di) => {
    const navigateToExtensions = di.inject(navigateToExtensionsInjectable);
    const isMac = di.inject(isMacInjectable);
    const i18n = di.inject(i18nInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: isMac ? "mac" : "file",
      id: "navigate-to-extensions",
      orderNumber: isMac ? 50 : 40,
      label: computed(() => i18n.t("menu.extensions")),
      keyboardShortcut: isMac ? "CmdOrCtrl+Shift+E" : "Ctrl+Shift+E",

      onClick: () => {
        navigateToExtensions();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default navigateToExtensionsMenuItem;
