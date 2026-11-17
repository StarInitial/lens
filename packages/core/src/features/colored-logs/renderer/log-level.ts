/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export const logLevels = ["ERROR", "WARN", "INFO", "DEBUG", "TRACE"] as const;

export type LogLevel = (typeof logLevels)[number];

/** Higher rank means more severe, used by the "minimum level" filter. */
export const logLevelRank: Record<LogLevel, number> = {
  ERROR: 4,
  WARN: 3,
  INFO: 2,
  DEBUG: 1,
  TRACE: 0,
};

/**
 * Level names used by the most common logging libraries: Spring/logback/log4j,
 * .NET (Microsoft.Extensions.Logging, Serilog, NLog), Python, Go (zap/logrus/klog),
 * Node (pino/winston), Ruby, PHP and syslog.
 */
const levelAliases: Record<string, LogLevel> = {
  ERROR: "ERROR",
  ERR: "ERROR",
  FAIL: "ERROR",
  FATAL: "ERROR",
  FTL: "ERROR",
  CRIT: "ERROR",
  CRITICAL: "ERROR",
  SEVERE: "ERROR",
  ALERT: "ERROR",
  EMERG: "ERROR",
  EMERGENCY: "ERROR",
  PANIC: "ERROR",
  DPANIC: "ERROR",
  WARN: "WARN",
  WARNING: "WARN",
  WRN: "WARN",
  INFO: "INFO",
  INF: "INFO",
  INFORMATION: "INFO",
  INFORMATIONAL: "INFO",
  NOTICE: "INFO",
  DEBUG: "DEBUG",
  DBG: "DEBUG",
  DBUG: "DEBUG",
  FINE: "DEBUG",
  TRACE: "TRACE",
  TRC: "TRACE",
  TRCE: "TRACE",
  VRB: "TRACE",
  VERBOSE: "TRACE",
  FINER: "TRACE",
  FINEST: "TRACE",
};

export const allLevelAliases = Object.keys(levelAliases);

/**
 * pino/bunyan use a numeric level (10 trace … 60 fatal).
 */
export function normalizeLogLevel(value: unknown): LogLevel | null {
  if (typeof value === "number") {
    return value >= 50 ? "ERROR" : value >= 40 ? "WARN" : value >= 30 ? "INFO" : value >= 20 ? "DEBUG" : "TRACE";
  }

  const aliased = levelAliases[String(value ?? "").trim().toUpperCase()];

  return aliased ?? null;
}
