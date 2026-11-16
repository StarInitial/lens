/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";
import { getInjectable } from "@ogre-tools/injectable";
import namedCategoryColumnInjectable from "./named-category.injectable";
import defaultCategoryColumnsInjectable from "./default-category.injectable";
import React from "react";
import { TranslatedText } from "../../../i18n/translated-text";

const defaultBrowseAllColumns: RegisteredAdditionalCategoryColumn[] = [
  {
    id: "kind",
    priority: 5,
    renderCell: entity => <TranslatedText namespace="catalog.kinds." value={entity.kind} />,
    titleProps: {
      id: "kind",
      sortBy: "kind",
      title: "catalog.columns.kind",
      "data-testid": "catalog-kind-column",
    },
    sortCallback: entity => entity.kind,
  },
];

const browseAllColumnsInjectable = getInjectable({
  id: "browse-all-columns",
  instantiate: (di) => [
    ...defaultBrowseAllColumns,
    di.inject(namedCategoryColumnInjectable),
    ...di.inject(defaultCategoryColumnsInjectable),
  ],
});

export default browseAllColumnsInjectable;

