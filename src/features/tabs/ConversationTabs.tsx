import { useState, useEffect, useRef } from 'react';
import type { Thread, ThreadType } from '../../types';
import { cn } from '../../utils/cn';

const MAX_SLOTS = 4;

interface Props {
  threads: Thread[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
}

// ── Ordering: calls first, then chats by urgency ──────────────────────────────
function tabPriority(t: Thread): number {
  const isCall = t.type === 'customer-call' || t.type === 'internal-call';
  const now = Date.now();
  const slaMs = t.slaDeadlineAt ? t.slaDeadlineAt - now : Infinity;

  if (t.status === 'wrap-up') return 6;
  if (isCall) return 0;
  if (t.status === 'escalated') return 1;
  if (t.status === 'waiting' && slaMs < 5 * 60_000) return 2;
  if (t.status === 'waiting') return 3;
  if (t.status === 'unread') return 4;
  return 5;
}

function sortForTabs(threads: Thread[]): Thread[] {
  return [...threads].sort((a, b) => tabPriority(a) - tabPriority(b));
}

// ── Elapsed time helpers ──────────────────────────────────────────────────────
function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}


function useElapsed(thread: Thread): string {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (thread.callStartedAt) return formatMs(now - thread.callStartedAt);
  if (thread.chatStartedAt) return formatMs(now - thread.chatStartedAt);
  return '--:--';
}

// ── Wrap-up countdown ─────────────────────────────────────────────────────────
const WRAP_UP_SECONDS = 30;

function useWrapUpCountdown(thread: Thread): number {
  const [remaining, setRemaining] = useState(() => {
    if (thread.status !== 'wrap-up' || !thread.wrapUpStartedAt) return 0;
    return Math.max(0, WRAP_UP_SECONDS - Math.floor((Date.now() - thread.wrapUpStartedAt) / 1000));
  });
  useEffect(() => {
    if (thread.status !== 'wrap-up' || !thread.wrapUpStartedAt) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, WRAP_UP_SECONDS - Math.floor((Date.now() - thread.wrapUpStartedAt!) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [thread.status, thread.wrapUpStartedAt]);
  return remaining;
}

// ── Top accent color per channel ──────────────────────────────────────────────
const TOP_ACCENT: Record<ThreadType, string> = {
  'customer-call': 'border-t-blue-900',
  'internal-call': 'border-t-slate-500',
  'customer-chat': 'border-t-blue-500',
  'internal-chat': 'border-t-slate-400',
};

const TOP_ACCENT_UNREAD: Record<ThreadType, string> = {
  'customer-call': 'border-t-blue-900',
  'internal-call': 'border-t-slate-500',
  'customer-chat': 'border-t-blue-400',
  'internal-chat': 'border-t-slate-400',
};

// ── Icons ─────────────────────────────────────────────────────────────────────
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3 h-3 flex-shrink-0', className)} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3 h-3 flex-shrink-0', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function InternalChatIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('w-3 h-3 flex-shrink-0', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ── Active conversation tab ───────────────────────────────────────────────────
function ConversationTab({
  thread,
  selected,
  isNew,
  muted,
  onClick,
}: {
  thread: Thread;
  selected: boolean;
  isNew: boolean;
  muted?: boolean;
  onClick: () => void;
}) {
  const elapsed = useElapsed(thread);
  const wrapUpRemaining = useWrapUpCountdown(thread);
  const isCall = thread.type === 'customer-call' || thread.type === 'internal-call';
  const isInternal = thread.type === 'internal-call' || thread.type === 'internal-chat';
  const isOnHold = thread.status === 'on-hold';
  const isWrapUp = thread.status === 'wrap-up';
  const isLive = isCall && thread.status === 'active';
  const isConsulting = thread.status === 'consulting';
  const isUnread = !selected && thread.unreadCount > 0;
  const isWaiting = !selected && thread.status === 'waiting';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col justify-center px-3 py-2.5 border-r border-gray-200 text-left transition-all min-w-0 border-t-2 relative overflow-hidden',
        isNew && 'animate-tab-enter',
        selected
          ? cn('flex-[2] bg-white z-10 -mb-px border-b-2 border-b-white', isWrapUp ? 'border-t-gray-400' : TOP_ACCENT[thread.type])
          : 'flex-1',
        !selected && isWrapUp && 'bg-gray-50 border-t-gray-300',
        !selected && !isWrapUp && (isUnread || isWaiting)
          ? cn('bg-gray-50', TOP_ACCENT_UNREAD[thread.type], 'animate-border-pulse')
          : !selected && !isWrapUp && 'bg-gray-100 hover:bg-gray-50 border-t-transparent'
      )}
    >
      {/* Row 1: channel type + status indicators */}
      <div className="flex items-center gap-1 mb-1 w-full">
        {isCall
          ? <PhoneIcon className={selected ? 'text-blue-900' : 'text-gray-400'} />
          : isInternal
          ? <InternalChatIcon className={selected ? 'text-slate-500' : 'text-gray-400'} />
          : <ChatIcon className={selected ? 'text-blue-500' : isUnread ? 'text-blue-400' : 'text-gray-400'} />
        }
        <span className={cn(
          'text-[9px] font-bold uppercase tracking-widest flex-1 truncate',
          selected
            ? isInternal ? 'text-slate-500' : 'text-blue-700'
            : isUnread ? 'text-blue-500' : 'text-gray-400'
        )}>
          {isInternal ? 'Internal' : 'Customer'}
        </span>

        {/* Status badges */}
        {isLive && !muted && (
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
        )}
        {isLive && muted && (
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wide flex-shrink-0">Mute</span>
        )}
        {isOnHold && (
          <span className="text-[8px] font-bold text-amber-600 uppercase tracking-wide flex-shrink-0">Hold</span>
        )}
        {isConsulting && (
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wide flex-shrink-0">Consult</span>
        )}
        {isWrapUp && (
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide flex-shrink-0">Wrap-up</span>
        )}
        {isUnread && (
          <span className="min-w-[14px] h-[14px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none flex-shrink-0">
            {thread.unreadCount}
          </span>
        )}
        {isWaiting && !isUnread && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
        )}
      </div>

      {/* Row 2: elapsed or wrap-up countdown */}
      <span className={cn(
        'text-[13px] font-mono font-semibold tabular-nums leading-tight',
        isWrapUp
          ? selected ? 'text-gray-500' : 'text-gray-400'
          : selected ? 'text-gray-800' : isUnread ? 'text-blue-600' : 'text-gray-400'
      )}>
        {isWrapUp ? `0:${String(wrapUpRemaining).padStart(2, '0')}` : elapsed}
      </span>
    </button>
  );
}

