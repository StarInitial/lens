/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import navigateToAddClusterInjectable from "../../../../../../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";

const addClusterMenuItemInjectable = getInjectable({
  id: "add-cluster-application-menu-item",

  instantiate: (di) => {
    const navigateToAddCluster = di.inject(navigateToAddClusterInjectable);
    const i18n = di.inject(i18nInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: "file",
      id: "add-cluster",
      orderNumber: 10,
      label: computed(() => i18n.t("menu.add-cluster")),
      keyboardShortcut: "CmdOrCtrl+Shift+A",

      onClick: () => {
        navigateToAddCluster();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default addClusterMenuItemInjectable;
