/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useEffect } from "react";
import { act, render } from "@testing-library/react";
import { animateWorkspace } from "./workspace-motion";
import { PageSurface } from "./page-surface";
import { DockPanel } from "./dock-panel";

describe("workspace motion lifecycle", () => {
  let animate: jest.Mock;
  let cancel: jest.Mock;
  const originalAnimate = HTMLElement.prototype.animate;

  beforeEach(() => {
    cancel = jest.fn();
    animate = jest.fn(() => ({ cancel }));
    HTMLElement.prototype.animate = animate;
    delete document.documentElement.dataset.reduceMotion;
  });

  afterEach(() => {
    HTMLElement.prototype.animate = originalAnimate;
    delete document.documentElement.dataset.reduceMotion;
    jest.useRealTimers();
  });

  it("does not animate when reduced motion is enabled", () => {
    document.documentElement.dataset.reduceMotion = "true";
    const cleanup = animateWorkspace(document.createElement("div"), [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });

    expect(animate).not.toHaveBeenCalled();
    cleanup();
  });

  it("cancels in-flight animations when reduced motion changes", async () => {
    const cleanup = animateWorkspace(document.createElement("div"), [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });

    await act(async () => {
      document.documentElement.dataset.reduceMotion = "true";
      await Promise.resolve();
    });

    expect(cancel).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("animates navigation without remounting the page or animating data refreshes", () => {
    const mount = jest.fn();
    const unmount = jest.fn();
    const Content = ({ count }: { count: number }) => {
      useEffect(() => {
        mount();

        return unmount;
      }, []);

      return <span>{count}</span>;
    };
    const result = render(<PageSurface route="/pods"><Content count={1} /></PageSurface>);

    result.rerender(<PageSurface route="/pods"><Content count={2} /></PageSurface>);
    expect(animate).toHaveBeenCalledTimes(1);

    result.rerender(<PageSurface route="/nodes"><Content count={3} /></PageSurface>);
    expect(animate).toHaveBeenCalledTimes(2);
    // Switching routes must never fade the canvas and expose the sidebar below.
    expect(animate.mock.calls[1][0]).toEqual([
      { transform: "translateY(4px)" },
      { transform: "translateY(0)" },
    ]);
    expect(animate.mock.contexts[1]).toBe(result.container.querySelector(".lens-page-content"));
    expect(result.container.querySelector(".lens-page-surface")?.getAttribute("style")).toBeNull();
    expect(mount).toHaveBeenCalledTimes(1);
    expect(unmount).not.toHaveBeenCalled();
    result.unmount();
    expect(unmount).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it("resizes a dock directly and keeps its contents mounted until the close transition completes", () => {
    jest.useFakeTimers();
    const result = render(
      <DockPanel
        open
        height={240}
        className="terminal"
        testId="dock">
        <input aria-label="terminal" />
      </DockPanel>,
    );
    const input = result.getByLabelText("terminal");

    result.rerender(
      <DockPanel
        open
        height={320}
        className="terminal"
        testId="dock">
        <input aria-label="terminal" />
      </DockPanel>,
    );
    expect(animate).toHaveBeenCalledTimes(1);
    expect(result.getByTestId("dock").style.flexBasis).toBe("320px");
    expect(result.getByLabelText("terminal")).toBe(input);

    result.rerender(
      <DockPanel
        open={false}
        height={320}
        className="terminal"
        testId="dock">
        <input aria-label="terminal" />
      </DockPanel>,
    );
    expect(result.getByTestId("dock")).toHaveAttribute("inert");
    expect(result.getByLabelText("terminal")).toBe(input);
    act(() => jest.advanceTimersByTime(260));
    expect(result.queryByTestId("dock")).toBeNull();
  });

  it("cancels pending dock removal when reopened during an exit", () => {
    jest.useFakeTimers();
    const result = render(
      <DockPanel
        open
        height={240}
        className="logs"
        testId="dock">
        logs
      </DockPanel>,
    );

    result.rerender(
      <DockPanel
        open={false}
        height={240}
        className="logs"
        testId="dock">
        logs
      </DockPanel>,
    );
    act(() => jest.advanceTimersByTime(100));
    result.rerender(
      <DockPanel
        open
        height={240}
        className="logs"
        testId="dock">
        logs
      </DockPanel>,
    );
    act(() => jest.advanceTimersByTime(300));
    expect(result.getByTestId("dock")).not.toHaveAttribute("inert");
  });
});
