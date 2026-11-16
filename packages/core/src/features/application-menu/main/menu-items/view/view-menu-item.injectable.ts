/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../application-menu-item-injection-token";

const viewMenuItemInjectable = getInjectable({
  id: "view-application-menu-item",

  instantiate: (di) => {
    const i18n = di.inject(i18nInjectable);

    return {
      kind: "top-level-menu" as const,
      parentId: "root" as const,
      id: "view",
      orderNumber: 40,
      label: computed(() => i18n.t("menu.view")),
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default viewMenuItemInjectable;
