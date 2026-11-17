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
import type { PodLogsTabData } from "../../../renderer/components/dock/logs/create-pod-logs-tab.injectable";
import createPodLogsTabInjectable from "../../../renderer/components/dock/logs/create-pod-logs-tab.injectable";
import type { HideDetails } from "../../../renderer/components/kube-detail-params/hide-details.injectable";
import hideDetailsInjectable from "../../../renderer/components/kube-detail-params/hide-details.injectable";
import { useTranslation } from "../../../renderer/i18n/i18n-context";
import { ContainerMenuItem, containerStatusBrick } from "./container-menu-item";

interface Dependencies {
  createPodLogsTab: (data: PodLogsTabData) => unknown;
  hideDetails: HideDetails;
}

const NonInjectedPodLogsMenu = ({ object: pod, toolbar, createPodLogsTab, hideDetails }: KubeObjectMenuProps<Pod> & Dependencies) => {
  const { t } = useTranslation();

  const showLogs = (container: Container) => {
    hideDetails();
    createPodLogsTab({ selectedPod: pod, selectedContainer: container });
  };

  return (
    <ContainerMenuItem
      icon={{ material: "subject" }}
      title={t("pod-menu.logs")}
      tooltip={t("pod-menu.logs-tooltip")}
      toolbar={toolbar}
      containers={pod.getAllContainers()}
      onSelect={showLogs}
      renderStatus={containerStatusBrick(pod)}
    />
  );
};

const PodLogsMenu = withInjectables<Dependencies, KubeObjectMenuProps<Pod>>(NonInjectedPodLogsMenu, {
  getProps: (di, props) => ({
    ...props,
    createPodLogsTab: di.inject(createPodLogsTabInjectable),
    hideDetails: di.inject(hideDetailsInjectable),
  }),
});

const podLogsMenuInjectable = getInjectable({
  id: "pod-logs-menu-kube-object-menu",

  instantiate: () => ({
    kind: "Pod",
    apiVersions: ["v1"],
    Component: PodLogsMenu as KubeObjectMenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 12,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default podLogsMenuInjectable;