// ── Empty slot tab ────────────────────────────────────────────────────────────
function EmptyTab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center border-r border-gray-200 border-t-2 border-t-transparent bg-gray-50 hover:bg-gray-100 transition-colors gap-1 py-2.5 min-w-0 group"
    >
      <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 group-hover:border-gray-400 flex items-center justify-center transition-colors">
        <svg className="w-3 h-3 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h11m2-4v4m2-2h-4" />
        </svg>
      </div>
      <span className="text-[9px] font-medium text-gray-300 group-hover:text-gray-400 uppercase tracking-wide transition-colors">Add</span>
    </button>
  );
}

// ── Tab bar ───────────────────────────────────────────────────────────────────
export default function ConversationTabs({ threads, selectedId, onSelect, onNewConversation }: Props) {
  const sorted = sortForTabs(threads).slice(0, MAX_SLOTS);
  const emptyCount = Math.max(0, MAX_SLOTS - sorted.length);

  // Track which thread IDs are genuinely new (just mounted)
  const seenIds = useRef(new Set<string>());
  const newIds = new Set<string>();
  sorted.forEach(t => {
    if (!seenIds.current.has(t.id)) newIds.add(t.id);
  });
  // Commit after render
  sorted.forEach(t => seenIds.current.add(t.id));

  return (
    <div className="flex-shrink-0 flex border-b border-gray-200 bg-gray-100">
      {sorted.map(thread => (
        <ConversationTab
          key={thread.id}
          thread={thread}
          selected={thread.id === selectedId}
          isNew={newIds.has(thread.id)}
          muted={(thread.muted ?? false) && (thread.type === 'customer-call' || thread.type === 'internal-call')}
          onClick={() => onSelect(thread.id)}
        />
      ))}
      {Array.from({ length: emptyCount }).map((_, i) => (
        <EmptyTab key={`empty-${i}`} onClick={onNewConversation} />
      ))}
    </div>
  );
}
