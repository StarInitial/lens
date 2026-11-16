/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import i18nInjectable from "../../../../common/i18n/i18n.injectable";
import type { OsActionMenuItem } from "./application-menu-item-injection-token";
import applicationMenuItemInjectionToken from "./application-menu-item-injection-token";

/**
 * Items which trigger an Electron role get their label from Electron, which
 * means it follows the language of the operating system and not the language of
 * the application. Pass `labelKey` to translate the label instead.
 */
const getApplicationMenuOperationSystemActionInjectable = ({
  id,
  labelKey,
  ...rest
}: Omit<OsActionMenuItem, "kind" > & { labelKey?: string }) =>
  getInjectable({
    id: `application-menu-operation-system-action/${id}`,

    instantiate: (di) => {
      const i18n = di.inject(i18nInjectable);

      return {
        ...rest,
        id,
        kind: "os-action-menu-item" as const,
        ...(labelKey ? { label: computed(() => i18n.t(labelKey)) } : {}),
      };
    },

    injectionToken: applicationMenuItemInjectionToken,
  });

export { getApplicationMenuOperationSystemActionInjectable };
