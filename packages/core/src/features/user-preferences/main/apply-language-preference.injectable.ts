/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import { beforeApplicationIsLoadingInjectionToken } from "@k8slens/application";
import i18nInjectable from "../../../common/i18n/i18n.injectable";
import userPreferencesStateInjectable from "../common/state.injectable";
import loadUserPreferencesStorageInjectable from "./load-storage.injectable";

/**
 * Applies the persisted `locale` user preference to the main process once the
 * user store has been loaded, and keeps it in sync afterwards. This is what
 * makes the application menu and the tray menu follow the language selection.
 */
const applyLanguagePreferenceInjectable = getInjectable({
  id: "apply-language-preference-in-main",

  instantiate: (di) => ({
    run: () => {
      const i18n = di.inject(i18nInjectable);
      const state = di.inject(userPreferencesStateInjectable);

      reaction(
        () => state.locale,
        (locale) => i18n.setLocalePreference(locale),
        { fireImmediately: true },
      );
    },
    runAfter: loadUserPreferencesStorageInjectable,
  }),

  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default applyLanguagePreferenceInjectable;
