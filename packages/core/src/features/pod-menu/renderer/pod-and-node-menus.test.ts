/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import { kubeObjectMenuItemInjectionToken } from "../../../renderer/components/kube-object-menu/kube-object-menu-item-injection-token";
import { clusterFrameChildComponentInjectionToken } from "@k8slens/react-application";

describe("pod and node actions in the kube object menu", () => {
  it("registers the pod actions (shell, attach, logs, colored logs)", () => {
    const di = getDiForUnitTesting();
    const podItems = di.injectMany(kubeObjectMenuItemInjectionToken)
      .filter((item) => item.kind === "Pod")
      .map((item) => item.orderNumber)
      .sort((left, right) => left - right);

    expect(podItems).toEqual([10, 11, 12, 13]);
  });

  it("registers the node actions", () => {
    const di = getDiForUnitTesting();
    const nodeItems = di.injectMany(kubeObjectMenuItemInjectionToken)
      .filter((item) => item.kind === "Node");

    expect(nodeItems).toHaveLength(1);
    expect(nodeItems[0].apiVersions).toEqual(["v1"]);
  });

  it("mounts the colored logs dock in the cluster frame", () => {
    const di = getDiForUnitTesting();
    const frameChildren = di.injectMany(clusterFrameChildComponentInjectionToken)
      .map((child) => child.id);

    expect(frameChildren).toContain("colored-logs-dock");
  });
});
