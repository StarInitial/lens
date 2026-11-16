/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../application-menu-item-injection-token";

const fileMenuItemInjectable = getInjectable({
  id: "file-application-menu-item",

  instantiate: (di) => {
    const i18n = di.inject(i18nInjectable);

    return {
      kind: "top-level-menu" as const,
      id: "file",
      parentId: "root" as const,
      orderNumber: 20,
      label: computed(() => i18n.t("menu.file")),
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default fileMenuItemInjectable;
