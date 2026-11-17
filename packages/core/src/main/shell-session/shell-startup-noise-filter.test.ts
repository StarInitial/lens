/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ShellStartupNoiseFilter } from "./shell-startup-noise-filter";

const chineseWarning = "无法加载 PSReadline 模块。控制台在未使用 PSReadline 的情况下运行。\r\n";
const englishWarning = "Unable to load PSReadline module. Console will be run without PSReadline.\r\n";

const feed = (filter: ShellStartupNoiseFilter, chunks: string[]) => chunks
  .map((chunk) => filter.push(chunk))
  .join("");

describe("filtering the PSReadLine startup warning", () => {
  it("drops the Chinese warning and keeps the prompt", () => {
    const filter = new ShellStartupNoiseFilter();

    expect(feed(filter, [`${chineseWarning}PS C:\\Users\\Administrator> `])).toBe("PS C:\\Users\\Administrator> ");
  });

  it("drops the English warning", () => {
    const filter = new ShellStartupNoiseFilter();

    expect(feed(filter, [`${englishWarning}PS C:\\> `])).toBe("PS C:\\> ");
  });

  it("drops the warning when it arrives split across chunks", () => {
    const filter = new ShellStartupNoiseFilter();
    const chunks = [
      chineseWarning.slice(0, 4),
      chineseWarning.slice(4, 20),
      chineseWarning.slice(20, 45),
      chineseWarning.slice(45) + "PS C:\\> ",
    ];

    expect(feed(filter, chunks)).toBe("PS C:\\> ");
  });

  it("keeps the window title escape sequence that precedes the prompt", () => {
    const filter = new ShellStartupNoiseFilter();
    const title = "\u001b]0;Administrator:  \u0007";

    expect(feed(filter, [title, `${chineseWarning}PS C:\\> `])).toBe(`${title}PS C:\\> `);
  });

  it("splits chunks mid way through the title escape", () => {
    const filter = new ShellStartupNoiseFilter();
    const title = "\u001b]0;Administrator:  \u0007";

    expect(feed(filter, [title.slice(0, 6), title.slice(6), `${chineseWarning}PS C:\\> `])).toBe(`${title}PS C:\\> `);
  });

  it("passes ordinary output through unchanged", () => {
    const filter = new ShellStartupNoiseFilter();

    expect(feed(filter, ["hello\r\n", "world\r\n"])).toBe("hello\r\nworld\r\n");
  });

  it("keeps a prompt that has no trailing newline", () => {
    const filter = new ShellStartupNoiseFilter();

    expect(feed(filter, [`${chineseWarning}PS C:\\Users\\Administrator> `])).toBe("PS C:\\Users\\Administrator> ");
    expect(feed(filter, ["echo hi\r\n"])).toBe("echo hi\r\n");
  });

  it("stops inspecting after the startup lines so later output is never held back", () => {
    const filter = new ShellStartupNoiseFilter();
    const banner = Array.from({ length: 10 }, (_, index) => `line-${index}\r\n`).join("");

    expect(feed(filter, [banner])).toBe(banner);
  });

  it("flushes held output when the shell exits", () => {
    const filter = new ShellStartupNoiseFilter();

    filter.push("无法加载");

    expect(filter.flush()).toBe("无法加载");
  });
});
