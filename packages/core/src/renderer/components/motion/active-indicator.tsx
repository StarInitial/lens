/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useLayoutEffect, useRef } from "react";
import { animateWorkspace, navigationSpring } from "./workspace-motion";

interface ActiveIndicatorProps {
  selector: string;
  line?: boolean;
}

/** A single moving highlight per navigation surface; never moves the hit targets. */
export function ActiveIndicator({ selector, line = false }: ActiveIndicatorProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const indicator = ref.current;
    const container = indicator?.parentElement;

    if (!indicator || !container) return;

    let cancel = () => {};
    let previous = "";
    let visible = false;
    let previousTarget: HTMLElement | undefined;
    let frame = 0;
    const update = () => {
      const target = Array.from(container.querySelectorAll<HTMLElement>(selector))
        .find(item => !item.closest('[aria-hidden="true"]') && item.getBoundingClientRect().height > 0);

      if (!target) {
        cancel();
        indicator.style.opacity = "0";
        visible = false;
        previous = "";
        previousTarget = undefined;

        return;
      }

      const bounds = container.getBoundingClientRect();
      const next = target.getBoundingClientRect();
      const x = next.left - bounds.left + container.scrollLeft - container.clientLeft;
      const y = next.top - bounds.top + container.scrollTop - container.clientTop + (line ? next.height - 2 : 0);
      const width = next.width;
      const height = line ? 2 : next.height;
      const key = [x, y, width, height].join(",");
      const selectionChanged = previousTarget !== target;

      previousTarget = target;

      if (key === previous) return;

      const current = indicator.getBoundingClientRect();
      const fromX = current.left - bounds.left + container.scrollLeft - container.clientLeft;
      const fromY = current.top - bounds.top + container.scrollTop - container.clientTop;

      cancel();
      Object.assign(indicator.style, {
        opacity: "1",
        transform: `translate(${x}px, ${y}px)`,
        width: `${width}px`,
        height: `${height}px`,
      });

      // Layout motion (group expansion, resizing) already moves the target.
      // Follow it directly; only a change of selection needs another spring.
      if (visible && selectionChanged) {
        const frames = Array.from({ length: 31 }, (_, index) => {
          const progress = index === 30 ? 1 : navigationSpring(index / 60);
          const interpolate = (start: number, end: number) => start + (end - start) * progress;

          return {
            transform: `translate(${interpolate(fromX, x)}px, ${interpolate(fromY, y)}px)`,
            width: `${interpolate(current.width, width)}px`,
            height: `${interpolate(current.height, height)}px`,
          };
        });

        cancel = animateWorkspace(indicator, frames, { duration: 500, easing: "linear" });
      }

      previous = key;
      visible = true;
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const resize = typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : undefined;
    const observedChildren = new Set<Element>();
    const observeChildren = () => {
      const children = new Set(Array.from(container.children).filter(child => child !== indicator));

      for (const child of observedChildren) {
        if (!children.has(child)) {
          resize?.unobserve(child);
          observedChildren.delete(child);
        }
      }

      for (const child of children) {
        if (!observedChildren.has(child)) {
          resize?.observe(child);
          observedChildren.add(child);
        }
      }
    };
    const mutations = new MutationObserver(() => {
      observeChildren();
      schedule();
    });

    mutations.observe(container, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "aria-hidden", "data-nav-active"] });
    resize?.observe(container);
    observeChildren();
    container.addEventListener("transitionend", schedule);
    window.addEventListener("resize", schedule);
    update();

    return () => {
      cancel();
      cancelAnimationFrame(frame);
      mutations.disconnect();
      resize?.disconnect();
      container.removeEventListener("transitionend", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [selector, line]);

  return (
    <span
      ref={ref}
      className={`lens-active-indicator${line ? " line" : ""}`}
      aria-hidden="true" />
  );
}
