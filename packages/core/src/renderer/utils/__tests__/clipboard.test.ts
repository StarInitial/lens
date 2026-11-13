/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { copyTextToClipboard, readTextFromClipboard } from "../clipboard";

const writeTextMock = jest.fn();
const readTextMock = jest.fn();

describe("renderer/utils/clipboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextMock,
        readText: readTextMock,
      },
    });

    document.execCommand = jest.fn(() => true);
  });

  describe("given the async clipboard api works", () => {
    beforeEach(() => {
      writeTextMock.mockResolvedValue(undefined);
    });

    it("copies through navigator.clipboard", async () => {
      await copyTextToClipboard("some text");

      expect(writeTextMock).toHaveBeenCalledWith("some text");
      expect(document.execCommand).not.toHaveBeenCalled();
    });

    it("reads through navigator.clipboard", async () => {
      readTextMock.mockResolvedValue("some text");

      expect(await readTextFromClipboard()).toBe("some text");
    });
  });

  describe("given the async clipboard api is rejected", () => {
    beforeEach(() => {
      writeTextMock.mockRejectedValue(new Error("no permission"));
    });

    it("falls back to document.execCommand", async () => {
      await copyTextToClipboard("some text");

      expect(document.execCommand).toHaveBeenCalledWith("copy");
    });

    it("throws when the fallback fails as well", async () => {
      (document.execCommand as jest.Mock).mockReturnValue(false);

      await expect(copyTextToClipboard("some text")).rejects.toThrow("Unable to copy text to the clipboard");
    });

    it("rejects when reading is not possible", async () => {
      readTextMock.mockRejectedValue(new Error("no permission"));

      await expect(readTextFromClipboard()).rejects.toThrow("no permission");
    });
  });

  describe("given the renderer has no async clipboard api", () => {
    beforeEach(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      });
    });

    it("copies through document.execCommand", async () => {
      await copyTextToClipboard("some text");

      expect(document.execCommand).toHaveBeenCalledWith("copy");
    });

    it("rejects when reading", async () => {
      await expect(readTextFromClipboard()).rejects.toThrow("Reading the clipboard is not available");
    });
  });
});
