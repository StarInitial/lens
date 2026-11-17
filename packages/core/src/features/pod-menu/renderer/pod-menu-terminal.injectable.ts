/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import userPreferencesStateInjectable from "../../../features/user-preferences/common/state.injectable";
import createTerminalTabInjectable from "../../../renderer/components/dock/terminal/create-terminal-tab.injectable";
import sendCommandInjectable from "../../../renderer/components/dock/terminal/send-command.injectable";
import hideDetailsInjectable from "../../../renderer/components/kube-detail-params/hide-details.injectable";
import terminalStoreInjectable from "../../../renderer/components/dock/terminal/store.injectable";

export interface PodMenuTerminal {
  /** The kubectl binary to run, honouring the configured binaries directory. */
  kubectlPath: string;

  /**
   * Opens a terminal tab and runs kubectl in it. Off Windows the shell is replaced by `exec`, so the tab
   * closes as soon as kubectl finishes.
   */
  runInNewTab(title: string, args: string[]): Promise<void>;

  /** Runs a command in a fresh terminal tab, keeping the shell open. */
  run(command: string): Promise<void>;

  /** Opens an interactive shell inside a Node. */
  openNodeShell(title: string, node: string): void;

  /**
   * Quotes a single argument so the terminal's own shell hands it to kubectl unchanged. On Windows the
   * shell is PowerShell or cmd, where single quotes are literal; on POSIX shells double quotes are used.
   */
  quote(argument: string): string;

  /**
   * Appends a visible notice for when the command fails, because a failing `kubectl exec` otherwise just
   * drops the user back to the shell prompt with no explanation.
   */
  withFailureNotice(command: string): string;

  /**
   * Clears the terminal view shortly after a command was typed, so the host shell's startup warnings and the
   * echoed kubectl command line are gone by the time the container shell prints its prompt.
   */
  scheduleViewClear(tabId: string): void;
}

const podMenuTerminalInjectable = getInjectable({
  id: "pod-menu-terminal",

  instantiate: (di): PodMenuTerminal => {
    const createTerminalTab = di.inject(createTerminalTabInjectable);
    const sendCommand = di.inject(sendCommandInjectable);
    const hideDetails = di.inject(hideDetailsInjectable);
    const isWindows = di.inject(isWindowsInjectable);
    const preferences = di.inject(userPreferencesStateInjectable);
    const terminalStore = di.inject(terminalStoreInjectable);

    const binariesDirectory = preferences.kubectlBinariesPath?.trim();
    const separator = binariesDirectory?.includes("\\") ? "\\" : "/";
    const kubectlPath = binariesDirectory
      ? `${binariesDirectory.replace(/[\\/]+$/, "")}${separator}${isWindows ? "kubectl.exe" : "kubectl"}`
      : "kubectl";

    return {
      kubectlPath,

      async runInNewTab(title, args) {
        const parts = isWindows ? args : ["exec", ...args];
        const tab = createTerminalTab({ title });

        await sendCommand(this.withFailureNotice(parts.join(" ")), { enter: true, tabId: tab.id });
        this.scheduleViewClear(tab.id);
        hideDetails();
      },

      async run(command) {
        await sendCommand(this.withFailureNotice(command), { enter: true });
        hideDetails();
      },

      openNodeShell(title, node) {
        createTerminalTab({ title, node });
        hideDetails();
      },

      quote(argument) {
        return isWindows ? `'${argument}'` : `"${argument}"`;
      },

      withFailureNotice(command) {
        if (isWindows) {
          return `${command}; if ($LASTEXITCODE) { Write-Host "[StarLens] kubectl exited with code $LASTEXITCODE" -ForegroundColor Yellow }`;
        }

        return `${command} || echo "[StarLens] kubectl exited with code $?"`;
      },

      scheduleViewClear(tabId) {
        // Written straight into xterm instead of the shell: PowerShell's own clear goes through the console
        // API, which the pty does not turn into a clear the terminal understands, and ANSI sent by a child
        // process is not reliably forwarded either. 300ms is after the command was echoed and before the
        // container shell has connected and printed its prompt.
        setTimeout(() => terminalStore.getTerminal(tabId as never)?.clearView(), 300);
      },
    };
  },
});

export default podMenuTerminalInjectable;
