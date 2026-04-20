import { useRef, useState } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  onConfirm: () => void;
  label?: string;
  /** visual size variant */
  variant?: 'tile' | 'row' | 'mini';
  className?: string;
}

const HOLD_MS = 1400;

export default function HoldToEndButton({
  onConfirm,
  label = 'End Call',
  variant = 'tile',
  className,
}: Props) {
  const [progress, setProgress] = useState(0); // 0–100
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    firedRef.current = false;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - (startRef.current ?? now);
      const pct = Math.min((elapsed / HOLD_MS) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        if (!firedRef.current) {
          firedRef.current = true;
          onConfirm();
        }
        setProgress(0);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setProgress(0);
  };

  const isHolding = progress > 0;

  // ── Tile variant (CallControls — tall square-ish button) ──────────────────
  if (variant === 'tile') {
    return (
      <button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          'relative flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg overflow-hidden select-none transition-colors',
          isHolding ? 'bg-red-700' : 'bg-red-600 hover:bg-red-700',
          className
        )}
      >
        {/* Fill sweep */}
        <div
          className="absolute inset-0 bg-white/20 origin-left"
          style={{ transform: `scaleX(${progress / 100})`, transformOrigin: 'left' }}
        />
        {/* Icon */}
        <svg className="relative z-10 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
        </svg>
        <span className="relative z-10 text-[11px] font-medium leading-none text-white">
          {isHolding ? 'Hold…' : label}
        </span>
      </button>
    );
  }

  // ── Row variant (CallSection — full-width wide button) ────────────────────
  if (variant === 'row') {
    return (
      <button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onContextMenu={(e) => e.preventDefault()}
        className={cn(
          'relative flex items-center justify-center gap-1.5 px-3 h-11 text-xs font-semibold rounded-lg overflow-hidden select-none transition-colors',
          isHolding ? 'bg-red-50 text-red-700 border border-red-300' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
          className
        )}
      >
        <div
          className="absolute inset-0 bg-red-100 origin-left"
          style={{ transform: `scaleX(${progress / 100})`, transformOrigin: 'left' }}
        />
        <span className="relative z-10">{isHolding ? 'Hold…' : label}</span>
      </button>
    );
  }

  // ── Mini variant (MiniCallBar — small round button) ───────────────────────
  return (
    <button
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
      onContextMenu={(e) => e.preventDefault()}
      title={label}
      className={cn(
        'relative w-10 h-10 rounded-full overflow-hidden select-none transition-colors flex items-center justify-center flex-shrink-0',
        isHolding ? 'bg-red-400' : 'bg-red-500 hover:bg-red-400',
        className
      )}
    >
      <div
        className="absolute inset-0 bg-white/30 origin-left"
        style={{ transform: `scaleX(${progress / 100})`, transformOrigin: 'left' }}
      />
      <svg className="relative z-10 w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
      </svg>
    </button>
  );
}
