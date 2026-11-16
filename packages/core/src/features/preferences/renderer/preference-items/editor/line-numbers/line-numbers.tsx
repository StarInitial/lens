/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { SubTitle } from "../../../../../../renderer/components/layout/sub-title";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Select } from "../../../../../../renderer/components/select";
import { observer } from "mobx-react";
import type { UserPreferencesState } from "../../../../../user-preferences/common/state.injectable";
import { defaultEditorConfig } from "../../../../../user-preferences/common/preferences-helpers";
import userPreferencesStateInjectable from "../../../../../user-preferences/common/state.injectable";
import { useTranslation } from "../../../../../../renderer/i18n/i18n-context";

interface Dependencies {
  state: UserPreferencesState;
}

const lineNumbers = ["on", "off", "relative", "interval"] as const;

const NonInjectedLineNumbers = observer(({ state: { editorConfiguration }}: Dependencies) => {
  const { t } = useTranslation();
  const lineNumberOptions = lineNumbers.map(value => ({
    value,
    label: t(`preferences.editor.line-numbers.${value}`),
  }));

  return (
    <section>
      <SubTitle title="preferences.editor.line-numbers.title"/>
      <Select
        id="editor-line-numbers-input"
        options={lineNumberOptions}
        value={editorConfiguration.lineNumbers}
        onChange={option => editorConfiguration.lineNumbers = option?.value ?? defaultEditorConfig.lineNumbers}
        themeName="lens"
      />
    </section>
  );
});

export const LineNumbers = withInjectables<Dependencies>(NonInjectedLineNumbers, {
  getProps: (di) => ({
    state: di.inject(userPreferencesStateInjectable),
  }),
});
