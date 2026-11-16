/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { reactApplicationHigherOrderComponentInjectionToken } from "@k8slens/react-application";
import { I18nProvider } from "./i18n-provider";

/**
 * Mounts the i18n provider around the whole application, for both the root frame
 * and every cluster frame.
 */
const i18nProviderReactApplicationHocInjectable = getInjectable({
  id: "i18n-provider-react-application-hoc",

  instantiate: () => I18nProvider,

  injectionToken: reactApplicationHigherOrderComponentInjectionToken,
});

export default i18nProviderReactApplicationHocInjectable;
