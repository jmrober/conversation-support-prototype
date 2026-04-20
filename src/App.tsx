import { useState, useEffect } from 'react';
import type { Thread, PresenceStatus, PanelType, DirectoryEntry } from './types';
import { mockThreads as initialThreads } from './data/mockThreads';
import { useWrapUpTimer } from './hooks/useWrapUpTimer';
import PresenceControl from './features/presence/PresenceControl';
import ThreadList from './features/threads/ThreadList';
import ConversationPanel from './features/conversation/ConversationPanel';
import WrapUpTimer from './features/call/WrapUpTimer';
import MiniCallBar from './features/call/MiniCallBar';
import CallSection from './features/call/CallSection';
import DirectoryPanel from './features/directory/DirectoryPanel';
import ResponseAssistPanel from './features/conversation/ResponseAssistPanel';

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

type View = 'list' | 'detail';

const MAX_CHATS = 3;

export default function App() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>('list');
  const [presence, setPresence] = useState<PresenceStatus>('available');
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [muted, setMuted] = useState(false);
  const [composerText, setComposerText] = useState('');

  const [wrapUpActive, setWrapUpActive] = useState(false);
  const [showWrapUpOverlay, setShowWrapUpOverlay] = useState(false);
  const [directoryIntent, setDirectoryIntent] = useState<'outbound' | 'internal-chat'>('outbound');
  const [railExpanded, setRailExpanded] = useState(false);
  const [assistTab, setAssistTab] = useState<'suggested' | 'library'>('suggested');

  const handleWrapUpEnd = () => {
    setWrapUpActive(false);
    setShowWrapUpOverlay(false);
    setPresence('available');
  };

  const wrapUpSecondsLeft = useWrapUpTimer(wrapUpActive, 30, handleWrapUpEnd);

  // Customer call (the external-facing call)
  const customerCall = threads.find(
    (t) =>
      t.type === 'customer-call' &&
      (t.status === 'active' || t.status === 'on-hold' || t.status === 'consulting' || t.status === 'transferring')
  ) ?? null;

  // Consult call (internal call during warm transfer)
  const consultCall = threads.find(
    (t) =>
      t.type === 'internal-call' &&
      t.status === 'active' &&
      !!t.consultingWithThreadId
  ) ?? null;

  const anyActiveCall = customerCall ?? consultCall ?? null;

  // Keyboard shortcuts: Escape → close panel, Ctrl+M → mute, Ctrl+H → hold
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activePanel) {
        setActivePanel(null);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        if (!customerCall && !consultCall) return;
        e.preventDefault();
        setMuted((m) => !m);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        if (!customerCall) return;
        e.preventDefault();
        setThreads((prev) =>
          prev.map((t) =>
            t.id === customerCall.id
              ? { ...t, status: t.status === 'on-hold' ? 'active' : 'on-hold' }
              : t
          )
        );
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePanel, customerCall, consultCall]);

  // Chats only in the list — calls handled by CallSection
  const displayedThreads = threads.filter(
    (t) =>
      t.status !== 'ended' &&
      t.status !== 'transferred' &&
      t.type !== 'customer-call' &&
      t.type !== 'internal-call'
  );

  // Only customer chats count toward the concurrent limit; internal chats are unlimited
  const activeChatCount = threads.filter(
    (t) =>
      t.type === 'customer-chat' &&
      t.status !== 'ended' &&
      t.status !== 'transferred'
  ).length;

  const selectedThread = threads.find((t) => t.id === selectedId) ?? null;

  // Show the full-call detail when selected thread IS a call
  const selectedIsCall =
    selectedThread?.type === 'customer-call' || selectedThread?.type === 'internal-call';

  // In chat detail: show MiniCallBar at top if on a call
  const showMiniCallBar =
    anyActiveCall !== null && view === 'detail' && !selectedIsCall;

  const consultingWithThread =
    selectedThread?.consultingWithThreadId
      ? (threads.find((t) => t.id === selectedThread.consultingWithThreadId) ?? null)
      : null;

  const activeCustomerCall =
    selectedThread?.type === 'customer-call' && selectedThread?.status === 'active'
      ? selectedThread
      : null;

  const updateThread = (id: string, updates: Partial<Thread>) =>
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

  const handleSelectThread = (id: string) => {
    setSelectedId(id);
    setView('detail');
    setActivePanel(null);
    setComposerText('');
    const t = threads.find((th) => th.id === id);
    if (t && t.unreadCount > 0) {
      updateThread(id, {
        unreadCount: 0,
        status: t.status === 'unread' ? 'active' : t.status,
      });
    }
  };

  const handleBack = () => {
    setView('list');
    setActivePanel(null);
  };

  const handlePresenceChange = (p: PresenceStatus) => {
    setPresence(p);
    if (p === 'wrap-up') {
      setWrapUpActive(true);
      setShowWrapUpOverlay(true);
    } else {
      setWrapUpActive(false);
      setShowWrapUpOverlay(false);
    }
  };

  const handleSendMessage = () => {
    if (!selectedId || !composerText.trim()) return;
    const thread = threads.find((t) => t.id === selectedId);
    if (!thread) return;
    updateThread(selectedId, {
      messages: [
        ...thread.messages,
        {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          senderName: 'You',
          text: composerText.trim(),
          timestamp: formatTime(new Date()),
        },
      ],
      lastMessage: composerText.trim(),
      timestamp: formatTime(new Date()),
    });
    setComposerText('');
  };

  const handleHoldToggle = () => {
    if (!selectedId) return;
    const t = threads.find((th) => th.id === selectedId);
    if (!t) return;
    updateThread(selectedId, { status: t.status === 'on-hold' ? 'active' : 'on-hold' });
  };

  const handleHoldToggleById = (id: string) => {
    const t = threads.find((th) => th.id === id);
    if (!t) return;
    updateThread(id, { status: t.status === 'on-hold' ? 'active' : 'on-hold' });
  };

  const handleEndCall = () => {
    if (!selectedId) return;
    const thread = threads.find((t) => t.id === selectedId);
    if (!thread) return;

    // Ending a consult returns to the customer call
    if (thread.consultingWithThreadId) {
      updateThread(selectedId, { status: 'ended' });
      updateThread(thread.consultingWithThreadId, { status: 'active' });
      setSelectedId(thread.consultingWithThreadId);
      return;
    }

    // Ending a customer call → wrap-up, go back to list
    updateThread(selectedId, { status: 'ended' });
    setSelectedId(null);
    setView('list');
    setWrapUpActive(true);
    setShowWrapUpOverlay(true);
    setPresence('wrap-up');
  };

  const handleEndCallById = (id: string) => {
    const thread = threads.find((t) => t.id === id);
    if (!thread) return;
    if (thread.consultingWithThreadId) {
      updateThread(id, { status: 'ended' });
      updateThread(thread.consultingWithThreadId, { status: 'active' });
      if (selectedId === id) {
        setSelectedId(thread.consultingWithThreadId);
      }
      return;
    }
    updateThread(id, { status: 'ended' });
    if (selectedId === id) {
      setSelectedId(null);
      setView('list');
    }
    setWrapUpActive(true);
    setShowWrapUpOverlay(true);
    setPresence('wrap-up');
  };

  const handleConsult = (entry: DirectoryEntry) => {
    if (!selectedId) return;
    updateThread(selectedId, { status: 'consulting' });

    const consultId = `consult-${Date.now()}`;
    const consultThread: Thread = {
      id: consultId,
      type: 'internal-call',
      status: 'active',
      participantName: entry.name,
      participantRole: entry.role,
      lastMessage: `Consult · ${entry.department}`,
      timestamp: formatTime(new Date()),
      unreadCount: 0,
      messages: [],
      callDirection: 'outbound',
      callStartedAt: Date.now(),
      consultingWithThreadId: selectedId,
    };

    setThreads((prev) => [...prev, consultThread]);
    setSelectedId(consultId);
    setActivePanel(null);
    setMuted(true); // auto-mute: customer is on hold, agent focuses on consult leg
  };

  const handleColdTransfer = (entry: DirectoryEntry) => {
    if (!selectedId) return;
    const customerThreadId = selectedId;

    updateThread(customerThreadId, {
      status: 'transferring',
      lastMessage: `Transferring to ${entry.name}`,
    });
    setActivePanel(null);

    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === customerThreadId ? { ...t, status: 'transferred' } : t
        )
      );
      setSelectedId((prev) => (prev === customerThreadId ? null : prev));
      setView('list');
    }, 2000);
  };

  const handleChatTransferToAgent = (entry: DirectoryEntry) => {
    if (!selectedId) return;
    updateThread(selectedId, {
      status: 'transferring',
      lastMessage: `Transferring to ${entry.name}`,
    });
    setActivePanel(null);
    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedId ? { ...t, status: 'transferred' } : t
        )
      );
      setSelectedId(null);
      setView('list');
    }, 1800);
  };

  const handleChatTransferToQueue = (queueName: string) => {
    if (!selectedId) return;
    updateThread(selectedId, {
      status: 'transferring',
      lastMessage: `Transferring to ${queueName}`,
    });
    setActivePanel(null);
    setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedId ? { ...t, status: 'transferred' } : t
        )
      );
      setSelectedId(null);
      setView('list');
    }, 1800);
  };

  const handleWarmTransfer = () => {
    if (!selectedId) return;
    const consultThread = threads.find((t) => t.id === selectedId);
    if (!consultThread?.consultingWithThreadId) return;

    const customerThreadId = consultThread.consultingWithThreadId;
    const consultId = selectedId;

    updateThread(customerThreadId, { status: 'transferred' });
    updateThread(consultId, { status: 'ended' });
    setSelectedId(null);
    setView('list');
  };

  const handleOutboundCall = (entry: DirectoryEntry) => {
    const callId = `call-${Date.now()}`;
    const callThread: Thread = {
      id: callId,
      type: 'customer-call',
      status: 'active',
      participantName: entry.name,
      participantRole: entry.role,
      lastMessage: 'Outbound call',
      timestamp: formatTime(new Date()),
      unreadCount: 0,
      messages: [],
      callDirection: 'outbound',
      callStartedAt: Date.now(),
    };

    setThreads((prev) => [...prev, callThread]);
    setSelectedId(callId);
    setView('detail');
    setActivePanel(null);
  };

  const handleDialNumber = (number: string) => {
    const callId = `call-${Date.now()}`;
    const callThread: Thread = {
      id: callId,
      type: 'customer-call',
      status: 'active',
      participantName: number,
      lastMessage: 'Outbound call',
      timestamp: formatTime(new Date()),
      unreadCount: 0,
      messages: [],
      callDirection: 'outbound',
      callStartedAt: Date.now(),
    };

    setThreads((prev) => [...prev, callThread]);
    setSelectedId(callId);
    setView('detail');
    setActivePanel(null);
  };

  const handleStartInternalChat = (entry: DirectoryEntry) => {
    const existing = threads.find(
      (t) => t.type === 'internal-chat' && t.participantName === entry.name && t.status !== 'ended'
    );
    if (existing) {
      setSelectedId(existing.id);
      setView('detail');
      setActivePanel(null);
      return;
    }
    if (activeChatCount >= MAX_CHATS) {
      setActivePanel(null);
      return;
    }
    const chatId = `internal-chat-${Date.now()}`;
    setThreads((prev) => [
      ...prev,
      {
        id: chatId,
        type: 'internal-chat',
        status: 'active',
        participantName: entry.name,
        participantRole: entry.role,
        lastMessage: '',
        timestamp: formatTime(new Date()),
        unreadCount: 0,
        messages: [],
      },
    ]);
    setSelectedId(chatId);
    setView('detail');
    setActivePanel(null);
  };

  const directoryMode = anyActiveCall ? 'active-call' : directoryIntent;
  const atChatCapacity = activeChatCount >= MAX_CHATS;

  return (
    <div className="flex h-screen bg-gray-200 items-stretch">
      <div
        style={{ width: railExpanded ? 640 : 380 }}
        className="flex-shrink-0 border-r border-gray-300 bg-white relative flex flex-col overflow-hidden shadow-xl transition-all duration-300 ease-in-out"
      >
        <PresenceControl
          presence={presence}
          onChange={handlePresenceChange}
          wrapUpSecondsLeft={wrapUpActive ? wrapUpSecondsLeft : undefined}
          expanded={railExpanded}
          onToggleExpand={() => setRailExpanded((e) => !e)}
        />

        {/* Wrap-up progress strip — visible after the overlay is dismissed */}
        {wrapUpActive && !showWrapUpOverlay && (
          <div className="flex items-center gap-3 px-4 py-2 bg-yellow-50 border-b border-yellow-200 flex-shrink-0">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-yellow-800">Wrap-Up · not accepting new contacts</span>
                <span className="text-[11px] font-bold tabular-nums text-yellow-800">{wrapUpSecondsLeft}s</span>
              </div>
              <div className="w-full h-1 bg-yellow-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(wrapUpSecondsLeft / 30) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleWrapUpEnd}
              className="text-[10px] font-semibold text-yellow-700 hover:text-yellow-900 flex-shrink-0 transition-colors"
            >
              Skip
            </button>
          </div>
        )}

        {/* Main view */}
        {view === 'list' ? (
          <>
            {/* Prominent call section — only visible when a call is active */}
            {(customerCall || consultCall) && (
              <CallSection
                customerCall={customerCall}
                consultCall={consultCall}
                muted={muted}
                onMuteToggle={() => setMuted((m) => !m)}
                onHoldToggle={handleHoldToggleById}
                onEndCall={handleEndCallById}
                onWarmTransfer={handleWarmTransfer}
                onOpenDirectory={() => setActivePanel('directory')}
                onSelectCall={handleSelectThread}
              />
            )}
            <ThreadList
              threads={displayedThreads}
              selectedId={selectedId}
              onSelect={handleSelectThread}
              onNewCall={() => { setDirectoryIntent('outbound'); setActivePanel('directory'); }}
              onNewInternalChat={() => { setDirectoryIntent('internal-chat'); setActivePanel('directory'); }}
              wrapUpActive={wrapUpActive}
              atChatCapacity={atChatCapacity}
            />
          </>
        ) : selectedThread ? (
          <>
            {/* Mini call bar — prominent, at TOP when viewing a chat while on a call */}
            {showMiniCallBar && (
              <MiniCallBar
                customerCall={customerCall}
                consultCall={consultCall}
                muted={muted}
                onMuteToggle={() => setMuted((m) => !m)}
                onHoldToggle={handleHoldToggleById}
                onEndCall={handleEndCallById}
                onSelectCall={handleSelectThread}
              />
            )}
            <ConversationPanel
              thread={selectedThread}
              consultingWithThread={consultingWithThread}
              composerText={composerText}
              muted={muted}
              onBack={handleBack}
              onComposerChange={setComposerText}
              onSendMessage={handleSendMessage}
              onHoldToggle={handleHoldToggle}
              onMuteToggle={() => setMuted((m) => !m)}
              onEndCall={handleEndCall}
              onWarmTransfer={handleWarmTransfer}
              onOpenDirectory={() => setActivePanel('directory')}
              onOpenResponseAssist={(tab) => { setAssistTab(tab); setActivePanel('responseassist'); }}
              onOpenChatTransfer={selectedThread?.type === 'customer-chat' ? () => setActivePanel('chat-transfer') : undefined}
              onStartCall={selectedThread && (selectedThread.type === 'customer-chat' || selectedThread.type === 'internal-chat') ? () => handleOutboundCall({ id: selectedThread.id, name: selectedThread.participantName, role: selectedThread.participantRole ?? '', department: '', extension: '', available: true, initials: '' }) : undefined}
            />
          </>
        ) : (
          <ThreadList
            threads={displayedThreads}
            selectedId={null}
            onSelect={handleSelectThread}
            onNewCall={() => { setDirectoryIntent('outbound'); setActivePanel('directory'); }}
            onNewInternalChat={() => { setDirectoryIntent('internal-chat'); setActivePanel('directory'); }}
          />
        )}

        {/* Wrap-up overlay */}
        {showWrapUpOverlay && (
          <WrapUpTimer
            remaining={wrapUpSecondsLeft}
            onSkip={handleWrapUpEnd}
            onDismiss={() => setShowWrapUpOverlay(false)}
          />
        )}

        {/* Overlay panels */}
        {activePanel === 'directory' && (
          <DirectoryPanel
            mode={directoryMode}
            activeCustomerCall={activeCustomerCall}
            onConsult={handleConsult}
            onTransfer={handleColdTransfer}
            onOutboundCall={handleOutboundCall}
            onStartInternalChat={handleStartInternalChat}
            onDialNumber={handleDialNumber}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'chat-transfer' && (
          <DirectoryPanel
            mode="chat-transfer"
            activeCustomerCall={null}
            onConsult={handleConsult}
            onTransfer={handleColdTransfer}
            onOutboundCall={handleOutboundCall}
            onStartInternalChat={handleStartInternalChat}
            onChatTransfer={handleChatTransferToAgent}
            onChatTransferToQueue={handleChatTransferToQueue}
            onDialNumber={handleDialNumber}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'responseassist' && selectedThread && (
          <ResponseAssistPanel
            thread={selectedThread}
            initialTab={assistTab}
            onInsert={(text) => { setComposerText(text); setActivePanel(null); }}
            onClose={() => setActivePanel(null)}
          />
        )}
      </div>

      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm select-none">
        Agent Workbench
      </div>
    </div>
  );
}
