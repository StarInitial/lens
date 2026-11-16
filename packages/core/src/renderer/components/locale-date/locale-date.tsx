/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import moment from "moment-timezone";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { UserPreferencesState } from "../../../features/user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../features/user-preferences/common/state.injectable";
import type { I18n } from "../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../common/i18n/i18n.injectable";
import { toMomentLocale } from "../../i18n/moment-locale";

export interface LocaleDateProps {
  date: string;
}

interface Dependencies {
  state: UserPreferencesState;
  i18n: I18n;
}

const NonInjectedLocaleDate = observer(({ date, state, i18n }: LocaleDateProps & Dependencies) => (
  <>
    {`${moment.tz(date, state.localeTimezone).locale(toMomentLocale(i18n.currentLocale)).format()}`}
  </>
));

export const LocaleDate = withInjectables<Dependencies, LocaleDateProps>(NonInjectedLocaleDate, {
  getProps: (di, props) => ({
    ...props,
    state: di.inject(userPreferencesStateInjectable),
    i18n: di.inject(i18nInjectable),
  }),
});
