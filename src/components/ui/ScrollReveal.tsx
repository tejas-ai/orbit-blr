import React from "react";

/**
 * Render important content immediately. Previously this component hid its
 * children until IntersectionObserver and scroll-direction effects ran,
 * making navigation feel stalled on slow devices and adding many observers.
 * Keep the existing API so page layouts do not need to change.
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerIndex?: number;
  threshold?: number;
  direction?: "auto" | "down" | "up";
  as?: React.ElementType;
}

export default function ScrollReveal({
  children,
  className = "",
  as: Component = "div",
}: ScrollRevealProps) {
  return <Component className={className}>{children}</Component>;
}
