/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Cluster } from "../../../common/cluster/cluster";
import { observable, reaction, makeObservable } from "mobx";
import { Badge } from "../badge/badge";
import { Icon } from "@k8slens/icon";
import { Notice } from "../extensions/notice";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { I18n } from "../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../common/i18n/i18n.injectable";
import { TranslatedKeyText } from "../../i18n/translated-text";

export interface ShowMetricsSettingProps {
  cluster: Cluster;
}

interface Dependencies {
  i18n: I18n;
}

@observer
class NonInjectedShowMetricsSetting extends React.Component<ShowMetricsSettingProps & Dependencies> {
  @observable hiddenMetrics = observable.set<string>();

  constructor(props: ShowMetricsSettingProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.hiddenMetrics = observable.set<string>(this.props.cluster.preferences.hiddenMetrics ?? []);

    disposeOnUnmount(this, [
      reaction(() => this.props.cluster.preferences.hiddenMetrics, () => {
        this.hiddenMetrics = observable.set<string>(this.props.cluster.preferences.hiddenMetrics ?? []);
      }),
    ]);
  }

  removeMetric(metric: string) {
    this.hiddenMetrics.delete(metric);
    this.props.cluster.preferences.hiddenMetrics = Array.from(this.hiddenMetrics);
  }

  renderMetrics() {
    const metrics = Array.from(this.hiddenMetrics);

    if (!metrics.length) {
      return (
        <div className="flex-grow text-center">
          <TranslatedKeyText value="cluster-settings.all-metrics-visible" />
        </div>
      );
    }

    return (
      metrics.map(name => {
        const tooltipId = `${name}`;

        return (
          <Badge
            key={name}
            flat
            expandable={false}
          >
            <span id={tooltipId}>{name}</span>
            <Icon
              smallest
              material="clear"
              onClick={() => this.removeMetric(name)}
              tooltip={this.props.i18n.t("cluster-settings.remove")}
              className="mx-3"
            />
          </Badge>
        );
      })
    );
  }

  render() {
    return (
      <Notice>
        <div className="MetricsSelect flex wrap gaps leading-relaxed">
          {this.renderMetrics()}
        </div>
      </Notice>
    );
  }
}

export const ShowMetricsSetting = withInjectables<Dependencies, ShowMetricsSettingProps>(NonInjectedShowMetricsSetting, {
  getProps: (di, props) => ({
    ...props,
    i18n: di.inject(i18nInjectable),
  }),
});
