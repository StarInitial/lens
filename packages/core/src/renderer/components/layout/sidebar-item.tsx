/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from  "./sidebar-items.module.scss";

import React from "react";
import { cssNames } from "@k8slens/utilities";
import { observer } from "mobx-react";
import { NavLink } from "react-router-dom";
import { Icon } from "@k8slens/icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SidebarStorageState } from "./sidebar-storage/sidebar-storage.injectable";
import sidebarStorageInjectable from "./sidebar-storage/sidebar-storage.injectable";
import type { SidebarItemDeclaration } from "@k8slens/cluster-sidebar";
import type { StorageLayer } from "../../utils/storage-helper";
import type { I18n } from "../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../common/i18n/i18n.injectable";
import { translateName } from "../../i18n/translated-text";

interface Dependencies {
  sidebarStorage: StorageLayer<SidebarStorageState>;
  i18n: I18n;
}

export interface SidebarItemProps {
  item: SidebarItemDeclaration;
}

const NonInjectedSidebarItem = observer((props: SidebarItemProps & Dependencies) => {
  const { item, sidebarStorage, i18n } = props;
  const id = item.id;

  const title = typeof item.title === "string"
    ? (i18n.t(item.title) === item.title
      ? translateName(i18n.t, "resources.", item.title)
      : i18n.t(item.title))
    : item.title;
  const expanded = sidebarStorage.get().expanded[id] ?? false;
  const isExpandable = item.children.length > 0 && item.children.some(item => item.isVisible.get());
  const isActive = item.isActive.get();

  const toggleExpand = () => {
    sidebarStorage.merge((draft) => {
      draft.expanded[id] = !draft.expanded[id];
    });
  };
  const renderSubMenu = () => {
    if (!isExpandable) {
      return null;
    }

    return (
      <div
        className={cssNames(styles.subMenu, { [styles.collapsed]: !expanded })}
        aria-hidden={!expanded}
        ref={element => element?.toggleAttribute("inert", !expanded)}
      >
        <div className={styles.subMenuContents}>
          {item.children.map((child) => (
            <SidebarItem key={child.id} item={child} />
          ))}
        </div>
      </div>
    );
  };

  if (!item.isVisible.get()) {
    return null;
  }

  return (
    <div
      className={styles.SidebarItem}
      data-testid={id}
      data-is-active-test={isActive}
      data-parent-id-test={item.parentId}
    >
      <NavLink
        to={""}
        isActive={() => isActive}
        className={styles.navItem}
        aria-expanded={isExpandable ? expanded : undefined}
        aria-current={isActive && !isExpandable ? "page" : undefined}
        data-nav-active={isActive && !isExpandable}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();

          if (isExpandable) {
            toggleExpand();
          } else {
            item.onClick();
          }
        }}
        data-testid={`link-for-${id}`}
      >
        {item.getIcon?.()}
        <span>{title}</span>
        {isExpandable && (
          <Icon
            className={cssNames(styles.expandIcon, { [styles.expanded]: expanded })}
            material="keyboard_arrow_down"
            data-testid={`expand-icon-for-${id}`}
          />
        )}
      </NavLink>
      {renderSubMenu()}
    </div>
  );
});

export const SidebarItem = withInjectables<Dependencies, SidebarItemProps>(NonInjectedSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    sidebarStorage: di.inject(sidebarStorageInjectable),
    i18n: di.inject(i18nInjectable),
  }),
});

SidebarItem.displayName = "SidebarItem";
