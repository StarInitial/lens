/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { webContents } from "electron";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";

const goBackMenuItemInjectable = getInjectable({
  id: "go-back-menu-item",

  instantiate: (di) => {
    const i18n = di.inject(i18nInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: "view",
      id: "go-back",
      orderNumber: 40,
      label: computed(() => i18n.t("menu.back")),
      keyboardShortcut: "CmdOrCtrl+[",

      onClick: () => {
        webContents
          .getAllWebContents()
          .filter((wc) => wc.getType() === "window")
          .forEach((wc) => wc.goBack());
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default goBackMenuItemInjectable;
