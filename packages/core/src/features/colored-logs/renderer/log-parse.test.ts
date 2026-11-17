/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { colorizeLogLine } from "./log-parse";
import { buildLogPalette } from "./log-colors";
import type { LensTheme } from "../../../renderer/themes/lens-theme";

const palette = buildLogPalette(undefined as unknown as LensTheme);

const textOf = (line: string) => colorizeLogLine(line, palette).parts.map(([text]) => text).join("");

describe("colored log lines", () => {
  it("recognises a Spring Boot / logback line", () => {
    const parsed = colorizeLogLine(
      "2024-05-01 10:00:00.123 ERROR 4242 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet] : Servlet.service() threw exception",
      palette,
    );

    expect(parsed.level).toBe("ERROR");
    expect(textOf(
      "2024-05-01 10:00:00.123 ERROR 4242 --- [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet] : Servlet.service() threw exception",
    )).toContain("Servlet.service() threw exception");
  });

  it("recognises a JSON log line", () => {
    const parsed = colorizeLogLine(
      JSON.stringify({ level: "warn", timestamp: "2024-05-01T10:00:00Z", logger: "com.acme.Service", message: "slow query" }),
      palette,
    );

    expect(parsed.level).toBe("WARN");
    expect(textOf(JSON.stringify({ level: "warn", timestamp: "2024-05-01T10:00:00Z", logger: "com.acme.Service", message: "slow query" })))
      .toContain("slow query");
  });

  it("recognises a klog line from Kubernetes components", () => {
    const parsed = colorizeLogLine("E0501 10:00:00.123456       1 controller.go:42] failed to sync", palette);

    expect(parsed.level).toBe("ERROR");
  });

  it("reads the HTTP status of an access log line", () => {
    expect(colorizeLogLine('10.0.0.1 - - "GET /health HTTP/1.1" 500 12', palette).level).toBe("ERROR");
    expect(colorizeLogLine('10.0.0.1 - - "GET /health HTTP/1.1" 404 12', palette).level).toBe("WARN");
    expect(colorizeLogLine('10.0.0.1 - - "GET /health HTTP/1.1" 200 12', palette).level).toBe("INFO");
  });

  it("marks stack trace lines as continuations carrying no level of their own", () => {
    const parsed = colorizeLogLine("\tat com.acme.Service.run(Service.java:42)", palette);

    expect(parsed.level).toBeNull();
    expect(parsed.continuation).toBe(true);
  });

  it("keeps lines it does not understand readable", () => {
    expect(textOf("plain text without any level")).toBe("plain text without any level");
  });

  it("drops ANSI colour codes", () => {
    expect(textOf("\u001b[31mERROR\u001b[0m boom")).toContain("ERROR");
  });
});
