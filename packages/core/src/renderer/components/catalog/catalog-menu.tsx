/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import navigationStyles from "../layout/sidebar.module.scss";
import itemStyles from "../layout/sidebar-items.module.scss";
import styles from "./catalog-menu.module.scss";

import React, { useState } from "react";
import { cssNames } from "@k8slens/utilities";
import { ActiveIndicator } from "../motion/active-indicator";
import { Icon } from "@k8slens/icon";
import type { CatalogCategory } from "../../api/catalog-entity";
import { observer } from "mobx-react";
import { CatalogCategoryLabel } from "./catalog-category-label";
import type { IComputedValue } from "mobx";
import { withInjectables } from "@ogre-tools/injectable-react";
import filteredCategoriesInjectable from "../../../common/catalog/filtered-categories.injectable";
import { browseCatalogTab } from "./catalog-browse-tab";
import { useTranslation } from "../../i18n/i18n-context";

export interface CatalogMenuProps {
  activeTab: string | undefined;
  onItemClick: (id: string) => void;
}

function CategoryIcon(props: { category: CatalogCategory }) {
  const { icon } = props.category.metadata ?? {};

  if (typeof icon === "string") {
    return Icon.isSvg(icon)
      ? <Icon small svg={icon}/>
      : <Icon small material={icon}/>;
  }

  return null;
}

interface Dependencies {
  filteredCategories: IComputedValue<CatalogCategory[]>;
}

const NonInjectedCatalogMenu = observer(({
  activeTab,
  filteredCategories,
  onItemClick,
}: CatalogMenuProps & Dependencies) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`flex flex-col w-full ${styles.menu}`}>
      <div className={styles.catalog}>{t("catalog.title")}</div>
      <nav className={navigationStyles.sidebarNav} aria-label={t("catalog.title")}>
        <ActiveIndicator selector='[data-nav-active="true"]' />
        <button
          type="button"
          className={cssNames(itemStyles.navItem, { active: activeTab === browseCatalogTab })}
          aria-current={activeTab === browseCatalogTab ? "page" : undefined}
          data-nav-active={activeTab === browseCatalogTab}
          data-testid="*-tab"
          onClick={() => onItemClick("*")}
        >
          <Icon material="view_list" />
          <span>{t("catalog.browse")}</span>
        </button>
        <div className={itemStyles.SidebarItem}>
          <button
            type="button"
            className={itemStyles.navItem}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            <Icon material="category" />
            <span>{t("catalog.categories")}</span>
            <Icon
              material="keyboard_arrow_down"
              className={cssNames(itemStyles.expandIcon, { [itemStyles.expanded]: expanded })}
            />
          </button>
          <div
            className={cssNames(itemStyles.subMenu, { [itemStyles.collapsed]: !expanded })}
            aria-hidden={!expanded}
            ref={element => element?.toggleAttribute("inert", !expanded)}
          >
            <div className={itemStyles.subMenuContents}>
              {filteredCategories.get().map(category => (
                <button
                  key={category.getId()}
                  type="button"
                  className={cssNames(itemStyles.navItem, { active: activeTab === category.getId() })}
                  aria-current={activeTab === category.getId() ? "page" : undefined}
                  data-nav-active={activeTab === category.getId()}
                  data-testid={`${category.getId()}-tab`}
                  onClick={() => onItemClick(category.getId())}
                >
                  <CategoryIcon category={category} />
                  <CatalogCategoryLabel category={category} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
});

export const CatalogMenu = withInjectables<Dependencies, CatalogMenuProps>(NonInjectedCatalogMenu, {
  getProps: (di, props) => ({
    ...props,
    filteredCategories: di.inject(filteredCategoriesInjectable),
  }),
});
