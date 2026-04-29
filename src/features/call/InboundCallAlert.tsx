import { useEffect, useState } from 'react';
import type { Thread } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  call: Thread;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const TIER_LABEL: Record<string, string> = {
  gold: 'Gold',
  premium: 'Premium',
  standard: 'Standard',
};

// Pulse ring animation ticks to draw the eye
function RingPulse() {
  return (
    <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
      <span className="absolute w-12 h-12 rounded-full bg-green-100 animate-ping opacity-60" />
      <span className="absolute w-10 h-10 rounded-full bg-green-200 animate-ping opacity-40" style={{ animationDelay: '0.15s' }} />
      <div className="relative w-9 h-9 rounded-full bg-green-600 flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
        </svg>
      </div>
    </div>
  );
}

export default function InboundCallAlert({ call, onAccept, onReject }: Props) {
  // Auto-reject after 30 seconds (simulates ring timeout)
  const [countdown, setCountdown] = useState(30);
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(c => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [call.id]);

  useEffect(() => {
    if (countdown === 0) onReject(call.id);
  }, [countdown, call.id, onReject]);

  const tier = call.accountTier ? TIER_LABEL[call.accountTier] : null;

  return (
    // Full overlay — darkens everything behind it
    <div className="absolute inset-0 z-50 bg-black/50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl px-5 pt-5 pb-7 shadow-2xl">

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <RingPulse />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-0.5">
              Inbound Call · {countdown}s
            </p>
            <p className="text-[17px] font-bold text-gray-900 leading-tight truncate">
              {call.participantName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {call.caseId && (
                <span className="text-[11px] font-mono text-gray-400">{call.caseId}</span>
              )}
              {call.issueTag && (
                <>
                  {call.caseId && <span className="text-gray-300 text-[10px]">·</span>}
                  <span className="text-[11px] text-gray-500">{call.issueTag}</span>
                </>
              )}
              {tier && (
                <>
                  <span className="text-gray-300 text-[10px]">·</span>
                  <span className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none',
                    call.accountTier === 'gold' ? 'bg-amber-100 text-amber-800' :
                    call.accountTier === 'premium' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  )}>
                    {tier}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Countdown bar */}
        <div className="h-0.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / 30) * 100}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onReject(call.id)}
            className="flex-1 h-12 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => onAccept(call.id)}
            className="flex-[2] h-12 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
