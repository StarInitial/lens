/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useLayoutEffect, useRef, useState } from "react";
import type { StrictReactNode } from "@k8slens/utilities";
import { animateWorkspace, prefersReducedMotion } from "./workspace-motion";

interface DockPanelProps {
  open: boolean;
  height: number;
  className: string;
  testId: string;
  children: StrictReactNode;
}

export function DockPanel({ open, height, className, testId, children }: DockPanelProps) {
  const [present, setPresent] = useState(open);
  const ref = useRef<HTMLDivElement | null>(null);
  const extent = useRef(height);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) return;

    if (open) setPresent(true);

    const cancel = animateWorkspace(element, [
      { flexBasis: `${open ? 0 : extent.current}px`, opacity: open ? 0 : 1 },
      { flexBasis: `${open ? height : 0}px`, opacity: open ? 1 : 0 },
    ], { duration: 260, easing: "cubic-bezier(.16, 1, .3, 1)" });
    const timeout = open ? undefined : setTimeout(() => setPresent(false), prefersReducedMotion() ? 0 : 260);

    return () => {
      cancel();
      clearTimeout(timeout);
    };
    // Height changes are direct user resizing, not open/close transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useLayoutEffect(() => {
    if (open) extent.current = height;
  }, [height, open]);

  if (!open && !present) return null;

  return (
    <div
      ref={element => {
        ref.current = element;
        element?.toggleAttribute("inert", !open);
      }}
      className={`tab-content ${className}`}
      style={{ flexBasis: open ? height : 0 }}
      aria-hidden={!open}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
