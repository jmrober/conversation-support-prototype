import { useState } from 'react';
import type { PresenceStatus } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  presence: PresenceStatus;
  onChange: (p: PresenceStatus) => void;
  wrapUpSecondsLeft?: number; // defined only while wrap-up timer is running
}

const OPTIONS: { value: PresenceStatus; label: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'busy', label: 'Busy' },
  { value: 'wrap-up', label: 'Wrap-Up' },
  { value: 'break', label: 'Break' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'away', label: 'Away' },
  { value: 'offline', label: 'Offline' },
];

const DOT: Record<PresenceStatus, string> = {
  available: 'bg-emerald-500',
  busy: 'bg-slate-500',
  'wrap-up': 'bg-yellow-400',
  break: 'bg-slate-400',
  lunch: 'bg-slate-400',
  away: 'bg-gray-400',
  offline: 'bg-gray-300',
};

const LABEL_COLOR: Record<PresenceStatus, string> = {
  available: 'text-emerald-700',
  busy: 'text-slate-700',
  'wrap-up': 'text-yellow-700',
  break: 'text-slate-600',
  lunch: 'text-slate-600',
  away: 'text-gray-500',
  offline: 'text-gray-400',
};

export default function PresenceControl({ presence, onChange, wrapUpSecondsLeft }: Props) {
  const [open, setOpen] = useState(false);
  const isWrapUp = presence === 'wrap-up' && wrapUpSecondsLeft !== undefined;
  const label = OPTIONS.find((o) => o.value === presence)?.label ?? presence;

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 border-b transition-colors',
          isWrapUp ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'
        )}
      >
        {/* Agent identity */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
              JR
            </div>
            {/* Availability dot on avatar */}
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                DOT[presence],
                isWrapUp && 'animate-pulse'
              )}
            />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-800 leading-tight truncate">
              Jordan Riley
            </div>
            {isWrapUp && (
              <div className="text-[10px] text-yellow-700 font-medium leading-tight">
                Not accepting new contacts
              </div>
            )}
          </div>
        </div>

        {/* Status button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-colors flex-shrink-0',
            isWrapUp
              ? 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
              : 'hover:bg-gray-100 text-gray-600'
          )}
        >
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', DOT[presence], isWrapUp && 'animate-pulse')} />
          <span className={cn('font-semibold', LABEL_COLOR[presence])}>
            {isWrapUp ? `Wrap-Up · ${wrapUpSecondsLeft}s` : label}
          </span>
          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-2 top-11 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
            {isWrapUp && (
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-[10px] text-gray-400 leading-snug">
                  Selecting any status will end wrap-up early.
                </p>
              </div>
            )}
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors',
                  presence === opt.value ? 'bg-gray-50 font-semibold' : ''
                )}
              >
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', DOT[opt.value])} />
                <span className={cn('flex-1 text-left', LABEL_COLOR[opt.value])}>{opt.label}</span>
                {opt.value === 'available' && (
                  <span className="text-[9px] text-emerald-700 font-medium">Accepting</span>
                )}
                {opt.value === 'wrap-up' && (
                  <span className="text-[9px] text-yellow-700 font-medium">30s timer</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
