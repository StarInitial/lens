/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogEntityContextMenu } from "../api/catalog-entity";
import withConfirmationInjectable from "../components/confirm-dialog/with-confirm.injectable";
import type { I18n } from "../../common/i18n/i18n.injectable";
import i18nInjectable from "../../common/i18n/i18n.injectable";
import { translateName } from "../i18n/translated-text";

export interface NormalizedCatalogEntityContextMenu {
  title: string;
  icon?: string;
  onClick: () => void;
}

export type NormalizeCatalogEntityContextMenu = (menuItem: CatalogEntityContextMenu) => NormalizedCatalogEntityContextMenu;

const normalizeCatalogEntityContextMenuInjectable = getInjectable({
  id: "normalize-catalog-entity-context-menu",
  instantiate: (di): NormalizeCatalogEntityContextMenu => {
    const withConfirmation = di.inject(withConfirmationInjectable);
    const i18n: I18n = di.inject(i18nInjectable);

    return (menuItem) => {
      const title = translateName(i18n.t, "catalog-menu.", menuItem.title);

      if (menuItem.confirm) {
        return {
          title,
          icon: menuItem.icon,
          onClick: withConfirmation({
            message: menuItem.confirm.message,
            ok: menuItem.onClick,
            okButtonProps: {
              primary: false,
              accent: true,
            },
          }),
        };
      }

      return {
        ...menuItem,
        title,
      };
    };
  },
});

export default normalizeCatalogEntityContextMenuInjectable;
