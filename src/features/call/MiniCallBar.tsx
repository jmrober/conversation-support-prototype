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
  onSelectCall: (id: string) => void;
}

function LiveTimer({ thread }: { thread: Thread }) {
  const elapsed = useCallTimer(
    thread.status === 'active' ? thread.callStartedAt : undefined
  );
  return <>{formatDuration(elapsed)}</>;
}

function CallRow({
  thread,
  label,
  dimmed,
  muted,
  showEnd,
  onMuteToggle,
  onHoldToggle,
  onEndCall,
  onSelectCall,
}: {
  thread: Thread;
  label: string;
  dimmed: boolean;
  muted: boolean;
  showEnd: boolean;
  onMuteToggle: () => void;
  onHoldToggle: (id: string) => void;
  onEndCall: (id: string) => void;
  onSelectCall: (id: string) => void;
}) {
  const isOnHold = thread.status === 'on-hold' || thread.status === 'consulting';
  return (
    <div className={cn('flex items-center gap-2 px-4 py-2.5', dimmed ? 'bg-gray-800' : 'bg-blue-900')}>
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', isOnHold ? 'bg-white/40' : 'bg-white animate-pulse')} />
      <button onClick={() => onSelectCall(thread.id)} className="flex-1 min-w-0 text-left">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-white/50 leading-none mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-white truncate leading-tight">{thread.participantName}</div>
      </button>
      <span className="text-xs font-bold tabular-nums text-white/70 flex-shrink-0">
        <LiveTimer thread={thread} />
      </span>
      {/* Hold/Resume */}
      <button
        onClick={() => onHoldToggle(thread.id)}
        title={isOnHold ? 'Resume' : 'Hold'}
        className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOnHold ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
          )}
        </svg>
      </button>
      {/* Mute (only on active leg) */}
      {!isOnHold && (
        <button
          onClick={onMuteToggle}
          title={muted ? 'Unmute' : 'Mute'}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0',
            muted ? 'bg-white text-gray-900' : 'bg-white/15 hover:bg-white/25'
          )}
        >
          <svg className={cn('w-3.5 h-3.5', muted ? 'text-gray-900' : 'text-white')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {muted ? (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </>
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            )}
          </svg>
        </button>
      )}
      {/* End — hold to confirm, only shown when showEnd is true */}
      {showEnd && (
        <HoldToEndButton
          onConfirm={() => onEndCall(thread.id)}
          variant="mini"
        />
      )}
    </div>
  );
}

export default function MiniCallBar({
  customerCall,
  consultCall,
  muted,
  onMuteToggle,
  onHoldToggle,
  onEndCall,
  onSelectCall,
}: Props) {
  const [feedback, setFeedback] = useState<string>('');
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!customerCall && !consultCall) return null;

  function showFeedback(message: string) {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setFeedback(message);
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback('');
      feedbackTimerRef.current = null;
    }, 1500);
  }

  function handleHoldToggle(id: string) {
    const thread = customerCall?.id === id ? customerCall : consultCall;
    const isOnHold = thread?.status === 'on-hold' || thread?.status === 'consulting';
    showFeedback(isOnHold ? 'Call resumed' : 'On Hold');
    onHoldToggle(id);
  }

  function handleMuteToggle() {
    showFeedback(muted ? 'Mic on' : 'Muted');
    onMuteToggle();
  }

  return (
    <div className="flex-shrink-0 flex flex-col">
      {/* Transient feedback bar */}
      {feedback && (
        <div className="bg-gray-900 text-white text-xs font-medium text-center py-1 leading-none">
          {feedback}
        </div>
      )}
      <div className="divide-y divide-white/10">
        {/* Customer call row — dimmed when consult is active, no End button during consult */}
        {customerCall && (
          <CallRow
            thread={customerCall}
            label="Customer Call"
            dimmed={!!consultCall}
            muted={!consultCall && muted}
            showEnd={!consultCall}
            onMuteToggle={handleMuteToggle}
            onHoldToggle={handleHoldToggle}
            onEndCall={onEndCall}
            onSelectCall={onSelectCall}
          />
        )}
        {/* Consult call row — active leg */}
        {consultCall && (
          <CallRow
            thread={consultCall}
            label="Consulting"
            dimmed={false}
            muted={muted}
            showEnd={true}
            onMuteToggle={handleMuteToggle}
            onHoldToggle={handleHoldToggle}
            onEndCall={onEndCall}
            onSelectCall={onSelectCall}
          />
        )}
      </div>
    </div>
  );
}
