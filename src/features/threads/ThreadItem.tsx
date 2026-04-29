import { useState, useEffect } from 'react';
import type { Thread, ThreadStatus, ThreadType } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  thread: Thread;
  selected: boolean;
  onClick: () => void;
  compact?: boolean; // compressed chip view during active call
}

// ── State badge system ────────────────────────────────────────────────────────
// Only shown for states that carry meaningful signal.
const STATE_BADGE: Partial<Record<ThreadStatus, { label: string; classes: string }>> = {
  escalated:     { label: 'ESCALATED',    classes: 'bg-red-600 text-white' },
  waiting:       { label: 'WAITING',      classes: 'bg-amber-100 text-amber-800' },
  idle:          { label: 'IDLE',         classes: 'bg-gray-100 text-gray-500' },
  'idle-declared': { label: 'RESEARCHING', classes: 'bg-gray-100 text-gray-500' },
  'on-hold':     { label: 'ON HOLD',      classes: 'bg-blue-100 text-blue-700' },
  consulting:    { label: 'CONSULTING',   classes: 'bg-slate-100 text-slate-600' },
  transferring:  { label: 'TRANSFERRING', classes: 'bg-blue-50 text-blue-700' },
};

const LEFT_ACCENT: Record<ThreadType, string> = {
  'customer-chat': 'border-l-blue-500',
  'internal-chat': 'border-l-slate-400',
  'customer-call': 'border-l-blue-800',
  'internal-call': 'border-l-slate-400',
};

const ICON_COLOR: Record<ThreadType, string> = {
  'customer-chat': 'text-blue-500',
  'internal-chat': 'text-slate-500',
  'customer-call': 'text-blue-700',
  'internal-call': 'text-slate-500',
};

// ── Live SLA timer ────────────────────────────────────────────────────────────
function formatRemaining(ms: number): string {
  const sec = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function SLATimer({ slaDeadlineAt, fallback }: { slaDeadlineAt: number; fallback: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = slaDeadlineAt - now;
  const remainingSec = remainingMs / 1000;

  if (remainingSec > 10 * 60) {
    // Far enough out — show elapsed wait time, no pressure
    return <span className="text-[11px] text-gray-400">{fallback}</span>;
  }
  if (remainingSec > 5 * 60) {
    return (
      <span className="text-[11px] font-semibold tabular-nums text-amber-600">
        {formatRemaining(remainingMs)}
      </span>
    );
  }
  if (remainingSec > 0) {
    return (
      <span className="text-[11px] font-bold tabular-nums text-red-600">
        {formatRemaining(remainingMs)}
      </span>
    );
  }
  return (
    <span className="text-[9px] font-bold tracking-wide text-red-600 uppercase">
      Overdue
    </span>
  );
}

/** Elapsed time since a HH:MM timestamp string (today). */
function waitAge(timestamp: string): string {
  const now = new Date();
  const [rawTime, period] = timestamp.split(' ');
  if (!rawTime) return '';
  const [h, m] = rawTime.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '';
  let hours = h;
  if (period === 'PM' && h !== 12) hours += 12;
  if (period === 'AM' && h === 12) hours = 0;
  const then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, m);
  const diffMin = Math.floor((now.getTime() - then.getTime()) / 60000);
  if (diffMin < 1) return '<1m';
  if (diffMin < 60) return `${diffMin}m`;
  const hh = Math.floor(diffMin / 60);
  const mm = diffMin % 60;
  return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;
}

function ChannelIcon({ type }: { type: ThreadType }) {
  const isCall = type === 'customer-call' || type === 'internal-call';
  const isInternal = type === 'internal-chat' || type === 'internal-call';
  const cls = cn('w-3.5 h-3.5 flex-shrink-0', ICON_COLOR[type]);

  if (isCall) {
    return (
      <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
      </svg>
    );
  }
  if (isInternal) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

// ── Compact row (used in compressed call view — replaces pills) ───────────────
function CompactRow({ thread, selected, onClick }: Props) {
  const isEscalated = thread.status === 'escalated';
  const isWaiting = thread.status === 'waiting';
  const badge = STATE_BADGE[thread.status];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-4 py-2.5 border-b border-gray-100 text-left transition-colors',
        selected
          ? 'bg-blue-50 border-l-2 border-l-blue-500'
          : isEscalated
          ? 'bg-red-50 border-l-2 border-l-red-500 hover:bg-red-100'
          : 'hover:bg-gray-50'
      )}
    >
      <span className={cn(
        'w-2 h-2 rounded-full flex-shrink-0',
        isEscalated ? 'bg-red-500' :
        isWaiting ? 'bg-amber-400 animate-pulse' :
        thread.status === 'active' ? 'bg-green-500' :
        'bg-gray-300'
      )} />
      <span className={cn(
        'flex-1 text-sm truncate min-w-0',
        isEscalated || thread.unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
      )}>
        {thread.participantName}
      </span>
      {thread.issueTag && (
        <span className="text-[10px] text-gray-400 truncate max-w-[90px] hidden sm:block">{thread.issueTag}</span>
      )}
      {badge && (
        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded leading-none tracking-wide flex-shrink-0', badge.classes)}>
          {badge.label}
        </span>
      )}
      {thread.slaDeadlineAt && isWaiting && (
        <SLATimer slaDeadlineAt={thread.slaDeadlineAt} fallback="" />
      )}
      {thread.unreadCount > 0 && (
        <span className={cn(
          'min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none flex-shrink-0',
          isWaiting || isEscalated ? 'bg-red-500' : 'bg-blue-900'
        )}>
          {thread.unreadCount}
        </span>
      )}
    </button>
  );
}

