import { useState, useEffect } from 'react';
import type { Thread } from '../../types';
import { cn } from '../../utils/cn';
import ShareCartPanel from '../conversation/ShareCartPanel';

function useElapsedTimer(startedAt?: number): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  if (!startedAt) return '--:--';
  const totalSec = Math.max(0, Math.floor((now - startedAt) / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Call context mock data ────────────────────────────────────────────────────
const CALL_CONTEXT = {
  intent: 'Troubleshooting software',
  brand: 'TechPro',
  orderNumber: 'ORD-88821',
  taskId: 'adflkjaoutwouieuo9480o5734570896835',
  ivrSummary: 'Customer called about a software issue with their purchased product. Unable to complete initial setup.',
};


interface Props {
  thread: Thread;
  consultCall?: Thread | null;
  muted: boolean;
  onHoldToggle: () => void;
  onMuteToggle: () => void;
  onRequestEndCall?: () => void;
  onEndConsult?: () => void;
  onOpenDirectory: () => void;
  relatedChat?: Thread | null;
  onSwitchToChat?: () => void;
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
  consultCall,
  muted,
  onHoldToggle,
  onMuteToggle,
  onRequestEndCall,
  onEndConsult,
  onOpenDirectory,
  relatedChat,
  onSwitchToChat,
}: Props) {
  const [detailTab, setDetailTab] = useState<'details' | 'transcript'>('details');
  const [copiedTaskId, setCopiedTaskId] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [shareCartOpen, setShareCartOpen] = useState(false);

  const consultElapsed = useElapsedTimer(consultCall?.callStartedAt);

  const handleCopyPhone = () => {
    if (!thread.participantPhone) return;
    navigator.clipboard.writeText(thread.participantPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleCopyTaskId = () => {
    navigator.clipboard.writeText(CALL_CONTEXT.taskId);
    setCopiedTaskId(true);
    setTimeout(() => setCopiedTaskId(false), 2000);
  };

  const isOnHold = thread.status === 'on-hold';
  const isConsulting = !!consultCall;

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


  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">

      {/* ── Consulting dual-leg layout ── */}
      {isConsulting && consultCall ? (
        <>
          {/* ── Customer leg ── */}
          <div className="px-4 pt-4 pb-3 flex-shrink-0">
            {/* Contact info row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-widest text-amber-600 mb-1">Customer · On Hold</div>
                <div className="text-[15px] font-semibold text-gray-900 leading-tight">{thread.participantName}</div>
                {thread.participantPhone && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[12px] font-mono text-gray-500 tracking-wide">{thread.participantPhone}</span>
                    <button onClick={handleCopyPhone} className="text-gray-400 hover:text-gray-600 transition-colors" title="Copy phone">
                      {copiedPhone
                        ? <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      }
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={onRequestEndCall}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                End Call
              </button>
            </div>
            {/* Customer controls */}
            <div className="flex gap-2">
              <button
                onClick={onHoldToggle}
                className="flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[11px] font-medium leading-none">Resume</span>
              </button>
              <button
                onClick={onMuteToggle}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg transition-colors',
                  muted ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                )}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {muted ? (<><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></>) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />)}
                </svg>
                <span className="text-[11px] font-medium leading-none">{muted ? 'Unmute' : 'Mute'}</span>
              </button>
              <button
                onClick={onOpenDirectory}
                className="flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span className="text-[11px] font-medium leading-none">Consult</span>
              </button>
              <button
                className="flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-[11px] font-medium leading-none">Transfer</span>
              </button>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="mx-4 border-t border-gray-100" />

          {/* ── Consult leg ── */}
          <div className="px-4 pt-4 pb-3 flex-shrink-0">
            {/* Contact info row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Consulting With · {consultElapsed}</span>
                </div>
                <div className="text-[15px] font-semibold text-gray-900 leading-tight">{consultCall.participantName}</div>
                {consultCall.participantRole && (
                  <div className="text-xs text-gray-400 mt-0.5">{consultCall.participantRole}</div>
                )}
              </div>
              <button
                onClick={onEndConsult}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                End Consult
              </button>
            </div>
            {/* Consult controls — Hold + Mute only */}
            <div className="flex gap-2">
              <button
                className="flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
                <span className="text-[11px] font-medium leading-none">Hold</span>
              </button>
              <button
                onClick={onMuteToggle}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg transition-colors',
                  muted ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                )}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {muted ? (<><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></>) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />)}
                </svg>
                <span className="text-[11px] font-medium leading-none">{muted ? 'Unmute' : 'Mute'}</span>
              </button>
            </div>
          </div>

          {/* ── Divider before details ── */}
          <div className="border-t border-gray-100" />
        </>
      ) : (
        /* ── Standard single-leg call controls ── */
        <div className="px-4 py-3 bg-white flex-shrink-0">
          <div className="flex gap-2">

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

            <button
              onClick={onOpenDirectory}
              title="Start a consult call"
              className="flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <span className="text-[11px] font-medium leading-none">Consult</span>
            </button>

            <button
              title="Transfer to agent or queue"
              className="flex-1 flex flex-col items-center justify-center gap-1 h-11 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <span className="text-[11px] font-medium leading-none">Transfer</span>
            </button>

          </div>
        </div>
      )}

      {/* ── Call details / transcript tabs ── */}
      <>

          {/* Tab strip */}
          <div className="flex border-b border-gray-100 flex-shrink-0">
            <button
              onClick={() => setDetailTab('details')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold border-b-2 transition-colors',
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
                'flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold border-b-2 transition-colors',
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

                {/* Share Cart — top */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setShareCartOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-[11px] font-semibold text-gray-700">Share Cart</span>
                      <span className="min-w-[18px] h-[18px] bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">3</span>
                    </div>
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${shareCartOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {shareCartOpen && (
                    <ShareCartPanel mode="call" onClose={() => setShareCartOpen(false)} />
                  )}
                </div>

                {/* Related Chat card */}
                {relatedChat && onSwitchToChat && (
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Related Chat</p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{relatedChat.participantName}</p>
                        {relatedChat.issueTag && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{relatedChat.issueTag}</p>
                        )}
                      </div>
                      <button
                        onClick={onSwitchToChat}
                        className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View chat
                      </button>
                    </div>
                  </div>
                )}

                {/* Combined Caller + Call Context */}
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Call Details</p>
                  <div className="flex flex-col gap-2.5 text-[11px]">
                    <div>
                      <span className="text-gray-400 block mb-1">IVR Summary</span>
                      <p className="text-gray-600 leading-relaxed">{CALL_CONTEXT.ivrSummary}</p>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div className="grid grid-cols-2 gap-2">
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
                    <div className="h-px bg-gray-100" />
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Intent</span>
                      <span className="font-medium text-gray-700 text-right">{CALL_CONTEXT.intent}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Brand</span>
                      <span className="font-medium text-gray-700">{CALL_CONTEXT.brand}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-400">Order number</span>
                      <span className="font-medium text-gray-700 font-mono">{CALL_CONTEXT.orderNumber}</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className="text-gray-400">Task ID</span>
                        <button
                          onClick={handleCopyTaskId}
                          className={cn(
                            'flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors flex-shrink-0',
                            copiedTaskId
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                          )}
                        >
                          {copiedTaskId ? (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              Copied
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-mono text-[10px] text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 break-all leading-relaxed select-all">
                        {CALL_CONTEXT.taskId}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Transcript tab */}
          {detailTab === 'transcript' && (
            <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">

              {/* AI summary card */}
              <div className="bg-white rounded-xl border border-gray-100 p-3.5 mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">AI Summary</span>
                </div>
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  Customer called about a software issue with a recently purchased product (ORD-88821). Unable to complete initial setup. Agent identified a routing delay and escalated as priority — customer should receive a shipping update within 24 hours.
                </p>
              </div>

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

    </div>
  );
}
