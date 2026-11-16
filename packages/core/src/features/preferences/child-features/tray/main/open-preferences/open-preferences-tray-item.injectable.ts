/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import i18nInjectable from "../../../../../../common/i18n/i18n.injectable";
import { trayMenuItemInjectionToken } from "../../../../../../main/tray/tray-menu-item/tray-menu-item-injection-token";
import navigateToPreferencesInjectable from "../../../../common/navigate-to-preferences.injectable";
import { computed } from "mobx";
import { withErrorSuppression } from "../../../../../../common/utils/with-error-suppression/with-error-suppression";
import { pipeline } from "@ogre-tools/fp";
import withErrorLoggingInjectable from "../../../../../../common/utils/with-error-logging/with-error-logging.injectable";

const openPreferencesTrayItemInjectable = getInjectable({
  id: "open-preferences-tray-item",

  instantiate: (di) => {
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
    const withErrorLoggingFor = di.inject(withErrorLoggingInjectable);
    const i18n = di.inject(i18nInjectable);

    return {
      id: "open-preferences",
      parentId: null,
      label: computed(() => i18n.t("tray.preferences")),
      orderNumber: 20,
      enabled: computed(() => true),
      visible: computed(() => true),

      click: pipeline(
        navigateToPreferences,

        withErrorLoggingFor(() => "[TRAY]: Opening of preferences failed."),

        // TODO: Find out how to improve typing so that instead of
        // x => withErrorSuppression(x) there could only be withErrorSuppression
        (x) => withErrorSuppression(x),
      ),
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default openPreferencesTrayItemInjectable;
