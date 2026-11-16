/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { trayMenuItemInjectionToken } from "../tray-menu-item-injection-token";
import { computed } from "mobx";
import requestQuitOfAppInjectable from "../../../electron-app/features/require-quit.injectable";
import i18nInjectable from "../../../../common/i18n/i18n.injectable";

const quitAppTrayItemInjectable = getInjectable({
  id: "quit-app-tray-item",

  instantiate: (di) => {
    const i18n = di.inject(i18nInjectable);

    return {
      id: "quit-app",
      parentId: null,
      orderNumber: 150,
      label: computed(() => i18n.t("tray.quit")),
      enabled: computed(() => true),
      visible: computed(() => true),
      click: di.inject(requestQuitOfAppInjectable),
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default quitAppTrayItemInjectable;
