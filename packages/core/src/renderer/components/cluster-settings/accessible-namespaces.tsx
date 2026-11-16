/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import type { Cluster } from "../../../common/cluster/cluster";
import { SubTitle } from "../layout/sub-title";
import { EditableList } from "../editable-list";
import { observable, makeObservable } from "mobx";
import { systemName } from "../input/input_validators";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { I18n } from "../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../common/i18n/i18n.injectable";
import { TranslatedKeyText } from "../../i18n/translated-text";

export interface ClusterAccessibleNamespacesProps {
  cluster: Cluster;
}

interface Dependencies {
  i18n: I18n;
}

@observer
class NonInjectedClusterAccessibleNamespaces extends React.Component<ClusterAccessibleNamespacesProps & Dependencies> {
  @observable namespaces = new Set(this.props.cluster.accessibleNamespaces);

  constructor(props: ClusterAccessibleNamespacesProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  render() {
    return (
      <>
        <SubTitle title="cluster-settings.accessible-namespaces" id="accessible-namespaces" />
        <EditableList
          placeholder={this.props.i18n.t("cluster-settings.accessible-namespaces-placeholder")}
          add={(newNamespace) => {
            this.namespaces.add(newNamespace);
            this.props.cluster.accessibleNamespaces.replace([...this.namespaces]);
          }}
          validators={systemName}
          items={Array.from(this.namespaces)}
          remove={({ oldItem: oldNamespace }) => {
            this.namespaces.delete(oldNamespace);
            this.props.cluster.accessibleNamespaces.replace([...this.namespaces]);
          }}
          inputTheme="round-black"
        />
        <small className="hint">
          <TranslatedKeyText value="cluster-settings.accessible-namespaces-hint" />
        </small>
      </>
    );
  }
}

export const ClusterAccessibleNamespaces = withInjectables<Dependencies, ClusterAccessibleNamespacesProps>(NonInjectedClusterAccessibleNamespaces, {
  getProps: (di, props) => ({
    ...props,
    i18n: di.inject(i18nInjectable),
  }),
});
