/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { Node } from "@k8slens/kube-object";
import { Icon } from "@k8slens/icon";
import { MenuItem } from "../../../renderer/components/menu";
import type { KubeObjectMenuProps } from "../../../renderer/components/kube-object-menu";
import type { KubeObjectMenuItemComponent } from "../../../renderer/components/kube-object-menu/kube-object-menu-item-injection-token";
import { kubeObjectMenuItemInjectionToken } from "../../../renderer/components/kube-object-menu/kube-object-menu-item-injection-token";
import type { OpenConfirmDialog } from "../../../renderer/components/confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../../../renderer/components/confirm-dialog/open.injectable";
import { useTranslation } from "../../../renderer/i18n/i18n-context";
import type { PodMenuTerminal } from "./pod-menu-terminal.injectable";
import podMenuTerminalInjectable from "./pod-menu-terminal.injectable";

interface Dependencies {
  terminal: PodMenuTerminal;
  openConfirmDialog: OpenConfirmDialog;
}

const NonInjectedNodeMenu = ({ object: node, toolbar, terminal, openConfirmDialog }: KubeObjectMenuProps<Node> & Dependencies) => {
  const { t } = useTranslation();

  if (!node) {
    return null;
  }

  const name = node.getName();
  const send = (command: string) => void terminal.run(command);

  const item = (icon: { material?: string; svg?: string }, title: string, onClick: () => void) => (
    <MenuItem onClick={onClick}>
      <Icon
        {...icon}
        interactive={toolbar}
        tooltip={toolbar ? title : undefined}
      />
      <span className="title">{title}</span>
    </MenuItem>
  );

  const drain = () => openConfirmDialog({
    ok: () => send(`${terminal.kubectlPath} drain ${name} --delete-emptydir-data --ignore-daemonsets --force`),
    labelOk: t("pod-menu.drain-ok"),
    message: <p>{t("pod-menu.drain-confirm", { name })}</p>,
  });

  return (
    <>
      {item({ svg: "ssh" }, t("pod-menu.node-shell"), () => terminal.openNodeShell(t("pod-menu.node-shell-tab-title", { name }), name))}
      {node.isUnschedulable()
        ? item({ material: "play_circle_filled" }, t("pod-menu.uncordon"), () => send(`${terminal.kubectlPath} uncordon ${name}`))
        : item({ material: "pause_circle_filled" }, t("pod-menu.cordon"), () => send(`${terminal.kubectlPath} cordon ${name}`))}
      {item({ material: "delete_sweep" }, t("pod-menu.drain"), drain)}
    </>
  );
};

const NodeMenu = withInjectables<Dependencies, KubeObjectMenuProps<Node>>(NonInjectedNodeMenu, {
  getProps: (di, props) => ({
    ...props,
    terminal: di.inject(podMenuTerminalInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
});

const nodeMenuInjectable = getInjectable({
  id: "node-menu-kube-object-menu",

  instantiate: () => ({
    kind: "Node",
    apiVersions: ["v1"],
    Component: NodeMenu as KubeObjectMenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 20,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default nodeMenuInjectable;
