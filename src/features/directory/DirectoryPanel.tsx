import { useState } from 'react';
import type { DirectoryEntry, Thread } from '../../types';
import { mockDirectory } from '../../data/mockDirectory';
import { cn } from '../../utils/cn';

interface Props {
  mode: 'outbound' | 'active-call' | 'consult' | 'internal-chat' | 'chat-transfer';
  activeCustomerCall: Thread | null;
  onConsult: (entry: DirectoryEntry) => void;
  onTransfer: (entry: DirectoryEntry) => void;
  onOutboundCall: (entry: DirectoryEntry) => void;
  onStartInternalChat: (entry: DirectoryEntry) => void;
  onChatTransfer?: (entry: DirectoryEntry) => void;
  onChatTransferToQueue?: (queueName: string) => void;
  onDialNumber: (number: string) => void;
  onClose: () => void;
  transferSuggestion?: string;
}


export default function DirectoryPanel({
  mode,
  activeCustomerCall,
  onConsult,
  onDialNumber,
  onStartInternalChat,
  onClose,
}: Props) {
  const [dialInput, setDialInput] = useState('');
  const [tab, setTab] = useState<'dial' | 'message'>('dial');
  const [search, setSearch] = useState('');
  const [phonebookOpen, setPhonebookOpen] = useState(false);

  const isTransfer = mode === 'active-call';
  const isConsultMode = mode === 'consult';
  const showTabs = mode === 'outbound';
  const accentRing = isTransfer ? 'focus:ring-blue-300' : 'focus:ring-green-300';
  const actionBg   = isTransfer ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';

  const filtered = mockDirectory.filter(e =>
    !search.trim() ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Consult mode — agent list with Consult buttons */}
      {isConsultMode && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <p className="text-[11px] text-gray-500 mb-3">
              {activeCustomerCall
                ? <>Select an agent to consult while <span className="font-semibold text-gray-700">{activeCustomerCall.participantName}</span> is on hold.</>
                : 'Select an agent to consult.'}
            </p>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, team, or role…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No results</p>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => onConsult(entry)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                      entry.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {entry.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 leading-tight">{entry.name}</div>
                      <div className="text-[11px] text-gray-400 truncate">{entry.role} · {entry.department}</div>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">Consult</span>
                    <div className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      entry.available ? 'bg-green-400' : 'bg-gray-300'
                    )} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab switcher — only in outbound mode */}
      {showTabs && (
        <div className="flex border-b border-gray-100 flex-shrink-0 px-4 pt-3 gap-4">
          <button
            onClick={() => setTab('dial')}
            className={cn(
              'pb-2.5 text-[12px] font-semibold border-b-2 transition-colors',
              tab === 'dial'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            Dial
          </button>
          <button
            onClick={() => setTab('message')}
            className={cn(
              'pb-2.5 text-[12px] font-semibold border-b-2 transition-colors',
              tab === 'message'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            Message
          </button>
        </div>
      )}

      {/* Dial tab */}
      {!isConsultMode && (!showTabs || tab === 'dial') && (
        <div className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-4">
          {isTransfer && activeCustomerCall && (
            <p className="text-[11px] text-gray-500 leading-snug">
              Dial an external number to transfer{' '}
              <span className="font-semibold text-gray-700">{activeCustomerCall.participantName}</span>.
            </p>
          )}

          <input
            type="tel"
            placeholder="e.g. +44 7700 900123"
            value={dialInput}
            onChange={(e) => setDialInput(e.target.value)}
            autoFocus
            className={cn(
              'text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent',
              accentRing
            )}
          />

          <div className="grid grid-cols-3 gap-2">
            {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
              <button
                key={key}
                onClick={() => setDialInput(v => v + key)}
                className="h-12 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-base font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                {key}
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={() => setPhonebookOpen(true)}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Phonebook
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setDialInput(v => v.slice(0, -1))}
                disabled={!dialInput}
                className="flex items-center justify-center w-12 h-11 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors flex-shrink-0"
                title="Backspace"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                </svg>
              </button>
              <button
                onClick={() => dialInput.trim() && onDialNumber(dialInput.trim())}
                disabled={!dialInput.trim()}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 h-11 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
                  actionBg
                )}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                </svg>
                Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message tab */}
      {!isConsultMode && showTabs && tab === 'message' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, team, or role…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No results</p>
            ) : (
              <div className="flex flex-col gap-1">
                {filtered.map(entry => (
                  <button
                    key={entry.id}
                    onClick={() => onStartInternalChat(entry)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                      entry.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {entry.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 leading-tight">{entry.name}</div>
                      <div className="text-[11px] text-gray-400 truncate">{entry.role} · {entry.department}</div>
                    </div>
                    <div className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      entry.available ? 'bg-green-400' : 'bg-gray-300'
                    )} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phonebook placeholder modal */}
      {phonebookOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pointer-events-none">
          <div
            className="pointer-events-auto w-80 h-full bg-white border-l border-gray-200 shadow-2xl flex flex-col"
            style={{ maxHeight: '100vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-semibold text-gray-800">Phonebook</span>
              </div>
              <button
                onClick={() => setPhonebookOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Placeholder body */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700">Phonebook</p>
              <p className="text-xs text-gray-400 leading-relaxed">Contact directory and external phonebook will appear here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
