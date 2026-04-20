import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  onConfirm: () => void;
  label?: string;
  variant?: 'tile' | 'row' | 'mini';
  className?: string;
}

// Two-tap confirmation: first tap arms the button, second tap confirms.
// Auto-resets after 3s or on outside click.
const RESET_MS = 3000;

export default function HoldToEndButton({
  onConfirm,
  label = 'End Call',
  variant = 'tile',
  className,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cancel on outside click
  useEffect(() => {
    if (!confirming) return;
    const handleOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        if (resetRef.current) clearTimeout(resetRef.current);
        setConfirming(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [confirming]);

  const handleClick = () => {
    if (confirming) {
      if (resetRef.current) clearTimeout(resetRef.current);
      setConfirming(false);
      onConfirm();
    } else {
      setConfirming(true);
      resetRef.current = setTimeout(() => setConfirming(false), RESET_MS);
    }
  };

  // ── Tile variant ──────────────────────────────────────────────────────────
  if (variant === 'tile') {
    return (
      <button
        ref={buttonRef}
        onClick={handleClick}
        title={confirming ? 'Tap again to confirm' : label}
        className={cn(
          'flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg select-none transition-all',
          confirming
            ? 'bg-red-700 ring-2 ring-red-400 ring-offset-1 animate-pulse'
            : 'bg-red-600 hover:bg-red-700',
          className
        )}
      >
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
        </svg>
        <span className="text-[11px] font-semibold leading-none text-white">
          {confirming ? 'Confirm?' : label}
        </span>
      </button>
    );
  }

  // ── Row variant ───────────────────────────────────────────────────────────
  if (variant === 'row') {
    return (
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={cn(
          'relative flex items-center justify-center gap-1.5 px-3 h-11 text-xs font-semibold rounded-lg select-none transition-all',
          confirming
            ? 'bg-red-600 text-white border border-red-600'
            : 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
          className
        )}
      >
        {confirming ? 'Tap to confirm' : label}
      </button>
    );
  }

  // ── Mini variant ──────────────────────────────────────────────────────────
  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      title={confirming ? 'Tap again to confirm' : label}
      className={cn(
        'w-9 h-9 rounded-lg select-none transition-all flex items-center justify-center flex-shrink-0 border',
        confirming
          ? 'bg-red-700 border-red-700 ring-2 ring-red-400 ring-offset-1'
          : 'bg-red-600 border-red-500 hover:bg-red-700',
        className
      )}
    >
      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
      </svg>
    </button>
  );
}
