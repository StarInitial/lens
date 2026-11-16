/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./sub-title.scss";
import React from "react";
import type { StrictReactNode } from "@k8slens/utilities";
import { cssNames } from "@k8slens/utilities";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { I18n } from "../../../common/i18n/i18n.injectable";
import i18nInjectable from "../../../common/i18n/i18n.injectable";

export interface SubTitleProps {
  className?: string;

  /**
   * A translation key (for example `preferences.application.theme.title`) or a
   * ready to render node. String titles that are not translation keys are
   * rendered as they are, which keeps extension provided titles working.
   */
  title: StrictReactNode;
  compact?: boolean; // no bottom padding
  id?: string;
  children?: StrictReactNode;
}

interface Dependencies {
  i18n: I18n;
}

const NonInjectedSubTitle = observer(({ className, compact, title, children, id, i18n }: SubTitleProps & Dependencies) => {
  const classNames = cssNames("SubTitle", className, {
    compact,
  });

  return (
    <div className={classNames} id={id}>
      {typeof title === "string" ? i18n.t(title) : title}
      {" "}
      {children}
    </div>
  );
});

export const SubTitle = withInjectables<Dependencies, SubTitleProps>(NonInjectedSubTitle, {
  getProps: (di, props) => ({
    i18n: di.inject(i18nInjectable),
    ...props,
  }),
});
