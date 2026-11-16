/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import isMacInjectable from "../../../../../../common/vars/is-mac.injectable";

const closeWindowMenuItemInjectable = getInjectable({
  id: "close-window-application-menu-item",

  instantiate: (di) => {
    const isMac = di.inject(isMacInjectable);
    const i18n = di.inject(i18nInjectable);

    return {
      id: "close-window",
      kind: "os-action-menu-item" as const,
      parentId: "file",
      orderNumber: 60,
      actionName: "close" as const,
      label: computed(() => i18n.t("menu.close-window")),
      keyboardShortcut: "Shift+Cmd+W",
      isShown: isMac,
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default closeWindowMenuItemInjectable;
