/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import { Button } from "@k8slens/button";
import showDialogForAddingCustomHelmRepositoryInjectable from "./dialog-visibility/show-dialog-for-adding-custom-helm-repository.injectable";
import { useTranslation } from "../../../../../../renderer/i18n/i18n-context";

interface Dependencies {
  showDialog: () => void;
}

const NonInjectedActivationOfCustomHelmRepositoryOpenButton = ({ showDialog }: Dependencies) => {
  const { t } = useTranslation();

  return (
    <Button
      primary
      label={t("preferences.kubernetes.helm-charts.add-custom-repository")}
      onClick={showDialog}
      data-testid="add-custom-helm-repo-button"
    />
  );
};

export const AddingOfCustomHelmRepositoryOpenButton = withInjectables<Dependencies>(
  NonInjectedActivationOfCustomHelmRepositoryOpenButton,

  {
    getProps: (di) => ({
      showDialog: di.inject(showDialogForAddingCustomHelmRepositoryInjectable),
    }),
  },
);
