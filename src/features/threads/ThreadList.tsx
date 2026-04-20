import { useState } from 'react';
import type { Thread } from '../../types';
import ThreadItem from './ThreadItem';

interface Props {
  threads: Thread[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewCall: () => void;
  onNewInternalChat: () => void;
  wrapUpActive?: boolean;
  atChatCapacity?: boolean;
}

export default function ThreadList({ threads, selectedId, onSelect, onNewCall, onNewInternalChat, wrapUpActive, atChatCapacity }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);

  const customerThreads = threads.filter((t) => t.type === 'customer-chat');
  const internalThreads = threads.filter((t) => t.type === 'internal-chat');
  const internalUnread = internalThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  const isEmpty = customerThreads.length === 0 && internalThreads.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Scrollable thread area */}
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
              title={wrapUpActive ? 'Unavailable during wrap-up' : undefined}
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
            {customerThreads.map((t) => (
              <ThreadItem
                key={t.id}
                thread={t}
                selected={t.id === selectedId}
                onClick={() => onSelect(t.id)}
              />
            ))}

            {/* Internal section — collapsible */}
            {internalThreads.length > 0 && (
              <>
                {/* Internal section header — toggle + new chat */}
                <div className="flex items-center border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => setInternalOpen((o) => !o)}
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

                  {/* New internal chat */}
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

                {internalOpen && internalThreads.map((t) => (
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

      {/* Outbound Call — anchored at bottom */}
      <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3">
        <button
          onClick={onNewCall}
          disabled={wrapUpActive}
          title={wrapUpActive ? 'Unavailable during wrap-up' : undefined}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-blue-800 border border-blue-300 rounded-xl bg-transparent hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
          </svg>
          Outbound Call
        </button>
      </div>

    </div>
  );
}
