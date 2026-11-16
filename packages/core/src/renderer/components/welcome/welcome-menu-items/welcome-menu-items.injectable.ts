/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import rendererExtensionsInjectable from "../../../../extensions/renderer-extensions.injectable";
import { getWelcomeMenuItems } from "./get-welcome-menu-items";
import navigateToCatalogInjectable from "../../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import i18nInjectable from "../../../../common/i18n/i18n.injectable";

const welcomeMenuItemsInjectable = getInjectable({
  id: "welcome-menu-items",

  instantiate: (di) =>
    getWelcomeMenuItems({
      extensions: di.inject(rendererExtensionsInjectable),
      navigateToCatalog: di.inject(navigateToCatalogInjectable),
      i18n: di.inject(i18nInjectable),
    }),
});

export default welcomeMenuItemsInjectable;
