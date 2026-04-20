import type { Thread, ThreadStatus, ThreadType } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  thread: Thread;
  selected: boolean;
  onClick: () => void;
}

// Only show a badge for states that genuinely need attention
const ATTENTION_BADGE: Partial<Record<ThreadStatus, { label: string; classes: string }>> = {
  waiting:      { label: 'Waiting',     classes: 'bg-gray-50 text-gray-500 border border-gray-200' },
  'on-hold':    { label: 'On Hold',     classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  consulting:   { label: 'Consulting',  classes: 'bg-slate-50 text-slate-600 border border-slate-200' },
  transferring: { label: 'Transferring',classes: 'bg-blue-50 text-blue-800 border border-blue-200' },
  transferred:  { label: 'Transferred', classes: 'bg-gray-50 text-gray-500 border border-gray-200' },
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

/** Returns "Xm" or "Xh Ym" elapsed since a HH:MM timestamp string (today). */
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
    // Person/colleague icon for internal chats
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }

  // Customer chat bubble
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function ChatModeIndicator({ mode }: { mode?: 'live' | 'async' }) {
  if (mode === 'live') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 uppercase tracking-wide flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
        Live
      </span>
    );
  }
  if (mode === 'async') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-wide flex-shrink-0">
        <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Async
      </span>
    );
  }
  return null;
}

export default function ThreadItem({ thread, selected, onClick }: Props) {
  const attentionBadge = ATTENTION_BADGE[thread.status];
  const isCall = thread.type === 'customer-call' || thread.type === 'internal-call';
  const isUnread = thread.unreadCount > 0;
  const isWaiting = thread.status === 'waiting';
  const isChat = thread.type === 'customer-chat' || thread.type === 'internal-chat';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-4 border-b border-gray-100 transition-colors border-l-2',
        selected
          ? cn('bg-blue-50', LEFT_ACCENT[thread.type])
          : cn('hover:bg-gray-50 border-l-transparent')
      )}
    >
      {/* Row 1: icon + name + mode indicator | timestamp */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <ChannelIcon type={thread.type} />
          <span className={cn(
            'text-sm leading-tight truncate',
            isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'
          )}>
            {thread.participantName}
          </span>
          {isChat && thread.chatMode && (
            <ChatModeIndicator mode={thread.chatMode} />
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Waiting threads show actionable wait age instead of clock time */}
          {isWaiting ? (
            <span className="text-[11px] font-semibold text-amber-600">{waitAge(thread.timestamp)}</span>
          ) : (
            <span className="text-[11px] text-gray-400">{thread.timestamp}</span>
          )}
          {isUnread && (
            <span className="min-w-[18px] h-[18px] bg-blue-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
              {thread.unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Row 2: badge + case ID or role (role only when no caseId) */}
      <div className="flex items-center gap-1.5 mb-1">
        {attentionBadge && (
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none', attentionBadge.classes)}>
            {attentionBadge.label}
          </span>
        )}
        {/* wait age already shown in header row — omit duplicate here */}
        {thread.caseId ? (
          <span className="text-[11px] font-mono text-gray-400">{thread.caseId}</span>
        ) : thread.participantRole ? (
          <span className="text-[11px] text-gray-400">{thread.participantRole}</span>
        ) : null}
      </div>

      {/* Row 3: last message or call state */}
      <div className="text-xs text-gray-500 truncate leading-tight">
        {isCall && thread.status === 'active'
          ? 'Active call in progress'
          : isCall && thread.status === 'on-hold'
          ? 'Customer on hold'
          : thread.lastMessage}
      </div>
    </button>
  );
}
