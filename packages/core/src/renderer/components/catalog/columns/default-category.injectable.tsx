/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "../catalog.module.scss";
import React from "react";
import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";
import { KubeObject } from "@k8slens/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import getLabelBadgesInjectable from "../get-label-badges.injectable";
import { TranslatedSpan, TranslatedText } from "../../../i18n/translated-text";

const defaultCategoryColumnsInjectable = getInjectable({
  id: "default-category-columns",
  instantiate: (di): RegisteredAdditionalCategoryColumn[] => {
    const getLabelBadges = di.inject(getLabelBadgesInjectable);

    return [
      {
        id: "source",
        priority: 10,
        renderCell: entity => <TranslatedText namespace="catalog.sources." value={entity.getSource()} />,
        titleProps: {
          title: "catalog.columns.source",
          className: styles.sourceCell,
          id: "source",
          sortBy: "source",
          "data-testid": "catalog-source-column",
        },
        sortCallback: entity => entity.getSource(),
        searchFilter: entity => `source=${entity.getSource()}`,
      },
      {
        id: "labels",
        priority: 20,
        renderCell: getLabelBadges,
        titleProps: {
          id: "labels",
          title: "catalog.columns.labels",
          className: `${styles.labelsCell} scrollable`,
          "data-testid": "catalog-labels-column",
        },
        searchFilter: entity => KubeObject.stringifyLabels(entity.metadata.labels),
      },
      {
        id: "status",
        priority: 30,
        renderCell: entity => (
          <TranslatedSpan
            key="phase"
            namespace="catalog.phase."
            value={entity.status.phase}
            className={entity.status.phase}
          />
        ),
        titleProps: {
          title: "catalog.columns.status",
          className: styles.statusCell,
          id: "status",
          sortBy: "status",
          "data-testid": "catalog-status-column",
        },
        searchFilter: entity => entity.status.phase,
        sortCallback: entity => entity.status.phase,
      },
    ];
  },
});

export default defaultCategoryColumnsInjectable;
