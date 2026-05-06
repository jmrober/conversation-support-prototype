import type { Thread, ThreadStatus } from '../../types';
import ThreadItem from './ThreadItem';
import { cn } from '../../utils/cn';

const MAX_CHAT_SLOTS = 3;

interface Props {
  threads: Thread[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewCall: () => void;
  onNewInternalChat: () => void;
  onSimulateInbound?: () => void;
  wrapUpActive?: boolean;
  atChatCapacity?: boolean;
  callActive?: boolean;
}

// ── Priority sort ─────────────────────────────────────────────────────────────
function threadPriority(t: Thread): number {
  const now = Date.now();
  const slaMs = t.slaDeadlineAt ? t.slaDeadlineAt - now : Infinity;

  if (t.status === 'escalated') return 0;
  if (t.status === 'waiting' && slaMs < 5 * 60_000) return 1;
  if (t.status === 'waiting') return 2;
  if (t.status === 'unread') return 3;
  if (t.status === 'active') return 4;
  if (t.status === 'idle') return 5;
  if (t.status === 'idle-declared') return 6;
  return 7;
}

function sortThreads(threads: Thread[]): Thread[] {
  return [...threads].sort((a, b) => {
    const pa = threadPriority(a);
    const pb = threadPriority(b);
    if (pa !== pb) return pa - pb;
    if (a.slaDeadlineAt && b.slaDeadlineAt) return a.slaDeadlineAt - b.slaDeadlineAt;
    return 0;
  });
}

// ── Slot pip indicator ────────────────────────────────────────────────────────
function slotPipColor(status: ThreadStatus | undefined): string {
  if (!status) return 'bg-gray-200';
  if (status === 'escalated') return 'bg-red-500';
  if (status === 'waiting') return 'bg-amber-400';
  if (status === 'unread') return 'bg-blue-500';
  if (status === 'active') return 'bg-green-500';
  return 'bg-gray-400';
}

// ── Empty slot ghost card ─────────────────────────────────────────────────────
function EmptySlot() {
  return (
    <div className="mx-3 my-1.5 rounded-xl border border-dashed border-gray-200 flex items-center gap-3 px-4 py-4">
      <div className="w-6 h-6 rounded-full border border-dashed border-gray-200 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-xs font-medium text-gray-300">Open slot</span>
    </div>
  );
}

export default function ThreadList({
  threads,
  selectedId,
  onSelect,
  onNewCall,
  onNewInternalChat,
  onSimulateInbound,
  wrapUpActive,
  atChatCapacity,
  callActive,
}: Props) {
  // All chat threads pooled and priority-sorted
  const chatThreads = sortThreads(
    threads.filter(t => t.type === 'customer-chat' || t.type === 'internal-chat')
  );

  const activeCount = chatThreads.length;
  const isEmpty = activeCount === 0;

  // Pad to MAX_CHAT_SLOTS with nulls for ghost cards
  const slots: (Thread | null)[] = [
    ...chatThreads.slice(0, MAX_CHAT_SLOTS),
    ...Array(Math.max(0, MAX_CHAT_SLOTS - chatThreads.length)).fill(null),
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* ── Capacity header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2 flex-shrink-0">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chats</span>
        <div className="flex items-center gap-1">
          {slots.map((t, i) => (
            <span
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full transition-colors duration-300',
                t ? slotPipColor(t.status) : 'bg-gray-200'
              )}
            />
          ))}
        </div>
        <span className="text-[10px] font-medium text-gray-400 ml-auto">
          {activeCount} / {MAX_CHAT_SLOTS}
        </span>

        {/* New internal chat button */}
        <button
          onClick={onNewInternalChat}
          title={atChatCapacity ? 'Chat capacity reached' : 'New internal message'}
          disabled={atChatCapacity}
          className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* ── Fixed slots ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0 pb-1">
        {isEmpty ? (
          <>
            {/* First empty slot gets the empty-state prompt */}
            <div className="mx-3 my-1.5 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 py-6 text-center">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-400">Waiting for inbound chats</p>
            </div>
            <EmptySlot />
            <EmptySlot />
          </>
        ) : (
          slots.map((thread, i) =>
            thread ? (
              <div key={thread.id} className="mx-3 my-1.5 rounded-xl overflow-hidden border border-gray-100 shadow-xs">
                <ThreadItem
                  thread={thread}
                  selected={thread.id === selectedId}
                  onClick={() => onSelect(thread.id)}
                />
              </div>
            ) : (
              <EmptySlot key={`empty-${i}`} />
            )
          )
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3 space-y-2">
        {!callActive && (
          <button
            onClick={onNewCall}
            disabled={wrapUpActive}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-blue-800 border border-blue-300 rounded-xl bg-transparent hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            Outbound Call
          </button>
        )}
        {onSimulateInbound && !callActive && !wrapUpActive && (
          <button
            onClick={onSimulateInbound}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 13.4 3 6V5z" />
            </svg>
            Simulate Inbound Call
          </button>
        )}
      </div>
    </div>
  );
}
