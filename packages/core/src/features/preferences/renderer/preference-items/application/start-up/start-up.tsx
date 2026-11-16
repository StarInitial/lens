/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Switch } from "../../../../../../renderer/components/switch";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import { useTranslation } from "../../../../../../renderer/i18n/i18n-context";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedStartUp = observer(({ state }: Dependencies) => {
  const { t } = useTranslation();

  return (
    <section id="other">
      <SubTitle title="preferences.application.startup.title" />
      <Switch
        checked={state.openAtLogin}
        onChange={() => (state.openAtLogin = !state.openAtLogin)}
      >
        {t("preferences.application.startup.open-at-login")}
      </Switch>
    </section>
  );
});

export const StartUp = withInjectables<Dependencies>(NonInjectedStartUp, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
