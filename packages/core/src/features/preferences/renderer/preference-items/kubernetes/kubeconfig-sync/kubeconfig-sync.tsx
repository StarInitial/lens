/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { computed, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import React from "react";
import { Notice } from "../../../../../../renderer/components/extensions/notice";
import { iter, tuple } from "@k8slens/utilities";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { PathPicker } from "../../../../../../renderer/components/path-picker/path-picker";
import { Spinner } from "@k8slens/spinner";
import { RemovableItem } from "../../../removable-item/removable-item";
import isWindowsInjectable from "../../../../../../common/vars/is-windows.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import type { Logger } from "@k8slens/logger";
import type { DiscoverAllKubeconfigSyncKinds } from "./discover-all-sync-kinds.injectable";
import type { DiscoverKubeconfigSyncKind, SyncKind } from "./discover-sync-kind.injectable";
import discoverKubeconfigSyncKindInjectable from "./discover-sync-kind.injectable";
import discoverAllKubeconfigSyncKindsInjectable from "./discover-all-sync-kinds.injectable";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import type { I18n } from "../../../../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";

interface Entry extends SyncKind {
  filePath: string;
}

interface Dependencies {
  state: UserPreferencesState;
  isWindows: boolean;
  logger: Logger;
  discoverAllKubeconfigSyncKinds: DiscoverAllKubeconfigSyncKinds;
  discoverKubeconfigSyncKind: DiscoverKubeconfigSyncKind;
  i18n: I18n;
}

@observer
class NonInjectedKubeconfigSync extends React.Component<Dependencies> {
  readonly syncs = observable.map<string, SyncKind>();
  @observable loaded = false;

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  async componentDidMount() {
    const mapEntries = await Promise.all(
      iter.map(
        this.props.state.syncKubeconfigEntries,
        ([filePath]) => this.props.discoverKubeconfigSyncKind(filePath),
      ),
    );

    this.syncs.replace(mapEntries);
    this.loaded = true;

    disposeOnUnmount(this, [
      reaction(
        () => Array.from(this.syncs.entries(), ([filePath, kind]) => tuple.from(filePath, kind)),
        syncs => {
          this.props.state.syncKubeconfigEntries.replace(syncs);
        },
      ),
    ]);
  }

  @computed get syncsList(): Entry[] | undefined {
    if (!this.loaded) {
      return undefined;
    }

    return Array.from(this.syncs.entries(), ([filePath, value]) => ({ filePath, ...value }));
  }

  onPick = async (filePaths: string[]) => {
    this.syncs.merge(await this.props.discoverAllKubeconfigSyncKinds(filePaths));
  };

  getIconName(entry: Entry) {
    switch (entry.type) {
      case "file":
        return "description";
      case "folder":
        return "folder";
      case "unknown":
        return "help_outline";
    }
  }

  renderEntry = (entry: Entry) => {
    return (
      <RemovableItem
        key={entry.filePath}
        onRemove={() => this.syncs.delete(entry.filePath)}
        className="mt-3"
        icon={this.getIconName(entry)}
      >
        <div className="flex-grow break-all">
          {entry.filePath}
        </div>
      </RemovableItem>
    );
  };

  renderEntries() {
    const entries = this.syncsList;

    if (!entries) {
      return (
        <div className="loading-spinner">
          <Spinner />
        </div>
      );
    }

    if (!entries.length) {
      return (
        <Notice className="mt-3">
          <div className="flex-grow text-center">{this.props.i18n.t("preferences.kubernetes.kubeconfig-sync.empty")}</div>
        </Notice>
      );
    }

    return (
      <div>
        {entries.map(this.renderEntry)}
      </div>
    );
  }

  renderSyncButtons() {
    const { t } = this.props.i18n;

    if (this.props.isWindows) {
      return (
        <div className="flex gaps align-center mb-5">
          <PathPicker
            message={t("preferences.kubernetes.kubeconfig-sync.sync-files")}
            onPick={this.onPick}
            buttonLabel={t("preferences.kubernetes.kubeconfig-sync.sync")}
            properties={["showHiddenFiles", "multiSelections", "openFile"]}
          />
          <span>{t("preferences.kubernetes.kubeconfig-sync.or")}</span>
          <PathPicker
            message={t("preferences.kubernetes.kubeconfig-sync.sync-folders")}
            onPick={this.onPick}
            buttonLabel={t("preferences.kubernetes.kubeconfig-sync.sync")}
            properties={["showHiddenFiles", "multiSelections", "openDirectory"]}
          />
        </div>
      );
    }

    return (
      <div className="self-start mb-5">
        <PathPicker
          message={t("preferences.kubernetes.kubeconfig-sync.sync-files-and-folders")}
          onPick={this.onPick}
          buttonLabel={t("preferences.kubernetes.kubeconfig-sync.sync")}
          properties={["showHiddenFiles", "multiSelections", "openFile", "openDirectory"]}
        />
      </div>
    );
  }

  render() {
    return (
      <section id="kube-sync">
        <h2 data-testid="kubernetes-sync-header">{this.props.i18n.t("preferences.kubernetes.kubeconfig-sync.header")}</h2>

        {this.renderSyncButtons()}
        <SubTitle title="preferences.kubernetes.kubeconfig-sync.synced-items" className="pt-5"/>
        {this.renderEntries()}
      </section>
    );
  }
}

export const KubeconfigSync = withInjectables<Dependencies>(NonInjectedKubeconfigSync, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
    isWindows: di.inject(isWindowsInjectable),
    logger: di.inject(loggerInjectionToken),
    discoverAllKubeconfigSyncKinds: di.inject(discoverAllKubeconfigSyncKindsInjectable),
    discoverKubeconfigSyncKind: di.inject(discoverKubeconfigSyncKindInjectable),
    i18n: di.inject(i18nInjectable),
  }),
});
