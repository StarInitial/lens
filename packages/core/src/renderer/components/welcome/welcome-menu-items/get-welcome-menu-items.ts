/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import type { NavigateToCatalog } from "../../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import type { I18n } from "../../../../common/i18n/i18n.injectable";

interface Dependencies {
  extensions: IComputedValue<LensRendererExtension[]>;
  navigateToCatalog: NavigateToCatalog;
  i18n: I18n;
}

export const getWelcomeMenuItems = ({
  extensions,
  navigateToCatalog,
  i18n,
}: Dependencies) => {
  const browseClusters = {
    title: () => i18n.t("welcome.menu.browse-clusters-in-catalog"),
    icon: "view_list",

    click: () =>
      navigateToCatalog({
        group: "entity.k8slens.dev",
        kind: "KubernetesCluster",
      }),
  };

  return computed(() => [
    browseClusters,
    ...extensions.get().flatMap((extension) => extension.welcomeMenus),
  ]);
};
