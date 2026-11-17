/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LogLevel } from "./log-level";
import { allLevelAliases, normalizeLogLevel } from "./log-level";
import type { LogPalette } from "./log-colors";

export type LogPart = [text: string, color?: string, bold?: boolean];

export interface ParsedLogLine {
  parts: LogPart[];
  level: LogLevel | null;
  /** Wrapped message or stack trace line: it inherits the level of the line above. */
  continuation?: boolean;
  /** The line announces an exception, so it is treated as an error even without a level. */
  exception?: boolean;
  /** Unhandled exceptions and panics are always errors. */
  fatal?: boolean;
}

type Parser = (text: string, palette: LogPalette) => ParsedLogLine | null;

// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;

const TIMESTAMP = String.raw`(?:\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d+)?(?:Z| ?[+-]\d{2}:?\d{2})?|\d{2}:\d{2}:\d{2}(?:[.,]\d+)?)`;
const TIMESTAMP_AT_START = new RegExp(`^${TIMESTAMP}`);
const LEVEL_AT_START = new RegExp(`^(${allLevelAliases.join("|")})\\b`);

// Stack traces: Java, .NET, Python, Go and Node.
const STACK_LINE = /^(\s+at\s|\s*\.\.\. \d+ (more|common frames omitted)|\s*--- End of (inner exception )?stack trace|\s+File ".*", line \d+|goroutine \d+ \[|\s+\/\S+\.go:\d+|\s+\S+\.(js|mjs|ts|py|rb|php|cs):\d+)/;
const STACK_ERROR_LINE = /^\s*(Caused by:|Suppressed:|--->|Traceback \(most recent call last\):|panic:|Unhandled exception\.|[\w$.]*(Exception|Error|Throwable)\b(:|$))/;

const leveled = (palette: LogPalette, level: LogLevel, text: string): LogPart => [text, palette.level[level], true];

/**
 * Spring Boot, logback, log4j and NLog:
 * `[date] [thread] LEVEL [pid] --- [app] [thread] logger : message`
 */
function parseLogbackHead(text: string, palette: LogPalette): ParsedLogLine | null {
  const parts: LogPart[] = [];
  let rest = text;
  let level: LogLevel | null = null;

  const take = (pattern: RegExp, color?: string): RegExpExecArray | null => {
    const match = pattern.exec(rest);

    if (!match) {
      return null;
    }

    parts.push([match[0], color]);
    rest = rest.slice(match[0].length);

    return match;
  };

  take(TIMESTAMP_AT_START, palette.faint);

  for (let i = 0; i < 12 && rest; i++) {
    if (take(/^\s+/) || take(/^\|/, palette.faint)) {
      continue;
    }

    if (!level) {
      const match = LEVEL_AT_START.exec(rest);

      if (match) {
        level = normalizeLogLevel(match[1]) ?? null;
        parts.push(leveled(palette, level ?? "INFO", match[1]));
        rest = rest.slice(match[1].length);
        continue;
      }
    }

    if (take(/^\[[^\]]*\]/, palette.faint) || take(/^---/, palette.faint)) {
      continue;
    }

    if (level && take(/^\d+(?=\s)/, palette.pid)) {
      continue;
    }

    // Logger followed by " : " (Spring), " - " (logback/log4j) or "|" (NLog). `\S` also accepts the
    // abbreviated Tomcat loggers Spring prints, e.g. `o.a.c.c.C.[.[.[/].[dispatcherServlet]`.
    const logger = level && /^(\S*?[^\s:|-])(\s*)(:\s|-\s|\|)/.exec(rest);

    if (logger) {
      parts.push([logger[1], palette.logger], [logger[2] + logger[3], palette.faint]);
      rest = rest.slice(logger[0].length);
    }

    break;
  }

  if (!level) {
    return null;
  }

  parts.push([rest]);

  return { parts, level };
}

