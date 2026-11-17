/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import { Icon } from "@k8slens/icon";
import type { IComputedValue } from "mobx";
import type { LensTheme } from "../../../renderer/themes/lens-theme";
import activeThemeInjectable from "../../../renderer/themes/active.injectable";
import { useTranslation } from "../../../renderer/i18n/i18n-context";
import type { CallForLogs } from "../../../renderer/components/dock/logs/call-for-logs.injectable";
import callForLogsInjectable from "../../../renderer/components/dock/logs/call-for-logs.injectable";
import type { ColoredLogsStore } from "./colored-logs-store.injectable";
import coloredLogsStoreInjectable from "./colored-logs-store.injectable";
import { buildLogPalette } from "./log-colors";
import { LogView } from "./log-view";

interface Dependencies {
  store: ColoredLogsStore;
  activeTheme: IComputedValue<LensTheme>;
  callForLogs: CallForLogs;
}

const NonInjectedColoredLogsDock = ({ store, activeTheme, callForLogs }: Dependencies) => {
  const { t } = useTranslation();

  if (!store.isOpen || store.tabs.length === 0) {
    return null;
  }

  const palette = buildLogPalette(activeTheme.get());
  const activeTab = store.activeTab ?? store.tabs[0];

  const startResize = (event: React.MouseEvent) => {
    event.preventDefault();

    const startY = event.clientY;
    const startHeight = store.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      store.setHeight(Math.max(160, Math.min(window.innerHeight - 80, startHeight + startY - moveEvent.clientY)));
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const iconButton = (material: string, title: string, onClick: () => void) => (
    <span
      title={title}
      onClick={onClick}
      style={{ cursor: "pointer", display: "inline-flex", color: palette.text, opacity: 0.8 }}
    >
      <Icon material={material} small/>
    </span>
  );

  const tabsBar = (
    <div style={{
      display: "flex",
      alignItems: "stretch",
      background: palette.bar,
      borderBottom: `1px solid ${palette.border}`,
      minHeight: 30,
    }}>
      <div style={{ display: "flex", overflowX: "auto", flex: 1 }}>
        {store.tabs.map((tab) => {
          const isSelected = tab.id === activeTab.id;

          return (
            <div
              key={tab.id}
              title={`${tab.namespace}/${tab.pod} (${tab.container})`}
              onClick={() => store.selectTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 10px",
                cursor: "pointer",
                fontSize: 12,
                whiteSpace: "nowrap",
                color: palette.text,
                borderRight: `1px solid ${palette.border}`,
                borderBottom: `2px solid ${isSelected ? palette.accent : "transparent"}`,
                background: isSelected ? palette.background : "transparent",
              }}
            >
              <Icon material="palette" small/>
              <span>{tab.pod}</span>
              <span style={{ color: palette.muted }}>{tab.container}</span>
              <span
                onClick={(event) => {
                  event.stopPropagation();
                  store.closeTab(tab.id);
                }}
                title={t("colored-logs.close")}
                style={{ display: "inline-flex", opacity: 0.7 }}
              >
                <Icon material="close" small/>
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 10px" }}>
        {iconButton(
          store.isMinimized ? "keyboard_arrow_up" : "keyboard_arrow_down",
          store.isMinimized ? t("colored-logs.restore") : t("colored-logs.minimize"),
          () => store.toggleMinimized(),
        )}
        {iconButton("close", t("colored-logs.close-all"), () => store.closeAll())}
      </div>
    </div>
  );

  return (
    <div style={{
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      height: store.isMinimized ? 31 : store.height,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      background: palette.background,
      borderTop: `1px solid ${palette.border}`,
      boxShadow: "0 -2px 8px rgba(0,0,0,0.35)",
    }}>
      {!store.isMinimized && (
        <div
          onMouseDown={startResize}
          title={t("colored-logs.resize-tooltip")}
          style={{ position: "absolute", top: -3, left: 0, right: 0, height: 6, cursor: "ns-resize", zIndex: 1 }}
        />
      )}
      {tabsBar}
      {!store.isMinimized && (
        <LogView
          key={activeTab.id}
          tab={activeTab}
          palette={palette}
          callForLogs={callForLogs}
          onChangeContainer={(container) => store.switchContainer(activeTab, container)}
        />
      )}
    </div>
  );
};

export const ColoredLogsDock = withInjectables<Dependencies>(observer(NonInjectedColoredLogsDock), {
  getProps: (di) => ({
    store: di.inject(coloredLogsStoreInjectable),
    activeTheme: di.inject(activeThemeInjectable),
    callForLogs: di.inject(callForLogsInjectable),
  }),
});
