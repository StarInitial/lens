/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./main-layout.module.scss";

import React from "react";
import { observer } from "mobx-react";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import { ErrorBoundary } from "@k8slens/error-boundary";
import { ResizeDirection, ResizeGrowthDirection, ResizeSide, ResizingAnchor } from "@k8slens/resizing-anchor";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { SidebarStorageState } from "./sidebar-storage/sidebar-storage.injectable";
import sidebarStorageInjectable, { defaultSidebarWidth } from "./sidebar-storage/sidebar-storage.injectable";
import type { StorageLayer } from "../../utils/storage-helper";
import type { IComputedValue } from "mobx";
import currentPathInjectable from "../../routes/current-path.injectable";
import { PageSurface } from "../motion/page-surface";

export interface MainLayoutProps {
  sidebar: StrictReactNode;
  className?: string;
  footer?: StrictReactNode;
  children?: StrictReactNode;
}

/**
 * Main layout is commonly used as a wrapper for "global pages"
 *
 * @link https://api-docs.k8slens.dev/master/extensions/capabilities/common-capabilities/#global-pages
 */

interface Dependencies {
  sidebarStorage: StorageLayer<SidebarStorageState>;
  currentPath: IComputedValue<string>;
}

@observer
class NonInjectedMainLayout extends React.Component<MainLayoutProps & Dependencies> {
  onSidebarResize = (width: number) => {
    this.props.sidebarStorage.merge({ width });
  };

  render() {
    const { className, footer, children, sidebar } = this.props;
    const { width: sidebarWidth } = this.props.sidebarStorage.get();
    const style = { "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties;

    return (
      <div className={cssNames(styles.mainLayout, className)} style={style}>
        <div className={styles.sidebar}>
          {sidebar}
          <ResizingAnchor
            direction={ResizeDirection.HORIZONTAL}
            placement={ResizeSide.TRAILING}
            growthDirection={ResizeGrowthDirection.LEFT_TO_RIGHT}
            getCurrentExtent={() => sidebarWidth}
            onDrag={this.onSidebarResize}
            onDoubleClick={() => this.onSidebarResize(defaultSidebarWidth)}
            minExtent={150}
            maxExtent={400}
          />
        </div>

        <PageSurface className={styles.contents} route={this.props.currentPath.get()}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </PageSurface>

        <div className={styles.footer}>{footer}</div>
      </div>
    );
  }
}

export const MainLayout = withInjectables<Dependencies, MainLayoutProps>(NonInjectedMainLayout, {
  getProps: (di, props) => ({
    ...props,
    sidebarStorage: di.inject(sidebarStorageInjectable),
    currentPath: di.inject(currentPathInjectable),
  }),
});

