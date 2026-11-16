/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../../common/cluster/cluster";
import { makeObservable, observable, runInAction } from "mobx";
import { SubTitle } from "../layout/sub-title";
import React from "react";
import { Input } from "../input/input";
import { observer } from "mobx-react";
import { Icon } from "@k8slens/icon";
import { initialNodeShellImage } from "../../../common/cluster-types";
import Gutter from "../gutter/gutter";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { I18n } from "../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../common/i18n/i18n.injectable";
import { TranslatedKeyText } from "../../i18n/translated-text";

export interface ClusterNodeShellSettingProps {
  cluster: Cluster;
}

interface Dependencies {
  i18n: I18n;
}

@observer
class NonInjectedClusterNodeShellSetting extends React.Component<ClusterNodeShellSettingProps & Dependencies> {
  @observable nodeShellImage = this.props.cluster.preferences?.nodeShellImage || "";
  @observable imagePullSecret = this.props.cluster.preferences?.imagePullSecret || "";

  constructor(props: ClusterNodeShellSettingProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentWillUnmount() {
    runInAction(() => {
      this.props.cluster.preferences.nodeShellImage = this.nodeShellImage || undefined;
      this.props.cluster.preferences.imagePullSecret = this.imagePullSecret || undefined;
    });
  }

  render() {
    const { t } = this.props.i18n;

    return (
      <>
        <section>
          <SubTitle title="cluster-settings.node-shell-image" id="node-shell-image"/>
          <Input
            theme="round-black"
            placeholder={t("cluster-settings.node-shell-image-placeholder", { image: initialNodeShellImage })}
            value={this.nodeShellImage}
            onChange={value => this.nodeShellImage = value}
            iconRight={
              this.nodeShellImage
                ? (
                  <Icon
                    smallest
                    material="close"
                    onClick={() => this.nodeShellImage = ""}
                    tooltip={t("cluster-settings.reset")}
                  />
                )
                : undefined
            }
          />
          <small className="hint">
            <TranslatedKeyText value="cluster-settings.node-shell-image-hint" />
          </small>
        </section>
        <Gutter />
        <section>
          <SubTitle title="cluster-settings.image-pull-secret" id="image-pull-secret"/>
          <Input
            placeholder={t("cluster-settings.image-pull-secret-placeholder")}
            theme="round-black"
            value={this.imagePullSecret}
            onChange={value => this.imagePullSecret = value}
            iconRight={
              this.imagePullSecret
                ? (
                  <Icon
                    smallest
                    material="close"
                    onClick={() => this.imagePullSecret = ""}
                    tooltip={t("cluster-settings.clear")}
                  />
                )
                : undefined
            }
          />
          <small className="hint">
            <TranslatedKeyText value="cluster-settings.image-pull-secret-hint" />
          </small>
        </section>
      </>
    );
  }
}

export const ClusterNodeShellSetting = withInjectables<Dependencies, ClusterNodeShellSettingProps>(NonInjectedClusterNodeShellSetting, {
  getProps: (di, props) => ({
    ...props,
    i18n: di.inject(i18nInjectable),
  }),
});
