"use client";

import React, { useEffect, useRef, useState } from "react";

// Global scroll direction state to avoid duplicate event listeners
let currentScrollDirection: "down" | "up" = "down";
let lastScrollY = 0;
let isListenerAttached = false;

function ensureScrollDirectionListener() {
  if (typeof window === "undefined" || isListenerAttached) return;

  lastScrollY = window.scrollY;
  let ticking = false;

  const updateScrollDirection = () => {
    const scrollY = window.scrollY;
    const diff = scrollY - lastScrollY;

    // Minimum threshold of 6px to avoid micro-jitter from slight trackpad/wheel noise
    if (Math.abs(diff) >= 6) {
      currentScrollDirection = diff > 0 ? "down" : "up";
      lastScrollY = scrollY;
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    },
    { passive: true }
  );

  isListenerAttached = true;
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  staggerIndex?: number; // Automatic stagger based on index (index * 60ms)
  threshold?: number;
  direction?: "auto" | "down" | "up";
  as?: React.ElementType;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  staggerIndex,
  threshold = 0.05,
  direction = "auto",
  as: Component = "div",
}: ScrollRevealProps) {
  const domRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [motionDirection, setMotionDirection] = useState<"down" | "up">("down");

  useEffect(() => {
    ensureScrollDirectionListener();

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const currentEl = domRef.current;
    if (!currentEl) return;

    // Use IntersectionObserver with generous rootMargin and hysteresis
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Determine animation direction based on current scroll
            const dir = direction === "auto" ? currentScrollDirection : direction;
            setMotionDirection(dir);
            setIsInView(true);
          } else {
            // Generous hysteresis buffer: only reset if well outside the viewport (>= 240px)
            // to completely prevent flickering or jumpy re-renders when scrolling near section boundaries
            const bounding = entry.boundingClientRect;
            if (bounding.top > window.innerHeight + 240 || bounding.bottom < -240) {
              setIsInView(false);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: "40px 0px 40px 0px",
      }
    );

    observer.observe(currentEl);
    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [threshold, direction]);

  // Compute calculated delay: on downward initial entrance, apply stagger; on upward re-entry, 0ms for instant fluidity
  const calculatedDelay =
    motionDirection === "down"
      ? delay > 0
        ? delay
        : staggerIndex !== undefined
        ? Math.min(staggerIndex * 50, 300)
        : 0
      : 0;

  return (
    <Component
      ref={domRef}
      style={{
        transitionDelay: isInView ? `${calculatedDelay}ms` : "0ms",
      }}
      className={`scroll-reveal ${
        motionDirection === "down" ? "scroll-down" : "scroll-up"
      } ${isInView ? "in-view" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
