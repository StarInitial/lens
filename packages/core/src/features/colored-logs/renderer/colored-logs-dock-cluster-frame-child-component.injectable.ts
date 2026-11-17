/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { clusterFrameChildComponentInjectionToken } from "@k8slens/react-application";
import { computed } from "mobx";
import { ColoredLogsDock } from "./colored-logs-dock";

const coloredLogsDockClusterFrameChildComponentInjectable = getInjectable({
  id: "colored-logs-dock-cluster-frame-child-component",

  instantiate: () => ({
    id: "colored-logs-dock",
    shouldRender: computed(() => true),
    Component: ColoredLogsDock,
  }),

  injectionToken: clusterFrameChildComponentInjectionToken,
});

export default coloredLogsDockClusterFrameChildComponentInjectable;
