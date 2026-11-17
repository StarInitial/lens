/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { useEffect, useState } from "react";
import type { PodLogsQuery } from "@k8slens/kube-object";
import type { CallForLogs } from "../../../renderer/components/dock/logs/call-for-logs.injectable";
import type { ColoredLogsTab } from "./colored-logs-store.injectable";

export const maxBufferedLogLines = 20000;

const pollIntervalMs = 2000;

export interface RawLogLine {
  /** Stable identity of the line, used as the React key. */
  seq: number;
  raw: string;
  /** Timestamp the Kubernetes API attached to the line, if the line has one. */
  timestamp: string;
  text: string;
}

export interface PodLogsState {
  lines: RawLogLine[];
  isLoading: boolean;
  error: string | null;
}

export interface PodLogsOptions {
  tailLines: number;
  previous: boolean;
  follow: boolean;
}

let lineSequence = 0;

const parseRawLine = (raw: string): RawLogLine => {
  const firstSpace = raw.indexOf(" ");
  const timestamp = firstSpace > 0 && /^\d{4}-\d{2}-\d{2}T/.test(raw) ? raw.slice(0, firstSpace) : "";

  return {
    seq: ++lineSequence,
    raw,
    timestamp,
    text: timestamp ? raw.slice(firstSpace + 1) : raw,
  };
};

/**
 * Reads a container's logs, re-reading them every couple of seconds when following: `sinceTime` only has
 * a second precision, so the lines already received within the last second are dropped.
 */
export function usePodLogs(callForLogs: CallForLogs, tab: ColoredLogsTab, { tailLines, previous, follow }: PodLogsOptions): PodLogsState {
  const [state, setState] = useState<PodLogsState>({ lines: [], isLoading: true, error: null });

  useEffect(() => {
    let isAlive = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lines: RawLogLine[] = [];
    let lastSecond: string | null = null;
    let seenInLastSecond = new Set<string>();

    const fetchLogs = (query: PodLogsQuery) => callForLogs({ name: tab.pod, namespace: tab.namespace }, {
      container: tab.container,
      timestamps: true,
      previous,
      ...query,
    });

    const append = (text: string): boolean => {
      const fresh = String(text ?? "")
        .split("\n")
        .filter((raw) => raw && !seenInLastSecond.has(raw))
        .map(parseRawLine);

      if (fresh.length === 0) {
        return false;
      }

      lines = [...lines, ...fresh].slice(-maxBufferedLogLines);

      const latestSecond = lines[lines.length - 1].timestamp.slice(0, 19);

      if (latestSecond !== lastSecond) {
        lastSecond = latestSecond;
        seenInLastSecond = new Set();
      }

      for (const line of fresh) {
        if (line.timestamp.slice(0, 19) === lastSecond) {
          seenInLastSecond.add(line.raw);
        }
      }

      return true;
    };

    const scheduleNextPoll = () => {
      if (isAlive && follow && !previous) {
        timer = setTimeout(poll, pollIntervalMs);
      }
    };

    const poll = async () => {
      try {
        const text = await fetchLogs(lastSecond ? { sinceTime: `${lastSecond}Z` } : { tailLines });

        if (isAlive && append(text)) {
          setState({ lines, isLoading: false, error: null });
        }
      } catch (error) {
        if (isAlive) {
          setState({ lines, isLoading: false, error: error instanceof Error ? error.message : String(error) });
        }
      }

      scheduleNextPoll();
    };

    setState({ lines: [], isLoading: true, error: null });

    fetchLogs({ tailLines }).then(
      (text) => {
        if (!isAlive) {
          return;
        }

        append(text);
        setState({ lines, isLoading: false, error: null });
        scheduleNextPoll();
      },
      (error: unknown) => {
        if (!isAlive) {
          return;
        }

        setState({ lines: [], isLoading: false, error: error instanceof Error ? error.message : String(error) });
        scheduleNextPoll();
      },
    );

    return () => {
      isAlive = false;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [callForLogs, tab.id, tab.pod, tab.namespace, tab.container, tailLines, previous, follow]);

  return state;
}
