/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./drawer-param-toggler.scss";
import React, { useState } from "react";
import { Icon } from "@k8slens/icon";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import { useTranslation } from "../../i18n/i18n-context";

export interface DrawerParamTogglerProps {
  label: string | number;
  children: StrictReactNode;
}

export function DrawerParamToggler({ label, children }: DrawerParamTogglerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const icon = `arrow_drop_${open ? "up" : "down"}`;
  const link = open
    ? t("details.hide")
    : t("details.show");

  return (
    <div className="DrawerParamToggler">
      <div className="flex gaps align-center params">
        <div className="param-label">{label}</div>
        <div
          className="param-link"
          onClick={() => setOpen(!open)}
          data-testid="drawer-param-toggler"
        >
          <span className="param-link-text">{link}</span>
          <Icon material={icon}/>
        </div>
      </div>
      <div className={cssNames("param-content", { open })}>
        {open && children}
      </div>
    </div>
  );
}
