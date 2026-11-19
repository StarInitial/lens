/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useLayoutEffect, useRef } from "react";
import type { StrictReactNode } from "@k8slens/utilities";
import { animateWorkspace } from "./workspace-motion";

interface PageSurfaceProps {
  route: string;
  className?: string;
  children?: StrictReactNode;
}

export function PageSurface({ route, className = "", children }: PageSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    // Keep the canvas opaque and stationary, including during rapid navigation.
    return animateWorkspace(ref.current, [{ transform: "translateY(4px)" }, { transform: "translateY(0)" }], {
      duration: 220,
      easing: "cubic-bezier(.16, 1, .3, 1)",
    });
  }, [route]);

  return (
    <div className={`lens-page-surface ${className}`}>
      <div ref={ref} className="lens-page-content">{children}</div>
    </div>
  );
}
