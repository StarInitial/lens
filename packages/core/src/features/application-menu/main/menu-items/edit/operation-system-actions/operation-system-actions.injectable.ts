/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getApplicationMenuOperationSystemActionInjectable } from "../../get-application-menu-operation-system-action-injectable";
import { getApplicationMenuSeparatorInjectable } from "../../get-application-menu-separator-injectable";

export const actionForUndo = getApplicationMenuOperationSystemActionInjectable({
  id: "undo",
  parentId: "edit",
  orderNumber: 10,
  actionName: "undo",
  labelKey: "menu.undo",
});

export const actionForRedo = getApplicationMenuOperationSystemActionInjectable({
  id: "redo",
  parentId: "edit",
  orderNumber: 20,
  actionName: "redo",
  labelKey: "menu.redo",
});

export const separator1 = getApplicationMenuSeparatorInjectable({
  id: "separator-1-in-edit",
  parentId: "edit",
  orderNumber: 30,
});

export const actionForCut = getApplicationMenuOperationSystemActionInjectable({
  id: "cut",
  parentId: "edit",
  orderNumber: 40,
  actionName: "cut",
  labelKey: "menu.cut",
});

export const actionForCopy = getApplicationMenuOperationSystemActionInjectable({
  id: "copy",
  parentId: "edit",
  orderNumber: 50,
  actionName: "copy",
  labelKey: "menu.copy",
});

export const actionForPaste = getApplicationMenuOperationSystemActionInjectable({
  id: "paste",
  parentId: "edit",
  orderNumber: 60,
  actionName: "paste",
  labelKey: "menu.paste",
});

export const actionForDelete = getApplicationMenuOperationSystemActionInjectable({
  id: "delete",
  parentId: "edit",
  orderNumber: 70,
  actionName: "delete",
  labelKey: "menu.delete",
});

export const separator2 = getApplicationMenuSeparatorInjectable({
  id: "separator-2-in-edit",
  parentId: "edit",
  orderNumber: 80,
});

export const actionForSelectAll = getApplicationMenuOperationSystemActionInjectable({
  id: "selectAll",
  parentId: "edit",
  orderNumber: 90,
  actionName: "selectAll",
  labelKey: "menu.select-all",
});

