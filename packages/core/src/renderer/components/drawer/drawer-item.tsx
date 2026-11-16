/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./drawer-item.scss";
import React from "react";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import { useTranslation } from "../../i18n/i18n-context";
import { translateName } from "../../i18n/translated-text";

export interface DrawerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: StrictReactNode;
  title?: string;
  labelsOnly?: boolean;
  hidden?: boolean;

  /**
   * @deprecated This prop is no longer used, you should stringify the booleans yourself.
   *
   * This was only meant to be an internal prop anyway.
   */
  renderBooleans?: boolean;
}

export function DrawerItem({
  name,
  title,
  labelsOnly,
  children,
  hidden = false,
  className,
  ...elemProps
}: DrawerItemProps) {
  const { t } = useTranslation();

  if (hidden) {
    return null;
  }

  return (
    <div
      {...elemProps}
      className={cssNames("DrawerItem", className, { labelsOnly })}
      title={title}
    >
      <span className="name">
        {
          typeof name === "string"
            ? translateName(t, "details.", name)
            : name
        }
      </span>
      <span className="value">{children}</span>
    </div>
  );
}
