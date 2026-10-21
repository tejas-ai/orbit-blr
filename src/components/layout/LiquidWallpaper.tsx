"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Owner-provided liquid-cobalt photographs + light-flow video loops.
 * Static photography is the default; motion is opt-in only for devices
 * that allow animation, have no data-saver and are currently visible.
 */
export default function LiquidWallpaper() {
  const [animate, setAnimate] = useState(false);
  const primaryRef = useRef<HTMLVideoElement>(null);
  const secondaryRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const canAnimate = () => !motion.matches && !connection?.saveData;
    const sync = () => {
      const enabled = canAnimate() && !document.hidden;
      setAnimate(enabled);
      if (!enabled) {
        primaryRef.current?.pause();
        secondaryRef.current?.pause();
      }
    };
    sync();
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (!animate) return;
    // play() may be blocked by the browser. The static photos always render.
    void primaryRef.current?.play().catch(() => {});
    void secondaryRef.current?.play().catch(() => {});
  }, [animate]);

  return (
    <div className="orbit-liquid-wallpaper" aria-hidden="true">
      <div className="orbit-liquid-wallpaper__panel orbit-liquid-wallpaper__panel--left">
        {animate && (
          <video
            ref={primaryRef}
            className="orbit-liquid-wallpaper__video"
            src="/wallpapers/aurora-violet.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
          />
        )}
      </div>
      <div className="orbit-liquid-wallpaper__panel orbit-liquid-wallpaper__panel--right">
        {animate && (
          <video
            ref={secondaryRef}
            className="orbit-liquid-wallpaper__video"
            src="/wallpapers/neon-spectra.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            disablePictureInPicture
          />
        )}
      </div>
      <div className="orbit-liquid-wallpaper__veil" />
    </div>
  );
}
