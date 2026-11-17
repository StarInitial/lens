/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "@k8slens/kube-object";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";
import kubeObjectDeleteServiceInjectable from "./kube-object-delete-service.injectable";

describe("KubeObjectDeleteService", () => {
  const object = KubeObject.create({
    apiVersion: "v1",
    kind: "ConfigMap",
    metadata: {
      name: "some-config-map",
      namespace: "default",
      selfLink: "/api/v1/namespaces/default/configmaps/some-config-map",
    },
  });

  it("force deletes with a zero grace period", async () => {
    const store = {
      remove: jest.fn(),
      removeWithOptions: jest.fn().mockResolvedValue(undefined),
      patch: jest.fn(),
    };
    const di = getDiForUnitTesting();

    di.override(apiManagerInjectable, () => ({ getStore: () => store } as unknown as ApiManager));

    await di.inject(kubeObjectDeleteServiceInjectable).delete(object, "force_delete");

    expect(store.removeWithOptions).toHaveBeenCalledWith(object, {
      gracePeriodSeconds: 0,
      propagationPolicy: "Background",
    });
  });

  it("force finalizes by clearing metadata finalizers with a merge patch", async () => {
    const store = {
      remove: jest.fn(),
      removeWithOptions: jest.fn(),
      patch: jest.fn().mockResolvedValue(undefined),
    };
    const di = getDiForUnitTesting();

    di.override(apiManagerInjectable, () => ({ getStore: () => store } as unknown as ApiManager));

    await di.inject(kubeObjectDeleteServiceInjectable).delete(object, "force_finalize");

    expect(store.patch).toHaveBeenCalledWith(object, {
      metadata: {
        finalizers: [],
      },
    }, "merge");
  });
});
