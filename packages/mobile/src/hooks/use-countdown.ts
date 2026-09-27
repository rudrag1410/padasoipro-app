import { useEffect, useState } from 'react';

const secondsUntil = (target: number | null) => (target === null ? 0 : Math.max(0, Math.ceil((target - Date.now()) / 1000)));

/** Seconds left until `targetIso`, ticking once a second. 0 when unset or passed. */
export function useCountdown(targetIso: string | null | undefined): number {
  const target = targetIso ? new Date(targetIso).getTime() : null;
  const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(target));

  useEffect(() => {
    setSecondsLeft(secondsUntil(target));
    if (target === null) return;

    const interval = setInterval(() => {
      const next = secondsUntil(target);
      setSecondsLeft(next);
      if (next === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return secondsLeft;
}
