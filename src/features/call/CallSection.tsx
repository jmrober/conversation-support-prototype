import { useState, useRef } from 'react';
import type { Thread } from '../../types';
import { useCallTimer, formatDuration } from '../../hooks/useCallTimer';
import { cn } from '../../utils/cn';
import HoldToEndButton from './HoldToEndButton';

interface Props {
  customerCall: Thread | null;
  consultCall: Thread | null;
  muted: boolean;
  onMuteToggle: () => void;
  onHoldToggle: (id: string) => void;
  onEndCall: (id: string) => void;
  onWarmTransfer: () => void;
  onOpenDirectory: () => void;
  onSelectCall: (id: string) => void;
}

function LiveTimer({ thread }: { thread: Thread }) {
  const elapsed = useCallTimer(
    thread.status === 'active' ? thread.callStartedAt : undefined
  );
  return <span className="text-sm font-bold tabular-nums">{formatDuration(elapsed)}</span>;
}

export default function CallSection({
  customerCall,
  consultCall,
  muted,
  onMuteToggle,
  onHoldToggle,
  onEndCall,
  onWarmTransfer,
  onOpenDirectory,
  onSelectCall,
}: Props) {
  const [confirmWarm, setConfirmWarm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!customerCall && !consultCall) return null;

  const isConsulting = !!consultCall;
  const customerIsOnHold = customerCall?.status === 'consulting' || customerCall?.status === 'on-hold';

  function triggerFeedback(msg: string, ms = 1500) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback(msg);
    feedbackTimer.current = setTimeout(() => setFeedback(''), ms);
  }

  return (
    <div className="flex-shrink-0 border-b-2 border-gray-200">

      {/* Feedback bar */}
      {feedback && (
        <div className="bg-gray-900 text-white text-[11px] font-medium text-center py-1.5 px-4">
          {feedback}
        </div>
      )}

      {/* Customer call card — compact when consulting, full otherwise */}
      {customerCall && (
        isConsulting ? (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-100">
            <button
              onClick={() => onSelectCall(customerCall.id)}
              className="flex-1 text-left min-w-0"
            >
              <span className="text-[13px] font-semibold text-gray-700 truncate block leading-tight">
                {customerCall.participantName}
              </span>
              <span className="text-[11px] text-gray-500">Customer · On Hold</span>
            </button>
            <LiveTimer thread={customerCall} />
            <button
              onClick={() => {
                onHoldToggle(customerCall.id);
                triggerFeedback('Call resumed');
              }}
              className="flex items-center justify-center gap-1.5 px-3 h-8 text-xs font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors flex-shrink-0"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Resume
            </button>
          </div>
        ) : (
          <div className={cn(
            'px-5 py-4',
            customerIsOnHold ? 'bg-slate-50' : 'bg-blue-50'
          )}>
            {/* Status + timer row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  customerIsOnHold ? 'bg-slate-400' : 'bg-blue-500 animate-pulse'
                )} />
                <span className={cn(
                  'text-[11px] font-semibold uppercase tracking-widest',
                  customerIsOnHold ? 'text-slate-600' : 'text-blue-800'
                )}>
                  {customerIsOnHold ? 'Customer · On Hold' : 'Live Call'}
                </span>
              </div>
              {!customerIsOnHold && (
                <span className={cn('text-sm font-bold tabular-nums', 'text-blue-900')}>
                  <LiveTimer thread={customerCall} />
                </span>
              )}
            </div>

            {/* Name + case */}
            <button
              onClick={() => onSelectCall(customerCall.id)}
              className="text-left mb-3 group w-full"
            >
              <div className="text-[15px] font-semibold text-gray-900 group-hover:text-green-800 transition-colors leading-tight">
                {customerCall.participantName}
              </div>
              {customerCall.caseId && (
                <div className="text-[11px] font-mono text-gray-400 mt-0.5">{customerCall.caseId}</div>
              )}
            </button>

            {/* Controls */}
            {customerIsOnHold ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onHoldToggle(customerCall.id);
                    triggerFeedback('Call resumed');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resume
                </button>
                <HoldToEndButton
                  onConfirm={() => onEndCall(customerCall.id)}
                  label="End Call"
                  variant="row"
                />
              </div>
            ) : (
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    onHoldToggle(customerCall.id);
                    triggerFeedback('On Hold');
                  }}
                  title="Hold"
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 h-11 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                  <span className="text-[11px] font-medium">Hold</span>
                </button>
                <button
                  onClick={() => {
                    onMuteToggle();
                    triggerFeedback(muted ? 'Mic on' : 'Muted');
                  }}
                  title={muted ? 'Unmute' : 'Mute'}
                  className={cn(
                    'flex-1 flex flex-col items-center justify-center gap-0.5 h-11 rounded-lg border transition-colors',
                    muted
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {muted ? (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                      </>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                  </svg>
                  <span className="text-[11px] font-medium">{muted ? 'Unmute' : 'Mute'}</span>
                </button>
                <button
                  onClick={onOpenDirectory}
                  title="Directory"
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 h-11 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[11px] font-medium">Transfer</span>
                </button>
                <HoldToEndButton
                  onConfirm={() => onEndCall(customerCall.id)}
                  label="End Call"
                  variant="tile"
                />
              </div>
            )}
          </div>
        )
      )}

      {/* Consult call card — only during warm transfer */}
      {consultCall && (
        <>
          <div className="h-px bg-gray-200" />
          <div className="px-5 py-4 bg-slate-50">
            {/* Status + timer */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse flex-shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-700">
                  Consulting
                </span>
              </div>
              <span className="text-sm font-bold tabular-nums text-slate-700">
                <LiveTimer thread={consultCall} />
              </span>
            </div>

            {/* Name */}
            <button
              onClick={() => onSelectCall(consultCall.id)}
              className="text-left mb-3 group w-full"
            >
              <div className="text-[15px] font-semibold text-gray-900 group-hover:text-violet-800 transition-colors leading-tight">
                {consultCall.participantName}
              </div>
              {consultCall.participantRole && (
                <div className="text-xs text-gray-400 mt-0.5">{consultCall.participantRole}</div>
              )}
            </button>

            {/* Warm transfer CTA or inline confirmation */}
            {customerCall && (
              confirmWarm ? (
                <div className="mb-2 rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-[11px] text-gray-600 mb-3 leading-snug">
                    {consultCall.participantName} will be connected to {customerCall.participantName}. Your call ends.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmWarm(false)}
                      className="flex-1 h-9 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onWarmTransfer();
                        setConfirmWarm(false);
                      }}
                      className="flex-1 h-9 text-xs font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmWarm(true)}
                  className="w-full flex items-center justify-center gap-1.5 h-11 mb-2 rounded-lg bg-gray-800 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  Transfer {customerCall.participantName} to {consultCall.participantName}
                </button>
              )
            )}

            {/* Consult controls */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onMuteToggle();
                  triggerFeedback(muted ? 'Mic on' : 'Muted');
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 h-11 rounded-lg border text-xs font-medium transition-colors',
                  muted ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                )}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {muted ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                    </>
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <HoldToEndButton
                onConfirm={() => onEndCall(consultCall.id)}
                label="End Consult"
                variant="row"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
