import { useEffect, useRef, useState } from 'react';

export function useWrapUpTimer(
  active: boolean,
  duration = 30,
  onComplete?: () => void
): number {
  const [remaining, setRemaining] = useState(duration);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      setRemaining(duration);
      return;
    }
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          onCompleteRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, duration]);

  return remaining;
}
