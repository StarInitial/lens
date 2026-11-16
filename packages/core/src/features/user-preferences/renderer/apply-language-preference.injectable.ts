/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { beforeFrameStartsSecondInjectionToken } from "../../../renderer/before-frame-starts/tokens";
import i18nInjectable from "../../../common/i18n/i18n.injectable";
import userPreferencesStateInjectable from "../common/state.injectable";
import loadUserPreferencesStorageInjectable from "./load-storage.injectable";

/**
 * Applies the persisted `locale` user preference to the renderer once the user
 * store has been loaded, so that the very first render already uses the correct
 * language. Later changes are applied by the language preference block.
 */
const applyLanguagePreferenceInjectable = getInjectable({
  id: "apply-language-preference",

  instantiate: (di) => ({
    run: () => {
      const i18n = di.inject(i18nInjectable);
      const state = di.inject(userPreferencesStateInjectable);

      i18n.setLocalePreference(state.locale);
    },
    runAfter: loadUserPreferencesStorageInjectable,
  }),

  injectionToken: beforeFrameStartsSecondInjectionToken,
});

export default applyLanguagePreferenceInjectable;
