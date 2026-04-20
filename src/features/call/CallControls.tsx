import { useState } from 'react';
import type { Thread } from '../../types';
import { useCallTimer, formatDuration } from '../../hooks/useCallTimer';
import { cn } from '../../utils/cn';
import HoldToEndButton from './HoldToEndButton';

interface Props {
  thread: Thread;
  consultingWithThread: Thread | null;
  muted: boolean;
  onHoldToggle: () => void;
  onMuteToggle: () => void;
  onEndCall: () => void;
  onWarmTransfer: () => void;
  onOpenDirectory: () => void;
}

// Mock transcript lines keyed by thread type/direction
const MOCK_TRANSCRIPT = [
  { t: '0:00', speaker: 'agent', text: 'Thank you for calling support, this is Jordan. How can I help you today?' },
  { t: '0:08', speaker: 'customer', text: "Hi, I placed an order about two weeks ago and it still hasn't arrived. I'm really frustrated." },
  { t: '0:18', speaker: 'agent', text: "I completely understand, I'm sorry to hear that. Can I get your order number so I can look into this for you?" },
  { t: '0:26', speaker: 'customer', text: "Yeah it's ORD-88821." },
  { t: '0:31', speaker: 'agent', text: "Thank you. I'm pulling that up now — one moment please." },
  { t: '0:42', speaker: 'agent', text: "I can see the order. It looks like there was a routing delay out of the fulfilment centre. Let me escalate this for you." },
  { t: '0:54', speaker: 'customer', text: "Okay, how long will that take?" },
  { t: '1:02', speaker: 'agent', text: "I'm flagging it as priority — you should receive a shipping update within 24 hours." },
];

