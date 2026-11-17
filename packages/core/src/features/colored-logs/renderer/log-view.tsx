/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@k8slens/icon";
import { useTranslation } from "../../../renderer/i18n/i18n-context";
import type { CallForLogs } from "../../../renderer/components/dock/logs/call-for-logs.injectable";
import { colorizeLogLine } from "./log-parse";
import type { LogPalette } from "./log-colors";
import type { ColoredLogsTab } from "./colored-logs-store.injectable";
import { logLevelRank, logLevels } from "./log-level";
import type { LogLevel } from "./log-level";
import { usePodLogs } from "./use-pod-logs";
import type { RawLogLine } from "./use-pod-logs";

const renderLimit = 4000;

const tailOptions = [100, 500, 1000, 5000, 20000];

type MinimalLevel = "ALL" | LogLevel;

const othersKey = "OTHERS";

interface LevelCounts {
  [level: string]: number;
}

interface ColoredLine {
  line: RawLogLine;
  text: string;
  parts: ReturnType<typeof colorizeLogLine>["parts"];
  level: LogLevel | null;
}

export interface LogViewProps {
  tab: ColoredLogsTab;
  palette: LogPalette;
  callForLogs: CallForLogs;
  onChangeContainer: (container: string) => void;
}

const controlStyle = (palette: LogPalette): React.CSSProperties => ({
  background: palette.background,
  color: palette.text,
  border: `1px solid ${palette.border}`,
  borderRadius: 4,
  padding: "2px 6px",
  fontSize: 12,
});

const Toggle = ({ palette, checked, onChange, title, children }: {
  palette: LogPalette;
  checked: boolean;
  onChange: (checked: boolean) => void;
  title?: string;
  children: React.ReactNode;
}) => (
  <label
    title={title}
    style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 12, color: palette.text }}
  >
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    {children}
  </label>
);

const LogLine = memo(({ line, parts, palette, showTimestamp, wrap }: {
  line: RawLogLine;
  parts: ColoredLine["parts"];
  palette: LogPalette;
  showTimestamp: boolean;
  wrap: boolean;
}) => (
  <div style={{ whiteSpace: wrap ? "pre-wrap" : "pre", wordBreak: wrap ? "break-all" : "normal", padding: "0 10px" }}>
    {showTimestamp && line.timestamp && (
      <span style={{ color: palette.muted, opacity: 0.7 }}>
        {`${line.timestamp.slice(0, 23).replace("T", " ")} `}
      </span>
    )}
    {parts.map(([text, color, bold], index) => (
      <span key={index} style={color || bold ? { color, fontWeight: bold ? 600 : undefined } : undefined}>
        {text}
      </span>
    ))}
  </div>
));

LogLine.displayName = "LogLine";

