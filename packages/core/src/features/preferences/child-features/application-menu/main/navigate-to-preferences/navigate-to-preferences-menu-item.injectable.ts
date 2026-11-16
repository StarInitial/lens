/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../../../../../application-menu/main/menu-items/application-menu-item-injection-token";
import navigateToPreferencesInjectable from "../../../../common/navigate-to-preferences.injectable";
import isMacInjectable from "../../../../../../common/vars/is-mac.injectable";

const navigateToPreferencesMenuItemInjectable = getInjectable({
  id: "navigate-to-preferences-menu-item",

  instantiate: (di) => {
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
    const isMac = di.inject(isMacInjectable);
    const i18n = di.inject(i18nInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: isMac ? "mac" : "file",
      id: "navigate-to-preferences",
      orderNumber: isMac ? 40 : 30,
      label: computed(() => i18n.t("menu.preferences")),
      keyboardShortcut: isMac ? "CmdOrCtrl+," : "Ctrl+,",

      onClick: () => {
        navigateToPreferences();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default navigateToPreferencesMenuItemInjectable;
