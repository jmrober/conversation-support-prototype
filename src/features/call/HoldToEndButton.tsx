import { useState, useRef } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  onConfirm: () => void;
  label?: string;
  variant?: 'tile' | 'row' | 'mini';
  className?: string;
}

const HOLD_MS = 3000;

export default function HoldToEndButton({
  onConfirm,
  label = 'End Call',
  variant = 'tile',
  className,
}: Props) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, HOLD_MS);
  };

  const cancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHolding(false);
  };

  const sharedPointerProps = {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
  };

  // ── Tile variant ────────────────────────────────────────────────────────────
  if (variant === 'tile') {
    return (
      <button
        {...sharedPointerProps}
        title={label}
        className={cn(
          'relative flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg select-none overflow-hidden bg-red-600 hover:bg-red-700 transition-colors',
          className
        )}
      >
        {holding && (
          <div className="animate-hold-fill absolute inset-y-0 left-0 bg-red-800 pointer-events-none" />
        )}
        <svg className="relative w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
        </svg>
        <span className="relative text-[11px] font-semibold leading-none text-white">
          {holding ? 'Hold…' : label}
        </span>
      </button>
    );
  }

  // ── Row variant ─────────────────────────────────────────────────────────────
  if (variant === 'row') {
    return (
      <button
        {...sharedPointerProps}
        className={cn(
          'relative flex items-center justify-center gap-1.5 px-3 h-11 text-xs font-semibold rounded-lg select-none overflow-hidden',
          holding
            ? 'bg-red-600 text-white border border-red-600'
            : 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
          className
        )}
      >
        {holding && (
          <div className="animate-hold-fill absolute inset-y-0 left-0 bg-red-700 pointer-events-none" />
        )}
        <span className="relative">{holding ? 'Hold…' : label}</span>
      </button>
    );
  }

  // ── Mini variant ────────────────────────────────────────────────────────────
  return (
    <button
      {...sharedPointerProps}
      title={label}
      className={cn(
        'relative w-9 h-9 rounded-lg select-none overflow-hidden flex items-center justify-center flex-shrink-0 border bg-red-600 border-red-500 hover:bg-red-700',
        className
      )}
    >
      {holding && (
        <div className="animate-hold-fill absolute inset-y-0 left-0 bg-red-800 pointer-events-none" />
      )}
      <svg className="relative w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
      </svg>
    </button>
  );
}
