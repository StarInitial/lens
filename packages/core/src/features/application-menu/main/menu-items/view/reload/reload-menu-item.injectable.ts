/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import reloadCurrentApplicationWindowInjectable from "../../../../../../main/start-main-application/lens-window/reload-current-application-window.injectable";

const reloadMenuItemInjectable = getInjectable({
  id: "reload-menu-item",

  instantiate: (di) => {
    const reloadApplicationWindow = di.inject(
      reloadCurrentApplicationWindowInjectable,
    );
    const i18n = di.inject(i18nInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: "view",
      id: "reload",
      orderNumber: 60,
      label: computed(() => i18n.t("menu.reload")),
      keyboardShortcut: "CmdOrCtrl+R",

      onClick: () => {
        reloadApplicationWindow();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default reloadMenuItemInjectable;
