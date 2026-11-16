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

const NonInjectedAllowUntrustedCertificates = observer(({ state }: Dependencies) => {
  const { t } = useTranslation();

  return (
    <section className="small">
      <SubTitle title="preferences.proxy.certificate-trust.title" />
      <Switch
        checked={state.allowUntrustedCAs}
        onChange={() => state.allowUntrustedCAs = !state.allowUntrustedCAs}
      >
        {t("preferences.proxy.certificate-trust.allow")}
      </Switch>
      <small className="hint">
        {t("preferences.proxy.certificate-trust.hint")}
      </small>
    </section>
  );
});

export const AllowUntrustedCertificates = withInjectables<Dependencies>(NonInjectedAllowUntrustedCertificates, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
