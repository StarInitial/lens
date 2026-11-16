/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Menu } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import type { MenuItemOpts } from "./application-menu-items.injectable";
import type { IComputedValue } from "mobx";
import type { Composite } from "../../../common/utils/composite/get-composite/get-composite";
import type { ApplicationMenuItemTypes } from "./menu-items/application-menu-item-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { map, sortBy } from "lodash/fp";
import type { MenuItemRoot } from "./application-menu-item-composite.injectable";
import { checkThatAllDiscriminablesAreExhausted } from "../../../common/utils/composable-responsibilities/discriminable/discriminable";

const populateApplicationMenuInjectable = getInjectable({
  id: "populate-application-menu",

  instantiate:
    () => (composite: Composite<ApplicationMenuItemTypes | MenuItemRoot>) => {
      const electronTemplate = getApplicationMenuTemplate(composite);
      const menu = Menu.buildFromTemplate(electronTemplate);

      Menu.setApplicationMenu(menu);
    },

  causesSideEffects: true,
});

export default populateApplicationMenuInjectable;

export const getApplicationMenuTemplate = (composite: Composite<ApplicationMenuItemTypes | MenuItemRoot>) => {
  const topLevelMenus = composite.children.filter(
    (x): x is Composite<ApplicationMenuItemTypes> => x.value.kind !== "root",
  );

  return topLevelMenus.map(toHierarchicalElectronMenuItem);
};

const resolveLabel = (label: string | IComputedValue<string>): string =>
  typeof label === "string" ? label : label.get();

const toHierarchicalElectronMenuItem = (
  composite: Composite<ApplicationMenuItemTypes>,
): MenuItemOpts => {
  const value = composite.value;

  switch (value.kind) {
    case "top-level-menu": {
      const { id } = composite;
      const { label, role } = value;

      return {
        ...(id ? { id } : {}),
        ...(role ? { role } : {}),
        label: resolveLabel(label),

        submenu: pipeline(
          composite.children,
          sortBy((childComposite) => childComposite.value.orderNumber),
          map(toHierarchicalElectronMenuItem),
        ),
      };
    }

    case "sub-menu": {
      const { id } = composite;
      const { label } = value;

      return {
        ...(id ? { id } : {}),
        label: resolveLabel(label),

        submenu: pipeline(
          composite.children,
          sortBy((childComposite) => childComposite.value.orderNumber),
          map(toHierarchicalElectronMenuItem),
        ),
      };
    }

    case "clickable-menu-item": {
      const { id } = composite;
      const { label, onClick, keyboardShortcut } = value;

      return {
        ...(id ? { id } : {}),
        ...(label ? { label: resolveLabel(label) } : {}),
        ...(keyboardShortcut ? { accelerator: keyboardShortcut }: {}),
        /**
         * Electron 44 widened the second argument of a menu `click` handler from
         * `BrowserWindow` to `BaseWindow`. The type of `onClick` is part of the
         * extension API (see `ElectronClickable`) and has to stay as is, so the
         * handler is adapted here instead.
         */
        click: onClick as unknown as MenuItemConstructorOptions["click"],
      };
    }

    case "os-action-menu-item": {
      const { label, keyboardShortcut, actionName } = value;

      return {
        ...(label ? { label: resolveLabel(label) } : {}),
        ...(keyboardShortcut ? { accelerator: keyboardShortcut } : {}),
        role: actionName,
      };
    }

    case "separator": {
      return {
        type: "separator",
      };
    }

    default: {
      throw checkThatAllDiscriminablesAreExhausted(value);
    }
  }
};
