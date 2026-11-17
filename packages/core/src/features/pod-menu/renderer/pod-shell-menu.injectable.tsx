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

/**
 * The script handed to `sh -c` inside the container. It clears the screen first, so the hand-over from the
 * host shell (its startup warnings and the echoed kubectl command) leaves only the container shell visible,
 * then replaces itself with the best available shell. `exec` is only attempted after `command -v` confirms
 * the binary exists: in a non-interactive shell a failing `exec` terminates with 127 instead of falling
 * through to the next candidate.
 */
export const containerShellScript = [
  "clear 2>/dev/null || true",
  "command -v bash >/dev/null 2>&1 && exec bash",
  "command -v ash >/dev/null 2>&1 && exec ash",
  "exec sh",
].join("; ");

const NonInjectedPodShellMenu = ({ object: pod, toolbar, terminal }: KubeObjectMenuProps<Pod> & Dependencies) => {
  const { t } = useTranslation();

  const execInContainer = (container: Container) => {
    // The script is quoted once for the terminal's own shell so it reaches `sh -c` as a single argument.
    const shell = pod.getSelectedNodeOs() === "windows"
      ? "powershell -NoLogo"
      : `sh -c ${terminal.quote(containerShellScript)}`;

    void terminal.runInNewTab(t("pod-menu.shell-tab-title", { name: pod.getName(), namespace: pod.getNs() }), [
      terminal.kubectlPath,
      "exec", "-i", "-t",
      "-n", pod.getNs(),
      pod.getName(),
      "-c", container.name,
      "--", shell,
    ]);
  };

  return (
    <ContainerMenuItem
      icon={{ svg: "ssh" }}
      title={t("pod-menu.shell")}
      tooltip={t("pod-menu.shell-tooltip")}
      toolbar={toolbar}
      containers={pod.getRunningContainers()}
      onSelect={execInContainer}
    />
  );
};

const PodShellMenu = withInjectables<Dependencies, KubeObjectMenuProps<Pod>>(NonInjectedPodShellMenu, {
  getProps: (di, props) => ({
    ...props,
    terminal: di.inject(podMenuTerminalInjectable),
  }),
});

const podShellMenuInjectable = getInjectable({
  id: "pod-shell-menu-kube-object-menu",

  instantiate: () => ({
    kind: "Pod",
    apiVersions: ["v1"],
    Component: PodShellMenu as KubeObjectMenuItemComponent,
    enabled: computed(() => true),
    orderNumber: 10,
  }),

  injectionToken: kubeObjectMenuItemInjectionToken,
});

export default podShellMenuInjectable;
