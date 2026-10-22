"use client";

import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

/** Counts down to a verified event start. Never implies that registration is still open. */
export default function EventCountdown({
  startAt,
  endAt,
  prominent = false,
}: {
  startAt: string;
  endAt?: string | null;
  prominent?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, prominent ? 1000 : 60_000);
    return () => window.clearInterval(timer);
  }, [prominent]);

  if (now === null) {
    return <span aria-hidden="true" className="text-xs text-slate-400">Starts soon</span>;
  }

  const start = new Date(startAt).getTime();
  const end = endAt ? new Date(endAt).getTime() : start;
  if (!Number.isFinite(start)) return null;

  if (now >= end) return null;
  const live = now >= start;
  const seconds = Math.max(0, Math.floor((start - now) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  const timer = days > 0
    ? `${days}d ${pad(hours)}h ${pad(minutes)}m`
    : prominent
      ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
      : `${hours}h ${pad(minutes)}m`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tabular-nums ${prominent ? "text-sm sm:text-base" : "text-[11px]"} text-violet-700 dark:text-violet-300`}
      aria-label={live ? "Event happening now" : `Event starts in ${days} days, ${hours} hours and ${minutes} minutes`}
      aria-live="off"
    >
      <Clock3 className={prominent ? "h-4 w-4" : "h-3 w-3"} aria-hidden="true" />
      {live ? "Happening now" : <>Starts in <span>{timer}</span></>}
      {prominent && !live && <span className="text-[10px] font-normal opacity-65">to event start · IST</span>}
    </span>
  );
}
