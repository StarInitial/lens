/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { CatalogCategory } from "../../../common/catalog/catalog-entity";
import { TranslatedText } from "../../i18n/translated-text";

interface CatalogCategoryLabelProps {
  category: CatalogCategory;
}

/**
 * Display label for Catalog Category for the Catalog menu
 */
export const CatalogCategoryLabel = ({ category }: CatalogCategoryLabelProps) => {
  const badge = category.getBadge();

  return (
    <div className="flex">
      <div>
        <TranslatedText namespace="catalog.categories." value={category.metadata.name} />
      </div>
      {badge ? (<div className="flex items-center">{badge}</div>) : null}
    </div>
  );
};
