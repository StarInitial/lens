/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { I18n } from "../../common/i18n/i18n.injectable";
import i18nInjectable from "../../common/i18n/i18n.injectable";
import { I18nContext } from "./i18n-context";

interface Dependencies {
  i18n: I18n;
}

interface I18nProviderProps {
  children: React.ReactNode;
}

const NonInjectedI18nProvider = ({ i18n, children }: Dependencies & I18nProviderProps) => (
  <I18nContext.Provider value={i18n}>
    {children}
  </I18nContext.Provider>
);

/**
 * Makes the i18n catalog of the current frame available to `useTranslation()`.
 *
 * It is mounted as a react-application higher order component (see
 * `i18n-provider-react-application-hoc.injectable.tsx`) and additionally by the
 * root and cluster frames, because unit tests render those frames directly.
 */
export const I18nProvider = withInjectables<Dependencies, I18nProviderProps>(NonInjectedI18nProvider, {
  getProps: (di, props) => ({
    i18n: di.inject(i18nInjectable),
    ...props,
  }),
});