export const LogView = ({ tab, palette, callForLogs, onChangeContainer }: LogViewProps) => {
  const { t } = useTranslation();
  const [tailLines, setTailLines] = useState(1000);
  const [follow, setFollow] = useState(true);
  const [previous, setPrevious] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(false);
  const [filter, setFilter] = useState("");
  const [minLevel, setMinLevel] = useState<MinimalLevel>("ALL");

  const { lines, isLoading, error } = usePodLogs(callForLogs, tab, { tailLines, previous, follow });
  const scroller = useRef<HTMLDivElement>(null);
  const sticksToBottom = useRef(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Each line is colorized once; the cache is dropped when the palette changes.
  const paintedLines = useRef(new WeakMap<RawLogLine, ReturnType<typeof colorizeLogLine>>());

  useEffect(() => {
    paintedLines.current = new WeakMap();
  }, [palette]);

  const colored = useMemo(() => {
    const result: ColoredLine[] = [];
    let lastLevel: LogLevel | null = null;

    for (const line of lines) {
      let parsed = paintedLines.current.get(line);

      if (!parsed) {
        parsed = colorizeLogLine(line.text, palette);
        paintedLines.current.set(line, parsed);
      }

      // An exception without a log line before it (printStackTrace, traceback) is an error, and so is
      // its stack trace; unhandled .NET exceptions and Go panics are always errors.
      if (parsed.fatal || (parsed.exception && !lastLevel)) {
        lastLevel = "ERROR";
      }

      const level = parsed.level ?? (parsed.continuation ? lastLevel : null);

      if (parsed.level) {
        lastLevel = parsed.level;
      } else if (!parsed.continuation) {
        lastLevel = null;
      }

      result.push({ line, text: line.text, parts: parsed.parts, level });
    }

    return result;
  }, [lines, palette]);

  const counts = useMemo(() => {
    const result: LevelCounts = {};

    for (const line of colored) {
      const key = line.level ?? othersKey;

      result[key] = (result[key] ?? 0) + 1;
    }

    return result;
  }, [colored]);

  const needle = filter.trim().toLowerCase();
  // With a minimum level chosen, lines without a level (others) disappear, while stack traces inherit
  // the level of the line above and stay.
  const isLevelIncluded = (level: LogLevel | null) => minLevel === "ALL" || Boolean(level && logLevelRank[level] >= logLevelRank[minLevel as LogLevel]);
  const visible = colored.filter((line) => isLevelIncluded(line.level) && (!needle || line.text.toLowerCase().includes(needle)));
  const shown = visible.slice(-renderLimit);

  useEffect(() => {
    const element = scroller.current;

    if (element && sticksToBottom.current) {
      element.scrollTop = element.scrollHeight;
    }
  });

  const jumpToBottom = () => {
    sticksToBottom.current = true;
    setIsAtBottom(true);

    if (scroller.current) {
      scroller.current.scrollTop = scroller.current.scrollHeight;
    }
  };

  const levelChip = (level: string) => {
    const color = level === othersKey ? palette.muted : palette.level[level as LogLevel];
    const isIncluded = level === othersKey ? minLevel === "ALL" : isLevelIncluded(level as LogLevel);
    const target: MinimalLevel = level === othersKey || minLevel === level ? "ALL" : level as LogLevel;
    const title = target === "ALL"
      ? t("colored-logs.level.show-all")
      : level === "ERROR"
        ? t("colored-logs.level.show-errors")
        : t("colored-logs.level.show-at-least", { level });

    return (
      <span
        key={level}
        onClick={() => setMinLevel(target)}
        title={title}
        style={{
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          padding: "1px 7px",
          borderRadius: 10,
          userSelect: "none",
          border: `1px solid ${color}`,
          color,
          opacity: isIncluded ? 1 : 0.4,
          background: minLevel === level ? `${color}33` : "transparent",
        }}
      >
        {`${level === othersKey ? t("colored-logs.level.others") : level} ${counts[level] ?? 0}`}
      </span>
    );
  };

  const toolbar = (
    <div style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
      padding: "6px 10px",
      borderBottom: `1px solid ${palette.border}`,
      background: palette.bar,
    }}>
      {tab.containers.length > 1 && (
        <select
          value={tab.container}
          style={controlStyle(palette)}
          title={t("colored-logs.container")}
          onChange={(event) => onChangeContainer(event.target.value)}
        >
          {tab.containers.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      )}
      <select
        value={tailLines}
        style={controlStyle(palette)}
        title={t("colored-logs.initial-lines")}
        onChange={(event) => setTailLines(Number(event.target.value))}
      >
        {tailOptions.map((count) => (
          <option key={count} value={count}>{t("colored-logs.last-lines", { count })}</option>
        ))}
      </select>
      <Toggle palette={palette} checked={follow && !previous} onChange={setFollow} title={t("colored-logs.follow-tooltip")}>
        {t("colored-logs.follow")}
      </Toggle>
      <Toggle palette={palette} checked={previous} onChange={setPrevious} title={t("colored-logs.previous-tooltip")}>
        {t("colored-logs.previous")}
      </Toggle>
      <Toggle palette={palette} checked={wrap} onChange={setWrap}>
        {t("colored-logs.wrap")}
      </Toggle>
      <Toggle palette={palette} checked={showTimestamp} onChange={setShowTimestamp} title={t("colored-logs.timestamps-tooltip")}>
        {t("colored-logs.timestamps")}
      </Toggle>
      <select
        value={minLevel}
        style={controlStyle(palette)}
        title={t("colored-logs.levels")}
        onChange={(event) => setMinLevel(event.target.value as MinimalLevel)}
      >
        <option value="ALL">{t("colored-logs.level.all")}</option>
        <option value="ERROR">{t("colored-logs.level.errors")}</option>
        <option value="WARN">{t("colored-logs.level.warnings")}</option>
        <option value="INFO">{t("colored-logs.level.info")}</option>
        <option value="DEBUG">{t("colored-logs.level.debug")}</option>
      </select>
      <span style={{ display: "inline-flex", gap: 6 }}>
        {[...logLevels, othersKey].filter((level) => counts[level]).map(levelChip)}
      </span>
      <span style={{ flex: 1 }}/>
      <input
        placeholder={t("colored-logs.filter-placeholder")}
        value={filter}
        style={{ ...controlStyle(palette), width: 200 }}
        onChange={(event) => setFilter(event.target.value)}
      />
      <span
        title={t("colored-logs.copy-tooltip")}
        style={{ cursor: "pointer", display: "inline-flex", color: palette.text }}
        onClick={() => navigator.clipboard?.writeText(visible.map((line) => line.text).join("\n"))}
      >
        <Icon material="content_copy" small/>
      </span>
      <span style={{ fontSize: 11, color: palette.muted }}>
        {isLoading
          ? t("colored-logs.loading")
          : visible.length === colored.length
            ? t("colored-logs.line-count", { count: visible.length })
            : t("colored-logs.line-count-filtered", { visible: visible.length, total: colored.length })}
      </span>
    </div>
  );

  const body = (
    <div
      ref={scroller}
      onScroll={(event) => {
        const element = event.currentTarget;

        sticksToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 40;

        if (sticksToBottom.current !== isAtBottom) {
          setIsAtBottom(sticksToBottom.current);
        }
      }}
      style={{
        flex: 1,
        overflow: "auto",
        background: palette.background,
        color: palette.text,
        padding: "4px 0",
        fontFamily: "'Lucida Console', Monaco, Consolas, monospace",
        fontSize: 13,
        lineHeight: "20px",
      }}
    >
      {error && <div style={{ color: palette.error, padding: "4px 10px" }}>{t("colored-logs.read-error", { message: error })}</div>}
      {!isLoading && !error && colored.length === 0 && (
        <div style={{ color: palette.muted, padding: "4px 10px" }}>{t("colored-logs.no-lines")}</div>
      )}
      {visible.length > shown.length && (
        <div style={{ color: palette.muted, padding: "0 10px 4px" }}>
          {t("colored-logs.hidden-lines", { count: visible.length - shown.length })}
        </div>
      )}
      {shown.map((item) => (
        <LogLine
          key={item.line.seq}
          line={item.line}
          parts={item.parts}
          palette={palette}
          showTimestamp={showTimestamp}
          wrap={wrap}
        />
      ))}
    </div>
  );

  // Away from the bottom the scrolling stays put; this button resumes following new lines.
  const jumpButton = !isAtBottom && (
    <span
      onClick={jumpToBottom}
      title={t("colored-logs.jump-to-end-tooltip")}
      style={{
        position: "absolute",
        right: 24,
        bottom: 12,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 12,
        padding: "3px 10px",
        borderRadius: 12,
        color: palette.text,
        background: palette.bar,
        border: `1px solid ${palette.border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
      }}
    >
      <Icon material="arrow_downward" small/>
      {t("colored-logs.jump-to-end")}
    </span>
  );

  return (
    <>
      {toolbar}
      <div style={{ flex: 1, minHeight: 0, position: "relative", display: "flex", flexDirection: "column" }}>
        {body}
        {jumpButton}
      </div>
    </>
  );
};
