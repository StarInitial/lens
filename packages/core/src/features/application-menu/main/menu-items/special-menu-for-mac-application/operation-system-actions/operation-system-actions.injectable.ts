/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  getApplicationMenuOperationSystemActionInjectable,
} from "../../get-application-menu-operation-system-action-injectable";

export const actionForServices = getApplicationMenuOperationSystemActionInjectable({
  id: "services",
  parentId: "mac",
  orderNumber: 80,
  actionName: "services",
  labelKey: "menu.services",
});

export const actionForHide = getApplicationMenuOperationSystemActionInjectable({
  id: "hide",
  parentId: "mac",
  orderNumber: 100,
  actionName: "hide",
  labelKey: "menu.hide",
});

export const actionForHideOthers = getApplicationMenuOperationSystemActionInjectable({
  id: "hide-others",
  parentId: "mac",
  orderNumber: 110,
  actionName: "hideOthers",
  labelKey: "menu.hide-others",
});

export const actionForUnhide = getApplicationMenuOperationSystemActionInjectable({
  id: "unhide",
  parentId: "mac",
  orderNumber: 120,
  actionName: "unhide",
  labelKey: "menu.unhide",
});
