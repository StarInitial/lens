/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Clipboard helpers for the renderer process.
 *
 * Electron 44 removed the `clipboard` module from renderer processes and made the
 * main process clipboard API promise based (see the Electron 44 breaking changes
 * entry "clipboard module is no longer available in the renderer process"), so
 * renderer code can no longer call `electron.clipboard`.
 *
 * The W3C Clipboard API is used instead. `navigator.clipboard.writeText` is tried
 * first, with a deprecated `document.execCommand("copy")` fallback for the cases
 * where the async API is rejected (no focus, denied permission). There is no
 * synchronous fallback for reads, so callers of `readTextFromClipboard` must
 * handle a rejected promise.
 *
 * Keep every renderer clipboard access going through this module: when the
 * renderer gets a preload script with `contextBridge` (see the renderer security
 * track in the Electron ADR), only this module needs to change.
 */

const copyTextUsingExecCommand = (text: string): boolean => {
  const activeElement = document.activeElement as HTMLElement | null;
  const container = document.createElement("textarea");

  container.value = text;
  container.setAttribute("readonly", "");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";

  document.body.appendChild(container);

  try {
    container.select();

    return document.execCommand("copy");
  } finally {
    document.body.removeChild(container);
    activeElement?.focus();
  }
};

/**
 * Copies `text` into the system clipboard.
 *
 * @throws if neither the async Clipboard API nor the `execCommand` fallback worked
 */
export const copyTextToClipboard = async (text: string): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);

      return;
    } catch {
      // fall through to the deprecated implementation below
    }
  }

  if (!copyTextUsingExecCommand(text)) {
    throw new Error("Unable to copy text to the clipboard");
  }
};

/**
 * Reads the text contents of the system clipboard.
 *
 * @throws if the clipboard cannot be read (e.g. missing permission or no focus)
 */
export const readTextFromClipboard = async (): Promise<string> => {
  if (!navigator.clipboard?.readText) {
    throw new Error("Reading the clipboard is not available in this renderer");
  }

  return navigator.clipboard.readText();
};
