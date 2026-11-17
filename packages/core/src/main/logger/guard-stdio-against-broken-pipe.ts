/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Writable } from "stream";

/**
 * Error codes that mean "the thing behind stdio is gone", rather than
 * "something is wrong with the logger".
 */
const disconnectedStdioCodes = new Set([
  "EPIPE", // the pipe reader (terminal, parent shell, redirect target) went away
  "ERR_STREAM_DESTROYED", // the stream was already torn down
  "EBADF", // no usable file descriptor, e.g. app started without a console
  "EINVAL", // invalid handle, seen on Windows for detached launches
]);

let installed = false;

/**
 * Electron's main process logs to stdout and stderr. When those stdio pipes are
 * closed underneath us - the launching terminal or parent shell exited, the app
 * was started detached, output was piped into something that went away - the next
 * write raises EPIPE, which surfaces as an uncaught exception and makes Electron
 * show a fatal "A JavaScript error occurred in the main process" dialog, over and
 * over.
 *
 * Logging must never take the application down, so once a stdio stream reports
 * that it is gone we turn it into a sink for the rest of the process' lifetime.
 */
export function guardStdioAgainstBrokenPipe(): void {
  if (installed) {
    return;
  }

  installed = true;

  for (const stream of [process.stdout, process.stderr]) {
    if (!stream) {
      continue;
    }

    stream.on("error", (error: NodeJS.ErrnoException) => {
      if (!disconnectedStdioCodes.has(error?.code ?? "")) {
        return;
      }

      // Both console.log and winston's Console transport write through this, so a
      // no-op write keeps them quiet without another failing syscall.
      (stream as Writable).write = (() => true) as Writable["write"];
    });
  }
}
