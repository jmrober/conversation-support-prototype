import { useState } from 'react';
import type { DirectoryEntry, QueueEntry, Thread } from '../../types';
import { mockDirectory, mockQueues } from '../../data/mockDirectory';
import { cn } from '../../utils/cn';

interface Props {
  mode: 'outbound' | 'active-call' | 'internal-chat' | 'chat-transfer';
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

const HEADER_LABEL: Record<string, string> = {
  outbound: 'New Call',
  'active-call': 'Transfer Call',
  'internal-chat': 'New Message',
  'chat-transfer': 'Transfer Chat',
};

// ── Queue card — rich detail view ─────────────────────────────────────────────
function QueueCard({ queue, mode, onTransferToQueue }: {
  queue: QueueEntry;
  mode: string;
  onTransferToQueue?: (name: string) => void;
}) {
  return (
    <div className="mx-4 my-3 rounded-xl border border-gray-100 bg-white overflow-hidden">
      {/* Queue header */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl flex-shrink-0">
          {queue.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{queue.name}</span>
            <span className={cn(
              'text-[10px] font-bold px-2 py-0.5 rounded-full leading-none',
              queue.available
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            )}>
              {queue.available ? 'Available' : 'Closed'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[11px] text-gray-400">{queue.workingHours}</span>
          </div>
        </div>
      </div>

      {/* Handles / Doesn't handle */}
      <div className="grid grid-cols-2 gap-px bg-gray-100 border-t border-gray-100">
        <div className="bg-white px-3 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Handles</p>
          <ul className="flex flex-col gap-1.5">
            {queue.handles.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <svg className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[11px] text-gray-600 leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white px-3 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Doesn't handle</p>
          <ul className="flex flex-col gap-1.5">
            {queue.doesNotHandle.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <svg className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-[11px] text-gray-500 leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action */}
      {mode === 'chat-transfer' && (
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => onTransferToQueue?.(queue.name)}
            disabled={!queue.available}
            className={cn(
              'w-full h-9 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors',
              queue.available
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {queue.available ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Transfer to {queue.short}
              </>
            ) : 'Queue closed'}
          </button>
        </div>
      )}
    </div>
  );
}

const DEPARTMENTS = ['All', ...Array.from(new Set(mockDirectory.map((e) => e.department))).sort()];
const FAVORITES_KEY = '__favorites__';
const RECENT_KEY = '__recent__';

export default function DirectoryPanel({
  mode,
  activeCustomerCall,
  onConsult,
  onTransfer,
  onOutboundCall,
  onStartInternalChat,
  onChatTransfer,
  onChatTransferToQueue,
  onDialNumber,
  onClose,
  transferSuggestion,
}: Props) {
  const [query, setQuery] = useState('');
  const [dialInput, setDialInput] = useState('');
  const [callTab, setCallTab] = useState<'directory' | 'dial'>('directory');
  const [directoryTab, setDirectoryTab] = useState<'people' | 'queues'>('people');
  const [dept, setDept] = useState('All');

  // Favorites — persisted to localStorage
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('workbench-favorites');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  // Recent contacts — session-only (last 5)
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('workbench-recent');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Cold transfer confirmation
  const [coldTarget, setColdTarget] = useState<DirectoryEntry | null>(null);
  // Warm transfer: inline confirm (no full-screen preview)
  const [warmConfirmId, setWarmConfirmId] = useState<string | null>(null);
  // Chat-transfer: selected queue (null = show person directory)
  const [_selectedQueueId, setSelectedQueueId] = useState<string | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('workbench-favorites', JSON.stringify([...next]));
      return next;
    });
  };

  const addRecent = (id: string) => {
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((i) => i !== id)].slice(0, 5);
      sessionStorage.setItem('workbench-recent', JSON.stringify(next));
      return next;
    });
  };

  const filtered = (() => {
    let list = mockDirectory;
    if (dept === FAVORITES_KEY) {
      list = list.filter((e) => favorites.has(e.id));
    } else if (dept === RECENT_KEY) {
      const recentSet = new Set(recentIds);
      list = list.filter((e) => recentSet.has(e.id));
      list = [...list].sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id));
    } else if (dept !== 'All') {
      list = list.filter((e) => e.department === dept);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) =>
        `${e.name} ${e.role} ${e.department} ${e.extension}`.toLowerCase().includes(q)
      );
    }
    return list;
  })();

  const confirmCold = () => {
    if (coldTarget) {
      addRecent(coldTarget.id);
      onTransfer(coldTarget);
      setColdTarget(null);
    }
  };

  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={coldTarget ? () => setColdTarget(null) : onClose}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-sm font-semibold text-gray-700">{HEADER_LABEL[mode]}</span>
      </div>

      {/* ── COLD TRANSFER CONFIRMATION ── */}
      {coldTarget && (
        <div className="flex-1 flex flex-col px-5 pt-6 pb-8">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-5">Transfer to Queue or Person</p>
          <div className="flex flex-col gap-4 mb-6">
            {[
              {
                n: '1',
                title: `${activeCustomerCall?.participantName ?? 'Customer'} is connected to ${coldTarget.name}`,
                sub: `${coldTarget.role} · ${coldTarget.department} · ext. ${coldTarget.extension}`,
              },
              {
                n: '2',
                title: 'Your call ends immediately',
                sub: 'You enter wrap-up and become unavailable for new contacts.',
              },
            ].map(({ n, title, sub }) => (
              <div key={n} className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mb-5 leading-relaxed">
            You won't be on the call once the transfer completes. Use Warm transfer to brief {coldTarget.name} first.
          </p>
          <div className="flex gap-2 mt-auto">
            <button onClick={() => setColdTarget(null)} className="flex-1 h-11 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={confirmCold} className="flex-1 h-11 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">Confirm Transfer</button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      {!coldTarget && (
        <>
          {/* Active-call: Directory / Dial tab strip */}
          {mode === 'active-call' && (
            <div className="flex border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setCallTab('directory')}
                className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors', callTab === 'directory' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600')}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Directory
              </button>
              <button
                onClick={() => setCallTab('dial')}
                className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors', callTab === 'dial' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600')}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Dial
              </button>
            </div>
          )}

          {/* Dial tab */}
          {mode === 'active-call' && callTab === 'dial' && (
            <div className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-4">
              {activeCustomerCall && (
                <p className="text-[11px] text-gray-500 leading-snug">
                  Dial an external number to cold-transfer <span className="font-semibold text-gray-700">{activeCustomerCall.participantName}</span>. Your call will end when the transfer completes.
                </p>
              )}
              <input type="tel" placeholder="e.g. +44 7700 900123" value={dialInput} onChange={(e) => setDialInput(e.target.value)} autoFocus className="text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent" />
              <div className="grid grid-cols-3 gap-2">
                {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
                  <button key={key} onClick={() => setDialInput((v) => v + key)} className="h-12 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-base font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors">{key}</button>
                ))}
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => setDialInput((v) => v.slice(0, -1))} disabled={!dialInput} className="flex items-center justify-center w-12 h-11 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors flex-shrink-0" title="Backspace">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
                </button>
                <button onClick={() => dialInput.trim() && onDialNumber(dialInput.trim())} disabled={!dialInput.trim()} className="flex-1 flex items-center justify-center gap-2 h-11 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" /></svg>
                  Transfer to {dialInput || 'number'}
                </button>
              </div>
            </div>
          )}

          {/* Outbound dial input */}
          {mode === 'outbound' && (
            <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <p className="text-[11px] text-gray-500 mb-2">Enter a number or select a contact below.</p>
              <div className="flex gap-2">
                <input type="tel" placeholder="e.g. +44 7700 900123" value={dialInput} onChange={(e) => setDialInput(e.target.value)} className="flex-1 text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent" />
                <button onClick={() => dialInput.trim() && onDialNumber(dialInput.trim())} disabled={!dialInput.trim()} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" /></svg>
                  Dial
                </button>
              </div>
            </div>
          )}

          {/* Internal chat context banner */}
          {mode === 'internal-chat' && (
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
              <p className="text-[11px] text-blue-800 leading-snug">Select a colleague to open a private message thread.</p>
            </div>
          )}


          {/* Directory list */}
          {(mode !== 'active-call' || callTab === 'directory') && (
            <>
              {/* People / Queues tab strip — hidden for internal-chat */}
              {mode !== 'internal-chat' && (
                <div className="flex border-b border-gray-100 flex-shrink-0">
                  <button
                    onClick={() => setDirectoryTab('people')}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold border-b-2 transition-colors',
                      directoryTab === 'people' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    People
                  </button>
                  <button
                    onClick={() => setDirectoryTab('queues')}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold border-b-2 transition-colors',
                      directoryTab === 'queues' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Queues
                  </button>
                </div>
              )}

              {/* ── Queues tab ── */}
              {directoryTab === 'queues' && mode !== 'internal-chat' ? (
                <div className="flex-1 overflow-y-auto py-1">
                  {mockQueues.map((q) => (
                    <QueueCard
                      key={q.id}
                      queue={q}
                      mode={mode}
                      onTransferToQueue={onChatTransferToQueue}
                    />
                  ))}
                </div>
              ) : (
              <>
              {/* Transfer recommendation banner — active-call mode only */}
              {mode === 'active-call' && transferSuggestion && (
                <div className="mx-4 mt-3 flex items-center gap-2.5 px-3 py-2.5 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex-shrink-0">
                  <span className="text-blue-600 text-sm flex-shrink-0">⚡</span>
                  <span className="flex-1 text-[11px] font-semibold text-blue-800 leading-tight">
                    Recommended: {transferSuggestion}
                  </span>
                  <button
                    onClick={() => {
                      // Find the queue entry by name match and trigger cold transfer
                      // For now, we signal a queue transfer via a synthetic entry
                      onClose();
                    }}
                    className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Transfer
                  </button>
                </div>
              )}

              <div className="px-4 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
                {/* Search */}
                <div className="relative mb-3">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, role, or department…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-8 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                  />
                </div>

                {/* Filter chips — Favorites, then departments */}
                <div className="flex flex-wrap gap-1.5">
                  {/* Favorites chip */}
                  <button
                    onClick={() => { setSelectedQueueId(null); setDept(dept === FAVORITES_KEY ? 'All' : FAVORITES_KEY); }}
                    className={cn(
                      'flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-full border transition-colors',
                      dept === FAVORITES_KEY
                        ? 'bg-amber-400 text-white border-amber-400'
                        : favorites.size > 0
                        ? 'bg-white text-amber-600 border-amber-300 hover:border-amber-400'
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-500'
                    )}
                  >
                    <svg
                      className="w-3 h-3 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill={dept === FAVORITES_KEY || favorites.size > 0 ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Favorites
                    {favorites.size > 0 && (
                      <span className={cn(
                        'text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0',
                        dept === FAVORITES_KEY ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-700'
                      )}>
                        {favorites.size}
                      </span>
                    )}
                  </button>

                  {/* Department chips */}
                  {DEPARTMENTS.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setSelectedQueueId(null); setDept(d); }}
                      className={cn(
                        'text-xs font-medium px-3 py-2 rounded-full border transition-colors',
                        dept === d
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
                    {dept === FAVORITES_KEY ? (
                      <>
                        <svg className="w-8 h-8 text-gray-200" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <p className="text-xs text-gray-400">No favourites yet.<br />Tap the ☆ on any contact to save them here.</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">No contacts found</p>
                    )}
                  </div>
                ) : (
                  filtered.map((entry) => {
                    const isFav = favorites.has(entry.id);
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3.5 border-b border-gray-100',
                          !entry.available && mode !== 'internal-chat' && 'opacity-50'
                        )}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                            mode === 'internal-chat'
                              ? 'bg-slate-100 text-slate-700'
                              : entry.available ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          )}>
                            {entry.initials}
                          </div>
                          <span className={cn(
                            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white',
                            entry.available ? 'bg-green-500' : 'bg-gray-300'
                          )} />
                        </div>

                        {/* Name + role */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-900 leading-tight truncate">{entry.name}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 leading-tight">{entry.role} · {entry.department}</div>
                        </div>

                        {/* Favourite star */}
                        <button
                          onClick={() => toggleFavorite(entry.id)}
                          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
                          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-amber-400 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill={isFav ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={isFav ? 0 : 1.75}
                            style={{ color: isFav ? '#f59e0b' : undefined }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {mode !== 'internal-chat' && (
                            <span className="text-[11px] font-mono text-gray-400 mr-0.5">{entry.extension}</span>
                          )}

                          {mode === 'internal-chat' && (
                            <button
                              onClick={() => onStartInternalChat(entry)}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors bg-blue-700 text-white hover:bg-blue-800"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Message
                            </button>
                          )}

                          {mode === 'chat-transfer' && (
                            <button
                              onClick={() => onChatTransfer?.(entry)}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors bg-blue-700 text-white hover:bg-blue-800"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                              Transfer
                            </button>
                          )}

                          {mode === 'outbound' && (
                            <button
                              onClick={() => onOutboundCall(entry)}
                              disabled={!entry.available}
                              className={cn(
                                'flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors',
                                entry.available
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              )}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                              </svg>
                              Call
                            </button>
                          )}

                          {mode === 'active-call' && (
                            warmConfirmId === entry.id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setWarmConfirmId(null)}
                                  className="text-[11px] font-medium px-2.5 h-9 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    addRecent(entry.id);
                                    onConsult(entry);
                                    setWarmConfirmId(null);
                                    onClose();
                                  }}
                                  className="text-[11px] font-semibold px-2.5 h-9 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                  Start Consult
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => entry.available && setColdTarget(entry)}
                                  disabled={!entry.available}
                                  className={cn(
                                    'text-[11px] font-semibold px-3 h-9 rounded-md border transition-colors',
                                    entry.available
                                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                      : 'border-gray-200 text-gray-300 cursor-not-allowed'
                                  )}
                                >
                                  Transfer
                                </button>
                                <button
                                  onClick={() => entry.available && setWarmConfirmId(entry.id)}
                                  disabled={!entry.available}
                                  className={cn(
                                    'text-[11px] font-semibold px-3 h-9 rounded-md transition-colors',
                                    entry.available
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                  )}
                                >
                                  Consult
                                </button>
                              </>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
