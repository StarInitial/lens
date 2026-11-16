/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import { Select } from "../../../../../../../renderer/components/select";
import { defaultPackageMirror, packageMirrors } from "../../../../../../user-preferences/common/preferences-helpers";
import type { UserPreferencesState } from "../../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../../user-preferences/common/state.injectable";
import { useTranslation } from "../../../../../../../renderer/i18n/i18n-context";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedKubectlDownloadMirror = observer(({ state }: Dependencies) => {
  const { t } = useTranslation();

  const downloadMirrorOptions = Array.from(packageMirrors, ([name, mirror]) => {
    const key = `preferences.kubernetes.kubectl.download-mirror.${name}`;
    const translated = t(key);

    return {
      value: name,

      // Mirrors registered by other builds may not have a catalog entry; they keep
      // the label they were declared with.
      label: translated === key ? mirror.label : translated,

      // TODO: Side-effect
      isDisabled: !mirror.platforms.has(process.platform),
    };
  });

  return (
    <section>
      <SubTitle title="preferences.kubernetes.kubectl.download-mirror.title" />
      <Select
        id="download-mirror-input"
        placeholder={t("preferences.kubernetes.kubectl.download-mirror.placeholder")}
        options={downloadMirrorOptions}
        value={state.downloadMirror}
        onChange={option => state.downloadMirror = option?.value ?? defaultPackageMirror}
        isDisabled={!state.downloadKubectlBinaries}
        themeName="lens"
      />
    </section>
  );
});

export const KubectlDownloadMirror = withInjectables<Dependencies>(NonInjectedKubectlDownloadMirror, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
