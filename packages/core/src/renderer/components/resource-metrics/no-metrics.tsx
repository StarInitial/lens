/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { Icon } from "@k8slens/icon";
import { useTranslation } from "../../i18n/i18n-context";

export function NoMetrics() {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center align-center">
      <Icon material="info"/>
&nbsp;
      {t("details.metrics-not-available")}
    </div>
  );
}
