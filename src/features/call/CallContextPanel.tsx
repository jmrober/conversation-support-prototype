import { useState, useRef } from 'react';
import { useCallTimer, formatDuration } from '../../hooks/useCallTimer';

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconCopy() {
  return (
    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconMerge() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h4m0 0l-2-2m2 2l-2 2M16 17h-4m0 0l2 2m-2-2l2-2M12 7v10" />
    </svg>
  );
}

function IconPhoneEnd() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}

const HOLD_MS = 3000;

function HoldToEndBtn({ onConfirm }: { onConfirm?: () => void }) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setHolding(false);
      onConfirm?.();
    }, HOLD_MS);
  };

  const cancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHolding(false);
  };

  return (
    <button
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      className="relative flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border select-none overflow-hidden transition-colors"
      style={{
        minWidth: 72,
        borderColor: holding ? '#ef4444' : '#fecaca',
        background: holding ? '#ef4444' : '#fff',
        color: holding ? '#fff' : '#ef4444',
      }}
    >
      {/* Animated fill — grows left to right over 3s */}
      {holding && (
        <div className="animate-hold-fill absolute inset-y-0 left-0 bg-red-700 pointer-events-none" />
      )}
      <span className="relative flex items-center gap-1.5 text-[12px] font-semibold">
        <IconPhoneEnd />
        {holding ? 'Hold to end…' : 'End'}
      </span>
    </button>
  );
}

function ClickToConfirmEndBtn({ onConfirm }: { onConfirm?: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <button
        onClick={() => { setConfirming(false); onConfirm?.(); }}
        className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border text-[12px] font-semibold transition-colors"
        style={{ minWidth: 72, borderColor: '#ef4444', background: '#ef4444', color: '#fff' }}
      >
        <IconPhoneEnd />
        Confirm end
      </button>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border text-[12px] font-semibold transition-colors"
      style={{ minWidth: 72, borderColor: '#fecaca', background: '#fff', color: '#ef4444' }}
    >
      <IconPhoneEnd />
      End
    </button>
  );
}

function IconMic() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function AudioBars() {
  return (
    <span className="flex items-end gap-[2px] h-4">
      <span className="w-[3px] bg-green-500 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0ms' }} />
      <span className="w-[3px] bg-green-500 rounded-full animate-pulse" style={{ height: '70%', animationDelay: '150ms' }} />
      <span className="w-[3px] bg-green-500 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '300ms' }} />
      <span className="w-[3px] bg-green-500 rounded-full animate-pulse" style={{ height: '55%', animationDelay: '450ms' }} />
    </span>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface CallCard {
  phone: string;
  label?: string;
  name?: string;
  holdDuration?: number; // epoch ms when hold started; if set → on-hold card
  callStartedAt?: number; // epoch ms when call started; if set → active card
  transcriptionInProgress?: boolean;
}

interface IvrDataPoint {
  label: string;
  value: string;
  copyable?: boolean;
}

interface Props {
  agentStatus?: string;
  holdCard?: CallCard;
  activeCard?: CallCard;
  ivrSummary?: string;
  ivrDataPoints?: IvrDataPoint[];
  onResume?: () => void;
  onMerge?: () => void;
  onEndHeld?: () => void;
  onMute?: () => void;
  onHold?: () => void;
  muted?: boolean;
  endMode?: 'hold' | 'click-confirm';
}

// ── Timer helpers ─────────────────────────────────────────────────────────────

function HoldTimer({ startedAt }: { startedAt: number }) {
  const elapsed = useCallTimer(startedAt);
  return <>{formatDuration(elapsed)}</>;
}

function ActiveTimer({ startedAt }: { startedAt: number }) {
  const elapsed = useCallTimer(startedAt);
  return <>{formatDuration(elapsed)}</>;
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }
  return (
    <button onClick={handleCopy} className="inline-flex ml-1 opacity-60 hover:opacity-100 transition-opacity">
      {copied ? (
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <IconCopy />
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CallContextPanel({
  agentStatus = 'Ready',
  holdCard,
  activeCard,
  ivrSummary,
  ivrDataPoints = [],
  onResume,
  onMerge,
  onEndHeld,
  onMute,
  onHold,
  muted = false,
  endMode = 'hold',
}: Props) {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden font-sans">

      {/* ── Status bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 flex-shrink-0">
        <button className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[13px] font-semibold text-gray-900">{agentStatus}</span>
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <span className="text-[13px] font-semibold text-gray-900">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* ── Scrollable body ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* On-hold card */}
        {holdCard && (
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            {/* Phone + copy */}
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[13px] font-semibold text-gray-900">{holdCard.phone}</span>
              <CopyButton value={holdCard.phone} />
            </div>
            {/* Label */}
            <div className="text-[13px] font-semibold text-gray-900 mb-1.5">{holdCard.label}</div>
            {/* Hold status row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[12px] font-semibold text-red-500">
                On hold:&nbsp;
                {holdCard.holdDuration !== undefined
                  ? <HoldTimer startedAt={holdCard.holdDuration} />
                  : '00:00'}
              </span>
              {holdCard.transcriptionInProgress && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-[12px] text-gray-400">Transcription in progress</span>
                </>
              )}
            </div>
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={onResume}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <IconPlay />
                Resume
              </button>
              <button
                onClick={onMerge}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <IconMerge />
                Merge
              </button>
              {endMode === 'click-confirm'
                ? <ClickToConfirmEndBtn onConfirm={onEndHeld} />
                : <HoldToEndBtn onConfirm={onEndHeld} />}

            </div>
          </div>
        )}

        {/* Active call card — green border */}
        {activeCard && (
          <div className="mx-4 my-3 rounded-xl border-2 border-green-500 bg-green-50 px-4 py-3">
            {/* Phone + copy */}
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[13px] font-semibold text-gray-900">{activeCard.phone}</span>
              <CopyButton value={activeCard.phone} />
            </div>
            {/* Name */}
            {activeCard.name && (
              <div className="text-[15px] font-semibold text-gray-900 mb-1.5">{activeCard.name}</div>
            )}
            {/* Timer + transcription + audio bars */}
            <div className="flex items-center gap-2 mb-3">
              <IconClock />
              <span className="text-[12px] font-semibold text-gray-700 tabular-nums">
                {activeCard.callStartedAt !== undefined
                  ? <ActiveTimer startedAt={activeCard.callStartedAt} />
                  : '00:00'}
              </span>
              {activeCard.transcriptionInProgress && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-[12px] text-gray-400">Transcription in progress</span>
                </>
              )}
              <div className="ml-auto">
                <AudioBars />
              </div>
            </div>
            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={onMute}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <IconMic />
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <button
                onClick={onHold}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <IconPause />
                Hold
              </button>
            </div>
          </div>
        )}

        {/* IVR Summary */}
        {ivrSummary && (
          <div className="px-4 pb-4">
            <div className="text-[13px] font-bold text-gray-900 mb-2">IVR Summary</div>
            <p className="text-[13px] text-gray-700 leading-relaxed">{ivrSummary}</p>
          </div>
        )}

        {/* Metadata fields */}
        {ivrDataPoints.length > 0 && (
          <div className="px-4 pb-6 space-y-3">
            {ivrDataPoints.map((dp) => (
              <div key={dp.label}>
                <div className="text-[12px] font-bold text-gray-900 mb-0.5">{dp.label}</div>
                <div className="flex items-center text-[13px] text-gray-700">
                  {dp.value}
                  {dp.copyable && <CopyButton value={dp.value} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
