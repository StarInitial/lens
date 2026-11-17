/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { makeObservable, observable, runInAction } from "mobx";
import type { Pod } from "@k8slens/kube-object";

export interface ColoredLogsTab {
  id: string;
  namespace: string;
  pod: string;
  container: string;
  containers: string[];
}

const tabId = (namespace: string, pod: string, container: string) => `${namespace}/${pod}/${container}`;

/**
 * State of the colored logs panel that opens at the bottom of the cluster frame.
 */
export class ColoredLogsStore {
  @observable.shallow tabs: ColoredLogsTab[] = [];
  @observable activeTabId: string | null = null;
  @observable isOpen = false;
  @observable isMinimized = false;
  @observable height = 360;

  constructor() {
    makeObservable(this);
  }

  get activeTab(): ColoredLogsTab | undefined {
    return this.tabs.find((tab) => tab.id === this.activeTabId) ?? this.tabs[0];
  }

  openForPod(pod: Pod, container: string): void {
    const id = tabId(pod.getNs(), pod.getName(), container);
    const existing = this.tabs.find((tab) => tab.id === id);

    runInAction(() => {
      if (!existing) {
        this.tabs = [...this.tabs, {
          id,
          namespace: pod.getNs(),
          pod: pod.getName(),
          container,
          containers: pod.getAllContainers().map((item) => item.name),
        }];
      }

      this.activeTabId = id;
      this.isOpen = true;
      this.isMinimized = false;
    });
  }

  closeTab(id: string): void {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    const tabs = this.tabs.filter((tab) => tab.id !== id);

    runInAction(() => {
      this.tabs = tabs;

      if (this.activeTabId === id) {
        this.activeTabId = (tabs[Math.min(index, tabs.length - 1)] ?? { id: null }).id;
      }

      this.isOpen = tabs.length > 0;
    });
  }

  selectTab(id: string): void {
    runInAction(() => {
      this.activeTabId = id;
      this.isMinimized = false;
    });
  }

  /**
   * Switches the container of a tab, reusing the existing tab of that container when there is one.
   */
  switchContainer(tab: ColoredLogsTab, container: string): void {
    const id = tabId(tab.namespace, tab.pod, container);

    runInAction(() => {
      this.tabs = this.tabs.some((item) => item.id === id)
        ? this.tabs.filter((item) => item.id !== tab.id)
        : this.tabs.map((item) => (item.id === tab.id ? { ...item, id, container } : item));
      this.activeTabId = id;
    });
  }

  toggleMinimized(): void {
    runInAction(() => {
      this.isMinimized = !this.isMinimized;
    });
  }

  closeAll(): void {
    runInAction(() => {
      this.tabs = [];
      this.activeTabId = null;
      this.isOpen = false;
    });
  }

  setHeight(height: number): void {
    runInAction(() => {
      this.height = height;
    });
  }
}

const coloredLogsStoreInjectable = getInjectable({
  id: "colored-logs-store",
  instantiate: () => new ColoredLogsStore(),
});

export default coloredLogsStoreInjectable;
