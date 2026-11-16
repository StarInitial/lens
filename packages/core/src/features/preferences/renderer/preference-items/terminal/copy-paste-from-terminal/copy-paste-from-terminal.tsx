/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Switch } from "../../../../../../renderer/components/switch";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import { useTranslation } from "../../../../../../renderer/i18n/i18n-context";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedCopyPasteFromTerminal = observer(({
  state,
}: Dependencies) => {
  const { t } = useTranslation();

  return (
    <section id="terminalSelection">
      <SubTitle title="preferences.terminal.copy-paste.title" />
      <Switch
        checked={state.terminalCopyOnSelect}
        onChange={() => state.terminalCopyOnSelect = !state.terminalCopyOnSelect}
      >
        {t("preferences.terminal.copy-paste.description")}
      </Switch>
    </section>
  );
});

export const CopyPasteFromTerminal = withInjectables<Dependencies>(NonInjectedCopyPasteFromTerminal, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
