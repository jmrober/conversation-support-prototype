import { useState } from 'react';
import type { Thread } from '../../types';
import ThreadItem from './ThreadItem';

function SimulateInboundButton({ onSimulateInbound }: { onSimulateInbound: () => void }) {
  return (
    <button
      onClick={onSimulateInbound}
      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      Simulate Inbound Call
    </button>
  );
}

interface Props {
  threads: Thread[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewCall: () => void;
  onNewInternalChat: () => void;
  onSimulateInbound?: () => void;
  wrapUpActive?: boolean;
  atChatCapacity?: boolean;
  callActive?: boolean; // suppresses thread list to compact strip
}

// ── Priority sort ─────────────────────────────────────────────────────────────
// Lower number = higher priority.
function threadPriority(t: Thread): number {
  const now = Date.now();
  const slaMs = t.slaDeadlineAt ? t.slaDeadlineAt - now : Infinity;

  if (t.status === 'escalated') return 0;
  if (t.status === 'waiting' && slaMs < 5 * 60_000) return 1;  // breach imminent
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
    // Same priority: waiting threads sort by SLA proximity (soonest first)
    if (a.slaDeadlineAt && b.slaDeadlineAt) return a.slaDeadlineAt - b.slaDeadlineAt;
    return 0;
  });
}

// ── Status label used in compact section header ───────────────────────────────
function getStatusSummary(threads: Thread[]): string {
  const waiting = threads.filter(t => t.status === 'waiting').length;
  const escalated = threads.filter(t => t.status === 'escalated').length;
  if (escalated > 0) return `${escalated} escalated`;
  if (waiting > 0) return `${waiting} waiting`;
  return 'all active';
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
  const [internalOpen, setInternalOpen] = useState(false);

  const customerThreads = sortThreads(threads.filter(t => t.type === 'customer-chat'));
  const internalThreads = threads.filter(t => t.type === 'internal-chat');
  const internalUnread = internalThreads.reduce((sum, t) => sum + t.unreadCount, 0);
  const isEmpty = customerThreads.length === 0 && internalThreads.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="overflow-y-auto flex-1">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-4 h-56 text-center px-6">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">No active conversations</p>
              <p className="text-xs text-gray-400 mt-0.5">Waiting for an inbound contact, or make an outbound call.</p>
            </div>
            <button
              onClick={onNewCall}
              disabled={wrapUpActive}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
              </svg>
              Outbound Call
            </button>
          </div>
        ) : (
          <>
            {/* Customer conversations */}
            {customerThreads.length > 0 && (
              callActive ? (
                // ── Compact row view during active call ───────────────────
                <>
                  <div className="px-4 py-2 flex items-center border-b border-gray-100">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Chats · {getStatusSummary(customerThreads)}
                    </span>
                  </div>
                  {customerThreads.map(t => (
                    <ThreadItem
                      key={t.id}
                      thread={t}
                      selected={t.id === selectedId}
                      onClick={() => onSelect(t.id)}
                      compact
                    />
                  ))}
                </>
              ) : (
                // ── Full thread rows ──────────────────────────────────────
                customerThreads.map(t => (
                  <ThreadItem
                    key={t.id}
                    thread={t}
                    selected={t.id === selectedId}
                    onClick={() => onSelect(t.id)}
                  />
                ))
              )
            )}

            {/* Internal section — collapsible */}
            {internalThreads.length > 0 && (
              <>
                <div className="flex items-center border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setInternalOpen(o => !o)}
                    className="flex-1 flex items-center gap-2 px-4 py-3 hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500">Internal</span>
                    {!internalOpen && internalUnread > 0 && (
                      <span className="min-w-[18px] h-[18px] bg-blue-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                        {internalUnread}
                      </span>
                    )}
                    <svg
                      className={`w-3.5 h-3.5 text-gray-400 ml-auto transition-transform duration-200 ${internalOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={onNewInternalChat}
                    title={atChatCapacity ? 'Chat capacity reached' : 'New internal message'}
                    disabled={atChatCapacity}
                    className="flex items-center justify-center w-10 h-10 mr-1 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {internalOpen && internalThreads.map(t => (
                  <ThreadItem
                    key={t.id}
                    thread={t}
                    selected={t.id === selectedId}
                    onClick={() => onSelect(t.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Call actions — anchored at bottom */}
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
          <SimulateInboundButton onSimulateInbound={onSimulateInbound} />
        )}
      </div>
    </div>
  );
}
