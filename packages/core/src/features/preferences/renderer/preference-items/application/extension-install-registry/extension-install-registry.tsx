/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { Select } from "../../../../../../renderer/components/select";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Input } from "../../../../../../renderer/components/input";
import { isUrl } from "../../../../../../renderer/components/input/input_validators";
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import { defaultExtensionRegistryUrlLocation, defaultExtensionRegistryUrl } from "../../../../../user-preferences/common/preferences-helpers";
import { useTranslation } from "../../../../../../renderer/i18n/i18n-context";

interface Dependencies {
  state: UserPreferencesState;
}

const NonInjectedExtensionInstallRegistry = observer(({ state }: Dependencies) => {
  const { t } = useTranslation();
  const [customUrl, setCustomUrl] = React.useState(state.extensionRegistryUrl.customUrl || "");

  const extensionInstallRegistryOptions = [
    {
      value: "default",
      label: t("preferences.application.extension-registry.default-url"),
    },
    {
      value: "npmrc",
      label: t("preferences.application.extension-registry.npmrc-url"),
    },
    {
      value: "custom",
      label: t("preferences.application.extension-registry.custom-url"),
    },
  ] as const;

  return (
    <section id="extensionRegistryUrl">
      <SubTitle title="preferences.application.extension-registry.title" />
      <Select
        id="extension-install-registry-input"
        options={extensionInstallRegistryOptions}
        value={state.extensionRegistryUrl.location}
        onChange={(value) =>
          runInAction(() => {
            state.extensionRegistryUrl.location =
              value?.value ?? defaultExtensionRegistryUrlLocation;

            if (state.extensionRegistryUrl.location === "custom") {
              state.extensionRegistryUrl.customUrl = "";
            }
          })
        }
        themeName="lens"
      />
      <p className="mt-4 mb-5 leading-relaxed">
        {t("preferences.application.extension-registry.description-prefix", {
          defaultRegistryUrl: defaultExtensionRegistryUrl,
        })}
        <b>.npmrc</b>
        {t("preferences.application.extension-registry.description-suffix")}
      </p>

      <Input
        theme="round-black"
        validators={isUrl}
        value={customUrl}
        onChange={setCustomUrl}
        onBlur={() => (state.extensionRegistryUrl.customUrl = customUrl)}
        placeholder={t("preferences.application.extension-registry.placeholder")}
        disabled={state.extensionRegistryUrl.location !== "custom"}
      />
    </section>
  );
});

export const ExtensionInstallRegistry = withInjectables<Dependencies>(NonInjectedExtensionInstallRegistry, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
