/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { StatefulSet } from "@k8slens/kube-object";
import { MenuItem } from "../menu";
import { Icon } from "@k8slens/icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import { statefulSetApiInjectable } from "@k8slens/kube-api-specifics";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import type { ShowCheckedErrorNotification } from "@k8slens/notifications";
import { showCheckedErrorNotificationInjectable } from "@k8slens/notifications";
import type { StatefulSetApi } from "@k8slens/kube-api";
import { useTranslation } from "../../i18n/i18n-context";

export interface StatefulSetMenuProps extends KubeObjectMenuProps<StatefulSet> {}

interface Dependencies {
  statefulSetApi: StatefulSetApi;
  openConfirmDialog: OpenConfirmDialog;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

const NonInjectedStatefulSetMenu = ({
  statefulSetApi,
  object,
  toolbar,
  showCheckedErrorNotification,
  openConfirmDialog,
}: Dependencies & StatefulSetMenuProps) => {
  const { t } = useTranslation();

  return <>
    <MenuItem
      onClick={() => openConfirmDialog({
        ok: async () =>
        {
          try {
            await statefulSetApi.restart({
              namespace: object.getNs(),
              name: object.getName(),
            });
          } catch (err) {
            showCheckedErrorNotification(err, t("workload.restart-error", { kind: t("resources.stateful-sets") }));
          }
        },
        labelOk: t("actions.restart"),
        message: <p>{t("workload.restart-confirmation", { kind: t("resources.stateful-sets"), name: object.getName() })}</p>,
      })}
    >
      <Icon
        material="autorenew"
        tooltip={t("actions.restart")}
        interactive={toolbar}
      />
      <span className="title">{t("actions.restart")}</span>
    </MenuItem>
  </>;
};

export const StatefulSetMenu = withInjectables<Dependencies, StatefulSetMenuProps>(NonInjectedStatefulSetMenu, {
  getProps: (di, props) => ({
    ...props,
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
    statefulSetApi: di.inject(statefulSetApiInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
  }),
});
