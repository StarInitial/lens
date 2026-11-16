/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { onMultiSelectFor, Select } from "../select/select";
import { Icon } from "@k8slens/icon";
import { Button } from "@k8slens/button";
import { SubTitle } from "../layout/sub-title";
import type { Cluster } from "../../../common/cluster/cluster";
import { observable, reaction, makeObservable } from "mobx";
import { ClusterMetricsResourceType } from "../../../common/cluster-types";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { I18n } from "../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../common/i18n/i18n.injectable";
import { TranslatedKeyText } from "../../i18n/translated-text";

export interface ClusterMetricsSettingProps {
  cluster: Cluster;
}

interface Dependencies {
  i18n: I18n;
}

@observer
class NonInjectedClusterMetricsSetting extends React.Component<ClusterMetricsSettingProps & Dependencies> {
  @observable hiddenMetrics = observable.set<string>();

  constructor(props: ClusterMetricsSettingProps & Dependencies) {
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

  save = () => {
    this.props.cluster.preferences.hiddenMetrics = Array.from(this.hiddenMetrics);
  };

  onChangeButton = () => {
    this.hiddenMetrics.replace(Object.keys(ClusterMetricsResourceType));
    this.save();
  };

  reset = () => {
    this.hiddenMetrics.clear();
    this.save();
  };

  renderMetricsSelect() {
    const metricResourceTypeOptions = Object.values(ClusterMetricsResourceType)
      .map(type => ({
        value: type,
        label: type,
        isSelected: this.hiddenMetrics.has(type),
      }));

    return (
      <>
        <Select
          id="cluster-metric-resource-type-input"
          className="box grow"
          placeholder={this.props.i18n.t("cluster-settings.hide-metrics-placeholder")}
          isMulti
          isSearchable
          onMenuClose={this.save}
          closeMenuOnSelect={false}
          controlShouldRenderValue={false}
          options={metricResourceTypeOptions}
          onChange={onMultiSelectFor(this.hiddenMetrics)}
          formatOptionLabel={(option) => (
            <div className="flex gaps align-center">
              <span>{option.value}</span>
              {option.isSelected && (
                <Icon
                  smallest
                  material="check"
                  className="box right"
                />
              )}
            </div>
          )}
          themeName="lens"
        />
        <Button
          primary
          label={<TranslatedKeyText value="cluster-settings.hide-all-metrics" />}
          onClick={this.onChangeButton}
        />
        <Button
          primary
          label={<TranslatedKeyText value="cluster-settings.reset" />}
          onClick={this.reset}
        />
      </>
    );
  }

  render() {
    return (
      <div className="MetricsSelec0 mb-5">
        <SubTitle title={"cluster-settings.hide-metrics"}/>
        <div className="flex gaps">
          {this.renderMetricsSelect()}
        </div>
      </div>
    );
  }
}

export const ClusterMetricsSetting = withInjectables<Dependencies, ClusterMetricsSettingProps>(NonInjectedClusterMetricsSetting, {
  getProps: (di, props) => ({
    ...props,
    i18n: di.inject(i18nInjectable),
  }),
});
