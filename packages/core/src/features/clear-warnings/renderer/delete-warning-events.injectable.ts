/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { kubeEventApiInjectable } from "@k8slens/kube-api-specifics";

export interface DeleteWarningEventsResult {
  /** How many Warning events were found. */
  total: number;

  /** How many of them could not be deleted (insufficient permissions, and so on). */
  failed: number;
}

export type DeleteWarningEvents = () => Promise<DeleteWarningEventsResult>;

const batchSize = 10;

/** An Event that expired between listing and deleting it is not a failure. */
const isNotFound = (error: unknown) => /not ?found|404/i.test(String((error as Error | undefined)?.message ?? error));

const deleteWarningEventsInjectable = getInjectable({
  id: "delete-warning-events",

  instantiate: (di): DeleteWarningEvents => {
    const eventApi = di.inject(kubeEventApiInjectable);

    return async () => {
      const events = await eventApi.list({}, { fieldSelector: "type=Warning" }) ?? [];
      let failed = 0;

      for (let index = 0; index < events.length; index += batchSize) {
        const batch = events.slice(index, index + batchSize);
        const results = await Promise.allSettled(
          batch.map((event) => eventApi.delete({ name: event.getName(), namespace: event.getNs() })),
        );

        failed += results.filter((result) => result.status === "rejected" && !isNotFound(result.reason)).length;
      }

      return { total: events.length, failed };
    };
  },
});

export default deleteWarningEventsInjectable;
