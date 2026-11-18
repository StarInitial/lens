/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import type { DaemonSet } from "@k8slens/kube-object";
import { MenuItem } from "../menu";
import { Icon } from "@k8slens/icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import { daemonSetApiInjectable } from "@k8slens/kube-api-specifics";
import type { OpenConfirmDialog } from "../confirm-dialog/open.injectable";
import openConfirmDialogInjectable from "../confirm-dialog/open.injectable";
import type { ShowCheckedErrorNotification } from "@k8slens/notifications";
import { showCheckedErrorNotificationInjectable } from "@k8slens/notifications";
import type { DaemonSetApi } from "@k8slens/kube-api";
import { useTranslation } from "../../i18n/i18n-context";

export interface DaemonSetMenuProps extends KubeObjectMenuProps<DaemonSet> {}

interface Dependencies {
  daemonSetApi: DaemonSetApi;
  openConfirmDialog: OpenConfirmDialog;
  showCheckedErrorNotification: ShowCheckedErrorNotification;
}

const NonInjectedDaemonSetMenu = ({
  daemonSetApi,
  object,
  toolbar,
  openConfirmDialog,
  showCheckedErrorNotification,
}: Dependencies & DaemonSetMenuProps) => {
  const { t } = useTranslation();

  return <>
    <MenuItem
      onClick={() => openConfirmDialog({
        ok: async () =>
        {
          try {
            await daemonSetApi.restart({
              namespace: object.getNs(),
              name: object.getName(),
            });
          } catch (err) {
            showCheckedErrorNotification(err, t("workload.restart-error", { kind: t("resources.daemon-sets") }));
          }
        },
        labelOk: t("actions.restart"),
        message: <p>{t("workload.restart-confirmation", { kind: t("resources.daemon-sets"), name: object.getName() })}</p>,
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

export const DaemonSetMenu = withInjectables<Dependencies, DaemonSetMenuProps>(NonInjectedDaemonSetMenu, {
  getProps: (di, props) => ({
    ...props,
    daemonSetApi: di.inject(daemonSetApiInjectable),
    openConfirmDialog: di.inject(openConfirmDialogInjectable),
    showCheckedErrorNotification: di.inject(showCheckedErrorNotificationInjectable),
  }),
});