// ── Full thread row ───────────────────────────────────────────────────────────
export default function ThreadItem({ thread, selected, onClick, compact }: Props) {
  if (compact) return <CompactRow thread={thread} selected={selected} onClick={onClick} />;

  const badge = STATE_BADGE[thread.status];
  const isUnread = thread.unreadCount > 0;
  const isWaiting = thread.status === 'waiting';
  const isEscalated = thread.status === 'escalated';
  const isChat = thread.type === 'customer-chat' || thread.type === 'internal-chat';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors border-l-2',
        selected
          ? cn('bg-blue-50', LEFT_ACCENT[thread.type])
          : isEscalated
          ? 'bg-red-50 border-l-red-500 hover:bg-red-100'
          : 'hover:bg-gray-50 border-l-transparent'
      )}
    >
      {/* Row 1: channel icon + name + wait time / SLA timer */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <ChannelIcon type={thread.type} />
          <span className={cn(
            'text-sm leading-tight truncate',
            isUnread || isEscalated ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'
          )}>
            {thread.participantName}
          </span>
          {/* Live chat indicator */}
          {isChat && thread.chatMode === 'live' && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase tracking-wide flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* SLA timer or wait age for waiting threads; plain timestamp for others */}
          {isWaiting ? (
            thread.slaDeadlineAt
              ? <SLATimer slaDeadlineAt={thread.slaDeadlineAt} fallback={waitAge(thread.timestamp)} />
              : <span className="text-[11px] font-semibold text-amber-600">{waitAge(thread.timestamp)}</span>
          ) : (
            <span className="text-[11px] text-gray-400">{thread.timestamp}</span>
          )}
          {isUnread && (
            <span className={cn(
              'min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none',
              isWaiting || isEscalated ? 'bg-red-500' : 'bg-blue-900'
            )}>
              {thread.unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Row 2: state badge + case ID / role */}
      <div className="flex items-center gap-1.5 mb-1">
        {badge && (
          <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded leading-none tracking-wide', badge.classes)}>
            {badge.label}
          </span>
        )}
        {thread.issueTag && (
          <span className="text-[10px] text-gray-400 font-medium">{thread.issueTag}</span>
        )}
        {!thread.issueTag && thread.caseId && (
          <span className="text-[11px] font-mono text-gray-400">{thread.caseId}</span>
        )}
        {!thread.issueTag && !thread.caseId && thread.participantRole && (
          <span className="text-[11px] text-gray-400">{thread.participantRole}</span>
        )}
      </div>

      {/* Row 3: last message preview */}
      <div className="text-xs text-gray-500 truncate leading-tight">
        {thread.lastMessage}
      </div>
    </button>
  );
}
