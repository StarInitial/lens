/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { Container, Pod } from "@k8slens/kube-object";
import { Icon } from "@k8slens/icon";
import { cssNames, prevDefault } from "@k8slens/utilities";
import { MenuItem, SubMenu } from "../../../renderer/components/menu";
import { StatusBrick } from "../../../renderer/components/status-brick";

export interface ContainerMenuItemProps {
  /** Material icon name or the name of a bundled svg icon. */
  icon: { material?: string; svg?: string };
  title: string;
  tooltip: string;
  toolbar?: boolean;
  containers: Container[];
  onSelect: (container: Container) => void;
  /** Optional status square shown in front of each container of the submenu. */
  renderStatus?: (container: Container) => React.ReactNode;
}

/**
 * A menu item that acts on a container, expanding into a submenu when the Pod has more than one container.
 */
export const ContainerMenuItem = ({ icon, title, tooltip, toolbar, containers, onSelect, renderStatus }: ContainerMenuItemProps) => {
  if (containers.length === 0) {
    return null;
  }

  return (
    <MenuItem onClick={prevDefault(() => onSelect(containers[0]))}>
      <Icon
        {...icon}
        interactive={toolbar}
        tooltip={toolbar ? tooltip : undefined}
      />
      <span className="title">{title}</span>
      {containers.length > 1 && (
        <>
          <Icon className="arrow" material="keyboard_arrow_right"/>
          <SubMenu>
            {containers.map((container) => (
              <MenuItem
                key={container.name}
                style={{ display: "flex", alignItems: "center" }}
                onClick={prevDefault(() => onSelect(container))}
              >
                {renderStatus ? renderStatus(container) : <StatusBrick/>}
                <span>{container.name}</span>
              </MenuItem>
            ))}
          </SubMenu>
        </>
      )}
    </MenuItem>
  );
};

/** Status square of a container, showing running/waiting/terminated and whether it is ready. */
export const containerStatusBrick = (pod: Pod) => (container: Container) => {
  const status = pod.getContainerStatuses().find((item) => item.name === container.name);

  if (!status) {
    return null;
  }

  const state = status.state ? Object.keys(status.state)[0] ?? "" : "";

  return <StatusBrick className={cssNames(state, { ready: status.ready })}/>;
};
