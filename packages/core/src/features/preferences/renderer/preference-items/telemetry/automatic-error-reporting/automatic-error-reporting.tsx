/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Checkbox } from "../../../../../../renderer/components/checkbox";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import { useTranslation } from "../../../../../../renderer/i18n/i18n-context";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedAutomaticErrorReporting = observer(({ state }: Dependencies) => {
  const { t } = useTranslation();

  return (
    <div
      id="sentry"
      className="small"
      data-testid="telemetry-preferences-for-automatic-error-reporting"
    >
      <SubTitle title="preferences.telemetry.error-reporting.title" />
      <Checkbox
        label={t("preferences.telemetry.error-reporting.allow")}
        value={state.allowErrorReporting}
        onChange={(value) => (state.allowErrorReporting = value)}
      />
      <div className="hint">
        <span>
          {t("preferences.telemetry.error-reporting.hint")}
        </span>
      </div>
    </div>
  );
});

export const AutomaticErrorReporting = withInjectables<Dependencies>(NonInjectedAutomaticErrorReporting, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
