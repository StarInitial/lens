/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { Container, Pod } from "@k8slens/kube-object";
import type { KubeObjectMenuProps } from "../../../renderer/components/kube-object-menu";
import type { KubeObjectMenuItemComponent } from "../../../renderer/components/kube-object-menu/kube-object-menu-item-injection-token";
import { kubeObjectMenuItemInjectionToken } from "../../../renderer/components/kube-object-menu/kube-object-menu-item-injection-token";
import type { HideDetails } from "../../../renderer/components/kube-detail-params/hide-details.injectable";
import hideDetailsInjectable from "../../../renderer/components/kube-detail-params/hide-details.injectable";
import type { ColoredLogsStore } from "../../colored-logs/renderer/colored-logs-store.injectable";
import coloredLogsStoreInjectable from "../../colored-logs/renderer/colored-logs-store.injectable";
import { useTranslation } from "../../../renderer/i18n/i18n-context";
import { ContainerMenuItem, containerStatusBrick } from "./container-menu-item";

interface Dependencies {
  coloredLogsStore: ColoredLogsStore;
  hideDetails: HideDetails;
}

const NonInjectedPodColoredLogsMenu = ({ object: pod, toolbar, coloredLogsStore, hideDetails }: KubeObjectMenuProps<Pod> & Dependencies) => {
  const { t } = useTranslation();

  const openLogs = (container: Container) => {
    hideDetails();
    coloredLogsStore.openForPod(pod, container.name);
  };

  return (
    <ContainerMenuItem
      icon={{ material: "palette" }}
      title={t("pod-menu.colored-logs")}
      tooltip={t("pod-menu.colored-logs-tooltip")}
      toolbar={toolbar}
      containers={pod.getAllContainers()}
      onSelect={openLogs}
      renderStatus={containerStatusBrick(pod)}
    />
  );
};

const PodColoredLogsMenu = withInjectables<Dependencies, KubeObjectMenuProps<Pod>>(NonInjectedPodColoredLogsMenu, {
  getProps: (di, props) => ({
    ...props,
    coloredLogsStore: di.inject(coloredLogsStoreInjectable),
    hideDetails: di.inject(hideDetailsInjectable),
  }),
});

const podColoredLogsMenuInjectable = getInjectable({
  id: "pod-colored-logs-menu-kube-object-menu",

  instantiate: () => ({
    kind: "Pod",
    apiVersions: ["v1"],
    Component: PodColoredLogsMenu as KubeObjectMenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 13,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default podColoredLogsMenuInjectable;
