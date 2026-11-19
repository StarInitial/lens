/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export function prefersReducedMotion() {
  return document.documentElement.dataset.reduceMotion === "true"
    || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

// All imperative animations share the same cancellation policy as CSS motion.
export function animateWorkspace(element: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions) {
  if (prefersReducedMotion() || typeof element.animate !== "function") {
    return () => {};
  }

  const animation = element.animate(frames, options);
  const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const cancelIfReduced = () => {
    if (prefersReducedMotion()) {
      animation.cancel();
    }
  };
  const observer = new MutationObserver(cancelIfReduced);
  const cleanup = () => {
    observer.disconnect();
    media?.removeEventListener?.("change", cancelIfReduced);
  };

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-reduce-motion"] });
  media?.addEventListener?.("change", cancelIfReduced);
  animation.onfinish = cleanup;
  animation.oncancel = cleanup;

  return () => {
    cleanup();
    animation.cancel();
  };
}

// Analytic damped spring: stiffness 380, damping 32, mass 1.
export function navigationSpring(time: number) {
  const frequency = Math.sqrt(380 - 16 * 16);

  return 1 - Math.exp(-16 * time) * (Math.cos(frequency * time) + 16 / frequency * Math.sin(frequency * time));
}