const defaultParsers: Parser[] = [
  // JSON (logstash/ECS, Serilog CLEF, .NET JSON console, zap, pino, winston, structlog, GCP).
  (text, palette) => (text.startsWith("{") ? parseJsonLine(text, palette) : null),

  // Stack traces.
  (text, palette) => (STACK_LINE.test(text) ? { parts: [[text, palette.faint]], level: null, continuation: true } : null),
  (text, palette) => (STACK_ERROR_LINE.test(text)
    ? {
      parts: [[text, palette.error]],
      level: null,
      continuation: true,
      exception: true,
      fatal: /^\s*(Unhandled exception\.|panic:)/.test(text),
    }
    : null),

  // Default .NET console: "info: Microsoft.Hosting.Lifetime[14]" (the message is on the next, indented line).
  (text, palette) => {
    const match = new RegExp(`^(${TIMESTAMP}\\s+)?(info|warn|fail|crit|dbug|trce)(: )(\\S+?)(\\[\\d+\\])?(\\s|$)`).exec(text);

    if (!match) {
      return null;
    }

    const level = normalizeLogLevel(match[2]);

    if (!level) {
      return null;
    }

    return {
      level,
      parts: [
        [match[1] ?? "", palette.faint],
        leveled(palette, level, match[2]),
        [match[3]],
        [match[4], palette.logger],
        [match[5] ?? "", palette.faint],
        [text.slice(match[0].length - match[6].length)],
      ],
    };
  },

  // .NET systemd / syslog: "<6>Category[0] message" (0-3 error, 4 warning, 5-6 info, 7 debug).
  (text, palette) => {
    const match = /^<([0-7])>/.exec(text);

    if (!match) {
      return null;
    }

    const severity = Number(match[1]);
    const level: LogLevel = severity <= 3 ? "ERROR" : severity === 4 ? "WARN" : severity <= 6 ? "INFO" : "DEBUG";

    return { level, parts: [leveled(palette, level, match[0]), [text.slice(match[0].length)]] };
  },

  // Serilog console: "[10:00:00 INF] message" or "[2024-05-01 10:00:00.123 -03:00 ERR] message".
  (text, palette) => {
    const match = new RegExp(`^\\[(${TIMESTAMP}\\s+)?(VRB|DBG|INF|WRN|ERR|FTL)\\]`).exec(text);

    if (!match) {
      return null;
    }

    const level = normalizeLogLevel(match[2]);

    if (!level) {
      return null;
    }

    return {
      level,
      parts: [
        ["[", palette.faint],
        [match[1] ?? "", palette.faint],
        leveled(palette, level, match[2]),
        ["]", palette.faint],
        [text.slice(match[0].length)],
      ],
    };
  },

  // klog (Kubernetes, Go): "E0501 10:00:00.123456       1 controller.go:42] message".
  (text, palette) => {
    const match = /^([IWEF])(\d{4} \d{2}:\d{2}:\d{2}\.\d+)(\s+\d+\s+)([^\s\]]+:\d+)\]/.exec(text);

    if (!match) {
      return null;
    }

    const level: LogLevel = match[1] === "I" ? "INFO" : match[1] === "W" ? "WARN" : "ERROR";

    return {
      level,
      parts: [
        leveled(palette, level, match[1]),
        [match[2], palette.faint],
        [match[3], palette.pid],
        [match[4], palette.logger],
        ["]", palette.faint],
        [text.slice(match[0].length)],
      ],
    };
  },

  // Ruby Logger: "E, [2024-05-01T10:00:00.123 #1] ERROR -- app: message".
  (text, palette) => {
    const match = /^([DIWEFA]), \[([^\]]+)\]\s+(\w+) -- ([^:]*):/.exec(text);
    const level = match ? normalizeLogLevel(match[3]) : null;

    if (!match || !level) {
      return null;
    }

    return {
      level,
      parts: [
        [`${match[1]}, [${match[2]}] `, palette.faint],
        leveled(palette, level, match[3]),
        [" -- ", palette.faint],
        [match[4], palette.logger],
        [":", palette.faint],
        [text.slice(match[0].length)],
      ],
    };
  },

  parseLogbackHead,

  // Anything else: look for the level near the start of the line (Python "ERROR:root:",
  // "- name - ERROR -", Laravel "production.ERROR:", logfmt "level=error", nginx/apache "[error]").
  (text, palette) => {
    const head = text.slice(0, 160);
    const keyed = /\b(?:level|lvl|severity)=("?)(\w+)\1/i.exec(head);
    let word = keyed?.[2];
    let token = keyed?.[0];
    let index = keyed?.index;

    if (!keyed) {
      const found = /(?:^|[\s[(|.:"'])(ERROR|ERR|FATAL|CRITICAL|SEVERE|WARN|WARNING|INFO|DEBUG|TRACE|NOTICE)(?=$|[\s\]):,."'-])/.exec(head)
        ?? /\[(error|warn|warning|info|debug|notice|crit|alert|emerg)\]/.exec(head);

      if (!found) {
        return null;
      }

      word = found[1];
      token = found[0].startsWith("[") && found[0].endsWith("]") ? found[0] : word;
      index = found.index + found[0].length - token.length;
    }

    const level = normalizeLogLevel(word);

    if (!level || token === undefined || index === undefined) {
      return null;
    }

    const timestamp = TIMESTAMP_AT_START.exec(text);
    const before = text.slice(0, index);
    const parts: LogPart[] = timestamp && timestamp[0].length <= index
      ? [[timestamp[0], palette.faint], [before.slice(timestamp[0].length)]]
      : [[before]];

    return { level, parts: [...parts, leveled(palette, level, token), [text.slice(index + token.length)]] };
  },

  // Access logs (nginx, apache, ingress): paint the HTTP status; 5xx counts as an error and 4xx as a warning.
  (text, palette) => {
    const match = /"(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|CONNECT|TRACE) [^"]*" (\d{3}) /.exec(text);

    if (!match) {
      return null;
    }

    const status = Number(match[1]);
    const level: LogLevel = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
    const index = match.index + match[0].length - 4;

    return {
      level,
      parts: [[text.slice(0, index)], [match[1], palette.level[level], true], [text.slice(index + 3)]],
    };
  },
];

/**
 * JSON logs: builds "date LEVEL [thread] logger : message" and shows the remaining
 * fields (traceId and friends) dimmed.
 */
function parseJsonLine(text: string, palette: LogPalette): ParsedLogLine | null {
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const used = new Set<string>();

  const pick = (...keys: string[]): unknown => {
    const key = keys.find((candidate) => parsed[candidate] !== undefined && parsed[candidate] !== null && parsed[candidate] !== "");

    if (key === undefined) {
      return undefined;
    }

    used.add(key);

    return parsed[key];
  };

  // Compact Serilog (CLEF).
  const compactSerilog = parsed["@t"] !== undefined && (parsed["@m"] !== undefined || parsed["@mt"] !== undefined);
  const rawLevel = pick("level", "log.level", "severity", "levelname", "level_name", "lvl", "LogLevel", "Level", "@l");
  const level = normalizeLogLevel(rawLevel) ?? (compactSerilog ? "INFO" : null);
  const message = pick("message", "msg", "Message", "@m", "@mt", "event", "RenderedMessage", "MessageTemplate");

  if (!level && message === undefined) {
    return null;
  }

  let timestamp = pick("@timestamp", "timestamp", "Timestamp", "time", "ts", "@t", "asctime", "date");

  if (typeof timestamp === "number") {
    // zap uses seconds, pino milliseconds.
    timestamp = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp).toISOString();
  }

  const parts: LogPart[] = [];

  if (timestamp !== undefined) {
    parts.push([`${String(timestamp)} `, palette.faint]);
  }

  if (level) {
    const label = typeof rawLevel === "string" ? rawLevel : level;

    parts.push(leveled(palette, level, label.toUpperCase().padEnd(5)), [" "]);
  }

  const thread = pick("thread_name", "thread", "process.thread.name", "ThreadId");

  if (thread !== undefined) {
    parts.push([`[${String(thread)}] `, palette.faint]);
  }

  const logger = pick("logger_name", "logger", "log.logger", "Category", "SourceContext", "name", "caller");

  if (logger !== undefined) {
    parts.push([String(logger), palette.logger], [" : ", palette.faint]);
  }

  parts.push([message === undefined ? "" : typeof message === "string" ? message : JSON.stringify(message)]);

  // Known noise that never needs to be shown again.
  for (const noise of ["EventId", "@i", "pid", "hostname", "v", "@version", "level_value"]) {
    pick(noise);
  }

  const stack = pick("stack_trace", "stacktrace", "error.stack_trace", "exc_info", "Exception", "@x", "exception", "stack", "err");
  const extra = Object.keys(parsed).filter((key) => !used.has(key));

  if (extra.length > 0) {
    parts.push([`  ${JSON.stringify(Object.fromEntries(extra.map((key) => [key, parsed[key]])))}`, palette.faint]);
  }

  if (stack !== undefined) {
    parts.push([`\n${typeof stack === "string" ? stack : JSON.stringify(stack, null, 2)}`, palette.error]);
  }

  return { parts, level };
}

/**
 * Breaks a log line into colored parts. The first parser that recognises the line wins.
 */
export function colorizeLogLine(text: string, palette: LogPalette): ParsedLogLine {
  const withoutAnsi = text.replace(ANSI_ESCAPE, "");

  for (const parser of defaultParsers) {
    const parsed = parser(withoutAnsi, palette);

    if (parsed) {
      return { continuation: false, ...parsed };
    }
  }

  const timestamp = TIMESTAMP_AT_START.exec(withoutAnsi);

  return {
    parts: timestamp ? [[timestamp[0], palette.faint], [withoutAnsi.slice(timestamp[0].length)]] : [[withoutAnsi]],
    level: null,
    continuation: /^\s+\S/.test(withoutAnsi),
  };
}
