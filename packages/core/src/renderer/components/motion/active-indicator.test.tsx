/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { act, render } from "@testing-library/react";
import { ActiveIndicator } from "./active-indicator";

describe("navigation selection motion", () => {
  const originalAnimate = HTMLElement.prototype.animate;
  const originalResizeObserver = window.ResizeObserver;
  let animate: jest.Mock;
  let cancel: jest.Mock;
  let resize: () => void;
  let secondTop: number;
  let indicatorTop: number;

  const Navigation = ({ active }: { active: string }) => (
    <nav data-testid="navigation">
      <ActiveIndicator selector='[data-nav-active="true"]' />
      <a data-testid="first" data-nav-active={active === "first"}>First</a>
      <a data-testid="second" data-nav-active={active === "second"}>Second</a>
    </nav>
  );

  beforeEach(() => {
    secondTop = 100;
    indicatorTop = 40;
    cancel = jest.fn();
    animate = jest.fn(() => ({ cancel }));
    HTMLElement.prototype.animate = animate;
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      value: jest.fn((callback: () => void) => {
        resize = callback;

        return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
      }),
    });
    jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      callback(0);

      return 1;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const top = this.tagName === "NAV" ? 20
        : this.classList.contains("lens-active-indicator") ? indicatorTop
          : this.dataset.testid === "second" ? secondTop : 40;
      const left = this.tagName === "NAV" ? 10 : 22;

      return { x: left, y: top, left, top, right: left + 200, bottom: top + 34, width: 200, height: 34 } as DOMRect;
    });
  });

  afterEach(() => {
    HTMLElement.prototype.animate = originalAnimate;
    Object.defineProperty(window, "ResizeObserver", { configurable: true, value: originalResizeObserver });
    jest.restoreAllMocks();
  });

  it("starts a new selection transition from the currently visible pill during rapid clicks", async () => {
    const result = render(<Navigation active="first" />);

    await act(async () => { result.rerender(<Navigation active="second" />); });
    expect(animate).toHaveBeenCalledTimes(1);
    indicatorTop = 65;
    await act(async () => { result.rerender(<Navigation active="first" />); });

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(animate.mock.calls[1][0][0].transform).toBe("translate(12px, 45px)");
    expect(animate.mock.calls[1][0][30].transform).toBe("translate(12px, 20px)");
  });

  it("follows the same selected row during group expansion without a second trailing animation", () => {
    const result = render(<Navigation active="second" />);
    const indicator = result.container.querySelector<HTMLElement>(".lens-active-indicator");

    secondTop = 160;
    act(() => resize());

    expect(indicator?.style.transform).toBe("translate(12px, 140px)");
    expect(animate).not.toHaveBeenCalled();
  });

  it("keeps the pill aligned in the scrollable navigation coordinate space", () => {
    const result = render(<Navigation active="second" />);

    result.getByTestId("navigation").scrollTop = 60;
    secondTop = 40;
    act(() => resize());

    expect(result.container.querySelector<HTMLElement>(".lens-active-indicator")?.style.transform).toBe("translate(12px, 80px)");
    expect(animate).not.toHaveBeenCalled();
  });
});