export default function CallControls({
  thread,
  consultingWithThread,
  muted,
  onHoldToggle,
  onMuteToggle,
  onEndCall,
  onWarmTransfer,
  onOpenDirectory,
}: Props) {
  const elapsed = useCallTimer(
    thread.status === 'active' ? thread.callStartedAt : undefined
  );
  const [detailTab, setDetailTab] = useState<'details' | 'transcript'>('details');

  const isOnHold = thread.status === 'on-hold';
  const isActive = thread.status === 'active';
  const isConsult = thread.type === 'internal-call' && !!thread.consultingWithThreadId;

  // ── Transferring state ──────────────────────────────────────────────────────
  if (thread.status === 'transferring') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-white px-6">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-800 animate-pulse flex-shrink-0" />
          <span className="text-sm font-semibold text-blue-900">Transferring…</span>
        </div>
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          {thread.participantName} is being connected to the destination.
          <br />This call will end automatically.
        </p>
      </div>
    );
  }

  // ── Transferred state ───────────────────────────────────────────────────────
  if (thread.status === 'transferred') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-white px-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900 mb-1">Transfer complete</div>
          <div className="text-xs text-gray-400">{thread.participantName} has been successfully transferred.</div>
        </div>
      </div>
    );
  }

  // ── Zone color tokens ───────────────────────────────────────────────────────
  const zoneBg = isOnHold ? 'bg-slate-50 border-slate-100' : isConsult ? 'bg-slate-50 border-slate-100' : 'bg-blue-50 border-blue-100';
  const dotColor = isOnHold ? 'bg-slate-400' : isConsult ? 'bg-slate-500 animate-pulse' : 'bg-blue-500 animate-pulse';
  const labelColor = isOnHold ? 'text-slate-600' : isConsult ? 'text-slate-700' : 'text-blue-800';
  const timerColor = isOnHold ? 'text-slate-600' : 'text-gray-900';
  const zoneLabel = isOnHold ? 'On Hold' : isConsult ? 'Consult Call' : 'Live Call';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">

      {/* Live / consult / hold status zone */}
      <div className={cn('px-5 py-4 border-b flex items-center justify-between', zoneBg)}>
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
          <span className={cn('text-xs font-semibold uppercase tracking-wider', labelColor)}>
            {zoneLabel}
          </span>
          {thread.callDirection && (
            <span className="text-xs text-gray-400 font-medium">
              · {thread.callDirection === 'inbound' ? 'Inbound' : 'Outbound'}
            </span>
          )}
        </div>
        <span className={cn('text-xl font-bold tabular-nums leading-none', timerColor)}>
          {isActive || isConsult ? formatDuration(elapsed) : isOnHold ? formatDuration(elapsed) : '—'}
        </span>
      </div>

      {/* Customer on hold banner (consult context) */}
      {isConsult && consultingWithThread && (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
              Customer on hold
            </div>
            <div className="text-sm font-medium text-gray-900 leading-tight truncate">
              {consultingWithThread.participantName}
            </div>
            {consultingWithThread.caseId && (
              <div className="text-[11px] font-mono text-gray-400">{consultingWithThread.caseId}</div>
            )}
          </div>
          <button
            onClick={onEndCall}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Return to call
          </button>
        </div>
      )}

      {/* ── Call details / transcript tabs ── */}
      {!isConsult && (
        <>
          {/* Tab strip */}
          <div className="flex border-b border-gray-100 flex-shrink-0">
            <button
              onClick={() => setDetailTab('details')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold border-b-2 transition-colors',
                detailTab === 'details'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Details
            </button>
            <button
              onClick={() => setDetailTab('transcript')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold border-b-2 transition-colors',
                detailTab === 'transcript'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h4m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transcript
            </button>
          </div>

          {/* Details tab */}
          {detailTab === 'details' && (
            <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50">
              <div className="flex flex-col gap-3">
                {/* Caller card */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Caller</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {thread.participantName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{thread.participantName}</div>
                      {thread.caseId && (
                        <div className="text-[11px] font-mono text-gray-400">{thread.caseId}</div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <p className="text-gray-400 mb-0.5">Direction</p>
                      <p className="font-medium text-gray-700 capitalize">{thread.callDirection ?? 'Inbound'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Channel</p>
                      <p className="font-medium text-gray-700">Voice</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Queue</p>
                      <p className="font-medium text-gray-700">Customer Support</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-0.5">Wait time</p>
                      <p className="font-medium text-gray-700">1m 12s</p>
                    </div>
                  </div>
                </div>

                {/* Previous contacts */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Recent history</p>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { type: 'Chat', date: 'Apr 12', summary: 'Promo code not applying at checkout', resolved: true },
                      { type: 'Call', date: 'Mar 28', summary: 'Delivery enquiry — ORD-87104', resolved: true },
                    ].map((c, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className={cn(
                          'text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0',
                          c.type === 'Call' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        )}>
                          {c.type.toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-700 leading-tight">{c.summary}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{c.date} · {c.resolved ? 'Resolved' : 'Open'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Call notes</p>
                  <textarea
                    placeholder="Add a note…"
                    rows={3}
                    className="w-full text-xs text-gray-800 placeholder-gray-400 resize-none border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Transcript tab */}
          {detailTab === 'transcript' && (
            <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Live transcript</span>
                <span className="text-[10px] text-gray-400 ml-auto">AI-generated · may contain errors</span>
              </div>
              <div className="flex flex-col gap-3">
                {MOCK_TRANSCRIPT.map((line, i) => (
                  <div key={i} className={cn('flex gap-2', line.speaker === 'agent' ? 'flex-row-reverse' : 'flex-row')}>
                    <div className={cn(
                      'max-w-[80%] flex flex-col gap-0.5',
                      line.speaker === 'agent' ? 'items-end' : 'items-start'
                    )}>
                      <span className="text-[9px] text-gray-400 px-1">{line.speaker === 'agent' ? 'You' : thread.participantName} · {line.t}</span>
                      <div className={cn(
                        'px-3 py-2 rounded-2xl text-xs leading-relaxed',
                        line.speaker === 'agent'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                      )}>
                        {line.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty zone when in consult (no detail tabs) */}
      {isConsult && <div className="flex-1 bg-gray-50" />}

      {/* Controls section */}
      <div className="px-5 pb-5 pt-4 border-t border-gray-100 bg-white flex-shrink-0">

        {/* Warm transfer action — visible only during a consult */}
        {isConsult && consultingWithThread && (
          <button
            onClick={onWarmTransfer}
            className="w-full flex items-center justify-center gap-2 h-11 mb-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="text-sm font-semibold">Transfer {consultingWithThread.participantName} to {thread.participantName}</span>
          </button>
        )}

        {/* Standard call controls */}
        <div className="flex gap-2">

          {/* Hold / Resume — hidden during consult */}
          {!isConsult && (
            <button
              onClick={onHoldToggle}
              title={isOnHold ? 'Resume' : 'Hold'}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg transition-colors',
                isOnHold
                  ? 'bg-slate-600 text-white hover:bg-slate-700'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              )}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOnHold ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                )}
              </svg>
              <span className="text-[11px] font-medium leading-none">{isOnHold ? 'Resume' : 'Hold'}</span>
            </button>
          )}

          {/* Mute */}
          <button
            onClick={onMuteToggle}
            title={muted ? 'Unmute' : 'Mute'}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg transition-colors',
              muted
                ? 'bg-gray-800 text-white hover:bg-gray-900'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {muted ? (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
            <span className="text-[11px] font-medium leading-none">{muted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* Directory — hidden during consult */}
          {!isConsult && (
            <button
              onClick={onOpenDirectory}
              title="Directory"
              className="flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[11px] font-medium leading-none">Directory</span>
            </button>
          )}

          {/* End call — hold to confirm */}
          <HoldToEndButton
            onConfirm={onEndCall}
            label={isConsult ? 'End Consult' : 'End Call'}
            variant="tile"
          />

        </div>
      </div>
    </div>
  );
}
