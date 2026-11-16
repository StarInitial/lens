/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import type { Cluster } from "../../../common/cluster/cluster";
import { Input } from "../input";
import { SubTitle } from "../layout/sub-title";
import type { ShowNotification } from "@k8slens/notifications";
import { Icon } from "@k8slens/icon";
import { withInjectables } from "@ogre-tools/injectable-react";
import { showErrorNotificationInjectable } from "@k8slens/notifications";
import type { ValidateDirectory } from "../../../common/fs/validate-directory.injectable";
import validateDirectoryInjectable from "../../../common/fs/validate-directory.injectable";
import type { ResolveTilde } from "../../../common/path/resolve-tilde.injectable";
import resolveTildeInjectable from "../../../common/path/resolve-tilde.injectable";
import Gutter from "../gutter/gutter";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import type { OpenPathPickingDialog } from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";
import openPathPickingDialogInjectable from "../../../features/path-picking-dialog/renderer/pick-paths.injectable";
import type { LocalTerminalSettingPresenter } from "./local-terminal-setting-presenter.injectable";
import localTerminalSettingPresenterInjectable from "./local-terminal-setting-presenter.injectable";
import { Spinner } from "@k8slens/spinner";
import { action, runInAction } from "mobx";
import { useTranslation } from "../../i18n/i18n-context";
import { TranslatedKeyText } from "../../i18n/translated-text";

export interface ClusterLocalTerminalSettingProps {
  cluster: Cluster;
}
interface Dependencies {
  showErrorNotification: ShowNotification;
  validateDirectory: ValidateDirectory;
  resolveTilde: ResolveTilde;
  openPathPickingDialog: OpenPathPickingDialog;
  isWindows: boolean;
  presenter: LocalTerminalSettingPresenter;
}

const NonInjectedClusterLocalTerminalSetting = observer((props: Dependencies & ClusterLocalTerminalSettingProps) => {
  const {
    cluster,
    showErrorNotification,
    validateDirectory,
    resolveTilde,
    isWindows,
    openPathPickingDialog,
    presenter,
  } = props;
  const { t } = useTranslation();
  const commitDirectory = async (directory: string) => {
    if (!directory) {
      runInAction(() => {
        cluster.preferences.terminalCWD = undefined;
      });

      return;
    }

    const dir = resolveTilde(directory);
    const result = await validateDirectory(dir);

    if (result.callWasSuccessful) {
      runInAction(() => {
        cluster.preferences.terminalCWD = dir;
        presenter.directory.set(dir);
      });

      return;
    }

    showErrorNotification(
      <>
        <b>{t("cluster-settings.working-directory")}</b>
        <p>
          {t("cluster-settings.changes-were-not-saved-because")}
          {result.error}
        </p>
      </>,
    );
  };

  const commitDefaultNamespace = action(() => {
    cluster.preferences.defaultNamespace = presenter.defaultNamespace.get() || undefined;
  });

  const setAndCommitDirectory = (newPath: string) => {
    presenter.directory.set(newPath);
    commitDirectory(newPath);
  };

  const openFilePicker = () => {
    openPathPickingDialog({
      message: t("cluster-settings.choose-working-directory"),
      buttonLabel: t("cluster-settings.pick"),
      properties: ["openDirectory", "showHiddenFiles"],
      onPick: ([directory]) => setAndCommitDirectory(directory),
    });
  };

  return (
    <>
      <section className="working-directory">
        <SubTitle title="cluster-settings.working-directory"/>
        <Input
          theme="round-black"
          value={presenter.directory.get()}
          data-testid="working-directory"
          onChange={value => presenter.directory.set(value)}
          onBlur={() => commitDirectory(presenter.directory.get())}
          placeholder={isWindows ? "$USERPROFILE" : "$HOME"}
          iconRight={(
            <>
              {
                presenter.directory.get() && (
                  <Icon
                    material="close"
                    title={t("cluster-settings.clear")}
                    onClick={() => setAndCommitDirectory("")}
                    smallest
                    style={{ marginRight: "var(--margin)" }}
                  />
                )
              }
              <Icon
                material="folder"
                title={t("cluster-settings.pick-from-filesystem")}
                onClick={openFilePicker}
                smallest
              />
            </>
          )}
        />
        <small className="hint">
          <TranslatedKeyText value="cluster-settings.working-directory-hint" />
        </small>
      </section>
      <Gutter />
      <section className="default-namespace">
        <SubTitle title="cluster-settings.default-namespace"/>
        <Input
          theme="round-black"
          data-testid="default-namespace"
          value={presenter.defaultNamespace.get()}
          onChange={value => presenter.defaultNamespace.set(value)}
          onBlur={commitDefaultNamespace}
          placeholder={presenter.placeholderDefaultNamespace}
        />
        <small className="hint">
          <TranslatedKeyText value="cluster-settings.default-namespace-hint" />
        </small>
      </section>
    </>
  );
});

export const ClusterLocalTerminalSetting = withInjectables<Dependencies, ClusterLocalTerminalSettingProps>(NonInjectedClusterLocalTerminalSetting, {
  getPlaceholder: () => <Spinner center />,
  getProps: async (di, props) => ({
    ...props,
    showErrorNotification: di.inject(showErrorNotificationInjectable),
    validateDirectory: di.inject(validateDirectoryInjectable),
    resolveTilde: di.inject(resolveTildeInjectable),
    isWindows: di.inject(isWindowsInjectable),
    openPathPickingDialog: di.inject(openPathPickingDialogInjectable),
    presenter: await di.inject(localTerminalSettingPresenterInjectable, props.cluster),
  }),
});
