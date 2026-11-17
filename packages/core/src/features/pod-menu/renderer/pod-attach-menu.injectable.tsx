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
import { useTranslation } from "../../../renderer/i18n/i18n-context";
import { ContainerMenuItem } from "./container-menu-item";
import type { PodMenuTerminal } from "./pod-menu-terminal.injectable";
import podMenuTerminalInjectable from "./pod-menu-terminal.injectable";

interface Dependencies {
  terminal: PodMenuTerminal;
}

const NonInjectedPodAttachMenu = ({ object: pod, toolbar, terminal }: KubeObjectMenuProps<Pod> & Dependencies) => {
  const { t } = useTranslation();

  const attach = (container: Container) => {
    void terminal.runInNewTab(t("pod-menu.attach-tab-title", { name: pod.getName(), namespace: pod.getNs() }), [
      terminal.kubectlPath,
      "attach", "-i", "-t",
      "-n", pod.getNs(),
      pod.getName(),
      "-c", container.name,
    ]);
  };

  return (
    <ContainerMenuItem
      icon={{ material: "pageview" }}
      title={t("pod-menu.attach")}
      tooltip={t("pod-menu.attach-tooltip")}
      toolbar={toolbar}
      containers={pod.getRunningContainers()}
      onSelect={attach}
    />
  );
};

const PodAttachMenu = withInjectables<Dependencies, KubeObjectMenuProps<Pod>>(NonInjectedPodAttachMenu, {
  getProps: (di, props) => ({
    ...props,
    terminal: di.inject(podMenuTerminalInjectable),
  }),
});

const podAttachMenuInjectable = getInjectable({
  id: "pod-attach-menu-kube-object-menu",

  instantiate: () => ({
    kind: "Pod",
    apiVersions: ["v1"],
    Component: PodAttachMenu as KubeObjectMenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 11,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default podAttachMenuInjectable;
