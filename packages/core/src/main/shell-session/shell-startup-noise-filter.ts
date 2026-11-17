/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Windows PowerShell prints
 *
 *   Unable to load PSReadline module. Console will be run without PSReadline.
 *   无法加载 PSReadline 模块。控制台在未使用 PSReadline 的情况下运行。
 *
 * on an interactive start when PSReadLine could not be loaded. Whether it loads depends on the machine
 * (module path, console type, PowerShell version) and is outside our control, but the line itself is pure
 * noise for someone who just wanted a terminal. Drop it from the shell's output instead of trying to make
 * PSReadLine load, so nothing is printed even when the load fails.
 */
const isPSReadLineWarning = (line: string) => /PSReadline/i.test(line)
  && /(无法加载|Unable to load|not be loaded|运行)/i.test(line);

/** Startings of the warning, used to recognise a line that is still arriving in pieces. */
const warningStarts = [
  "无法加载",
  "Unable to load PSReadline",
  "Console will be run without PSReadline",
];

/**
 * How many lines of a shell's output are inspected for the warning. It is printed during startup, before
 * the first prompt, so a handful of lines is enough and normal output is passed through afterwards.
 */
const inspectedLineCount = 8;

/**
 * Filters the PSReadLine startup warning out of a shell's output stream.
 *
 * Chunks arrive at arbitrary boundaries: output is emitted line by line, and a trailing partial line is
 * emitted immediately unless it could still grow into the warning. That keeps prompts (which have no
 * trailing newline) and ordinary output streaming exactly as before.
 */
export class ShellStartupNoiseFilter {
  private pending = "";
  private linesSeen = 0;
  private isFinished = false;

  push(chunk: string): string {
    if (this.isFinished) {
      return chunk;
    }

    let data = this.pending + chunk;
    let output = "";

    this.pending = "";

    for (let newline = data.indexOf("\n"); newline !== -1; newline = data.indexOf("\n")) {
      const line = data.slice(0, newline + 1);

      data = data.slice(newline + 1);

      if (!isPSReadLineWarning(line)) {
        output += line;
      }

      if (++this.linesSeen >= inspectedLineCount) {
        this.isFinished = true;
        break;
      }
    }

    if (this.isFinished) {
      return output + data;
    }

    if (this.couldStillBecomeWarning(data)) {
      this.pending = data;
    } else {
      output += data;
    }

    return output;
  }

  /** Flushes whatever is still held, for when the shell exits. */
  flush(): string {
    const rest = this.pending;

    this.pending = "";

    return rest;
  }

  private couldStillBecomeWarning(text: string): boolean {
    if (text === "") {
      return false;
    }

    if (/PSReadline/i.test(text)) {
      return true;
    }

    return warningStarts.some((start) => start.startsWith(text) || text.startsWith(start));
  }
}
