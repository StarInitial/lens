/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObject } from "@k8slens/kube-object";
import { getInjectable } from "@ogre-tools/injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager/manager.injectable";

export type DeleteType = "delete" | "force_delete" | "force_finalize";

export interface KubeObjectDeleteService {
  delete: (object: KubeObject, deleteType: DeleteType) => Promise<void>;
}

const kubeObjectDeleteServiceInjectable = getInjectable({
  id: "kube-object-delete-service",
  instantiate: (di): KubeObjectDeleteService => {
    const apiManager = di.inject(apiManagerInjectable);

    return {
      delete: async (object, deleteType) => {
        const store = apiManager.getStore(object.selfLink);

        if (!store) {
          throw new Error(`No store found for object: ${object.selfLink}`);
        }

        switch (deleteType) {
          case "delete":
            await store.remove(object);
            break;
          case "force_delete":
            await store.removeWithOptions(object, {
              gracePeriodSeconds: 0,
              propagationPolicy: "Background",
            });
            break;
          case "force_finalize":
            await store.patch(object, {
              metadata: {
                finalizers: [],
              },
            }, "merge");
            break;
          default:
            throw new Error(`Unknown delete type: ${deleteType}`);
        }
      },
    };
  },
});

export default kubeObjectDeleteServiceInjectable;
