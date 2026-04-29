import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { cn } from '../utils/cn';
import type { Thread, PresenceStatus } from '../types';

// ── Real component imports ────────────────────────────────────────────────────
import PresenceControl from '../features/presence/PresenceControl';
import ThreadItem from '../features/threads/ThreadItem';
import ContextStrip from '../features/conversation/ContextStrip';
import ChatComposer from '../features/conversation/ChatComposer';
import ShareCartPanel from '../features/conversation/ShareCartPanel';
import ResponseAssistPanel from '../features/conversation/ResponseAssistPanel';
import WrapUpTimer from '../features/call/WrapUpTimer';
import InboundCallAlert from '../features/call/InboundCallAlert';
import DirectoryPanel from '../features/directory/DirectoryPanel';

type AppPage = 'scenarios' | 'patterns' | 'prototype';

interface Props {
  onNavigate: (page: AppPage) => void;
}

const mono: CSSProperties = { fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' };
const sans: CSSProperties = { fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif' };

// ── Mock data ─────────────────────────────────────────────────────────────────
const NOW = Date.now();
const ts = (agoMs: number) => new Date(NOW - agoMs).toISOString();
const msg = (id: string, sender: 'agent' | 'customer' | 'system' | 'internal', name: string, text: string, agoMs: number) =>
  ({ id, sender, senderName: name, text, timestamp: ts(agoMs) });

const DEMO_CHAT: Thread = {
  id: 'demo-chat', type: 'customer-chat', status: 'active',
  participantName: 'Sarah Chen', caseId: '#CS-1042',
  lastMessage: "I need this resolved urgently — this is the third time.",
  timestamp: ts(120000), unreadCount: 0,
  messages: [
    msg('m1', 'customer', 'Sarah Chen', "Hi, I've been charged twice for my subscription this month.", 180000),
    msg('m2', 'system', 'System', 'Agent joined the conversation', 160000),
    msg('m3', 'agent', 'Jordan Riley', "Hi Sarah! Let me check your billing history right away.", 140000),
    msg('m4', 'customer', 'Sarah Chen', "I need this resolved urgently — this is the third time.", 120000),
  ],
  sentiment: 'escalating', issueTag: 'Billing Dispute', accountTier: 'gold',
  chatMode: 'live', slaDeadlineAt: NOW + 4 * 60 * 1000,
};

const DEMO_WAITING: Thread = {
  id: 'demo-waiting', type: 'customer-chat', status: 'waiting',
  participantName: 'Marcus Webb', lastMessage: 'Waiting for agent...',
  timestamp: ts(7 * 60000), unreadCount: 2, messages: [],
  issueTag: 'Order Inquiry', accountTier: 'standard',
  slaDeadlineAt: NOW + 4.5 * 60 * 1000,
};

const DEMO_ESCALATED: Thread = {
  id: 'demo-escalated', type: 'customer-chat', status: 'escalated',
  participantName: 'Emma Rodriguez', lastMessage: 'This is absolutely unacceptable!',
  timestamp: ts(3 * 60000), unreadCount: 3, messages: [],
  sentiment: 'escalating', issueTag: 'Equipment Failure', accountTier: 'premium',
  slaDeadlineAt: NOW + 90 * 1000,
};

const DEMO_IDLE: Thread = {
  id: 'demo-idle', type: 'customer-chat', status: 'idle',
  participantName: 'James Park', lastMessage: 'Thanks, that helps.',
  timestamp: ts(18 * 60000), unreadCount: 0, messages: [],
  issueTag: 'Product Question', accountTier: 'standard',
};

const DEMO_INTERNAL: Thread = {
  id: 'demo-internal', type: 'internal-chat', status: 'active',
  participantName: 'Alex Rodriguez', participantRole: 'Senior Support',
  lastMessage: "I can take the transfer — connect her through.",
  timestamp: ts(5 * 60000), unreadCount: 0, messages: [],
};

const DEMO_INBOUND_CALL: Thread = {
  id: 'demo-inbound', type: 'customer-call', status: 'ringing',
  participantName: 'Emma Thompson', lastMessage: 'Inbound call',
  timestamp: ts(0), unreadCount: 0, messages: [],
  callDirection: 'inbound', accountTier: 'premium', issueTag: 'Billing Support',
};

const DEMO_PREMIUM_CHAT: Thread = {
  id: 'demo-premium', type: 'customer-chat', status: 'active',
  participantName: 'Carlos Mendes', caseId: '#CS-2891',
  lastMessage: 'The promo code still isn\'t applying.',
  timestamp: ts(45000), unreadCount: 1,
  messages: [
    msg('p1', 'customer', 'Carlos Mendes', "Hi, I have a promo code SAVE20 but it's not applying at checkout.", 90000),
    msg('p2', 'agent', 'Jordan Riley', "Let me look into that code for you right away.", 60000),
    msg('p3', 'customer', 'Carlos Mendes', "The promo code still isn't applying.", 45000),
  ],
  sentiment: 'negative', issueTag: 'Promo Code', accountTier: 'premium',
  chatMode: 'live', slaDeadlineAt: NOW + 6 * 60 * 1000,
};

// ── Shared helpers ────────────────────────────────────────────────────────────

function ModalContainer({ children, bg = '#f3f4f6', height = 480 }: { children: React.ReactNode; bg?: string; height?: number }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 380, height, overflow: 'hidden', backgroundColor: bg, borderRadius: 8, border: '1px solid #e5e7eb' }}>
      <div style={{ padding: 16, opacity: 0.25 }}>
        <div style={{ height: 48, background: '#d1d5db', borderRadius: 4, marginBottom: 12 }} />
        <div style={{ height: 80, background: '#d1d5db', borderRadius: 4, marginBottom: 12 }} />
        <div style={{ height: 40, background: '#d1d5db', borderRadius: 4 }} />
      </div>
      {children}
    </div>
  );
}

function RailBox({ children, height = 'auto', maxHeight = 520 }: { children: React.ReactNode; height?: number | 'auto'; maxHeight?: number }) {
  return (
    <div style={{
      width: '100%', maxWidth: 380, height: height === 'auto' ? 'auto' : height,
      maxHeight, overflow: 'hidden', border: '1px solid #e5e7eb',
      borderRadius: 8, backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {children}
    </div>
  );
}

// ── Demo components ───────────────────────────────────────────────────────────

function PresenceAvailableDemo() {
  const [presence, setPresence] = useState<PresenceStatus>('available');
  return (
    <RailBox>
      <PresenceControl presence={presence} onChange={setPresence} />
      <div className="px-4 py-3 text-xs text-gray-400" style={mono}>Click status to open dropdown</div>
    </RailBox>
  );
}

function PresenceWrapUpDemo() {
  const [presence, setPresence] = useState<PresenceStatus>('wrap-up');
  const [secs, setSecs] = useState(18);
  const running = useRef(true);
  useEffect(() => {
    const id = setInterval(() => {
      if (!running.current) return;
      setSecs(s => (s <= 1 ? 30 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <RailBox>
      <PresenceControl presence={presence} onChange={setPresence} wrapUpSecondsLeft={secs} />
      <div className="px-4 py-3 text-xs text-gray-400" style={mono}>Timer ticks live — loops for demo</div>
    </RailBox>
  );
}

function ThreadActiveDemo() {
  const [selected, setSelected] = useState(false);
  return (
    <RailBox>
      <ThreadItem thread={DEMO_CHAT} selected={selected} onClick={() => setSelected(s => !s)} />
    </RailBox>
  );
}

function ThreadWaitingDemo() {
  return <RailBox><ThreadItem thread={DEMO_WAITING} selected={false} onClick={() => {}} /></RailBox>;
}

function ThreadEscalatedDemo() {
  return <RailBox><ThreadItem thread={DEMO_ESCALATED} selected={false} onClick={() => {}} /></RailBox>;
}

function ThreadIdleDemo() {
  return (
    <RailBox>
      <ThreadItem thread={DEMO_IDLE} selected={false} onClick={() => {}} />
      <ThreadItem thread={DEMO_INTERNAL} selected={false} onClick={() => {}} />
    </RailBox>
  );
}

function CallActiveDemo() {
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(154);
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return (
    <RailBox>
      <div className="bg-slate-900 px-4 pt-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">↙ Inbound · Live Call</div>
            <div className="text-base font-bold text-white">David Kim</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Customer Support</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white tabular-nums" style={mono}>{fmt(elapsed)}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">Live</div>
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Hold', icon: '⏸' },
            { label: muted ? 'Unmute' : 'Mute', icon: muted ? '🔇' : '🎤', action: () => setMuted(m => !m), active: muted },
            { label: 'Transfer', icon: '↗' },
            { label: 'Consult', icon: '👤' },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action}
              className={cn('flex-1 py-2 text-[11px] font-semibold transition-colors', btn.active ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600')}>
              {btn.label}
            </button>
          ))}
          <button className="flex-1 py-2 text-[11px] font-bold bg-red-600 text-white">End</button>
        </div>
      </div>
      <div className="px-4 py-3 text-xs text-gray-400" style={mono}>Timer ticks live · click Mute to toggle</div>
    </RailBox>
  );
}

function ConsultTransferDemo() {
  const [confirmed, setConfirmed] = useState(false);
  return (
    <RailBox>
      <div className="bg-slate-900 px-4 pt-4 pb-3">
        <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-2">⏸ Customer On Hold</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-white">David Kim</span>
          <span className="text-xs font-bold text-amber-400 tabular-nums" style={mono}>04:15</span>
        </div>
      </div>
      <div className="bg-slate-800 px-4 pt-3 pb-3 border-t border-slate-700">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Internal Consult</div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold text-white">Alex Rodriguez</div>
            <div className="text-[11px] text-slate-400">Senior Support</div>
          </div>
          <span className="text-xs font-bold text-slate-300 tabular-nums" style={mono}>01:22</span>
        </div>
        {!confirmed ? (
          <button onClick={() => setConfirmed(true)} className="w-full py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Transfer David to Alex →
          </button>
        ) : (
          <div className="w-full py-2 text-xs font-bold text-center bg-green-600 text-white">✓ Transfer Confirmed</div>
        )}
        <button onClick={() => setConfirmed(false)} className="w-full mt-1.5 py-1.5 text-xs font-medium text-slate-400 border border-slate-700 hover:bg-slate-700 transition-colors">
          End Consult
        </button>
      </div>
      <div className="px-4 py-3 text-xs text-gray-400" style={mono}>Click button to confirm warm transfer</div>
    </RailBox>
  );
}

function HoldTransitionDemo() {
  const [onHold, setOnHold] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className={cn('w-full max-sm border px-4 py-4 transition-all duration-500', onHold ? 'bg-amber-50 border-amber-200' : 'bg-slate-900 border-slate-700')} style={{ maxWidth: 380 }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className={cn('text-[10px] font-bold uppercase tracking-wider mb-0.5 transition-colors duration-300', onHold ? 'text-amber-600' : 'text-blue-400')} style={mono}>
              {onHold ? '⏸ On Hold' : '● Live Call'}
            </div>
            <div className={cn('text-sm font-bold transition-colors duration-300', onHold ? 'text-amber-900' : 'text-white')}>Carol Davis</div>
          </div>
          <div className={cn('text-sm tabular-nums font-bold transition-colors duration-300', onHold ? 'text-amber-700' : 'text-white')} style={mono}>4:22</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOnHold(h => !h)}
            className={cn('flex-1 h-9 text-xs font-bold transition-all duration-300', onHold ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600')}>
            {onHold ? 'Resume' : 'Hold'}
          </button>
          <button className={cn('flex-1 h-9 text-xs font-bold transition-colors duration-300', onHold ? 'bg-amber-100 text-amber-700' : 'bg-slate-700 text-slate-200')}>Mute</button>
          <button className="flex-1 h-9 text-xs font-bold bg-red-600 text-white">End</button>
        </div>
      </div>
      <p className="text-xs text-gray-400" style={mono}>Click Hold to toggle — 500ms crossfade</p>
    </div>
  );
}

function InboundAlertDemoWrapper() {
  const [key, setKey] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-32 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-300 w-full max-w-sm" style={mono}>ALERT DISMISSED</div>
        <button onClick={() => { setDismissed(false); setKey(k => k + 1); }} style={mono} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 transition-colors">↺ Show Again</button>
      </div>
    );
  }
  return (
    <ModalContainer height={420}>
      <InboundCallAlert key={key} call={DEMO_INBOUND_CALL} onAccept={() => setDismissed(true)} onReject={() => setDismissed(true)} />
    </ModalContainer>
  );
}

function WrapUpTimerDemoWrapper() {
  const [remaining, setRemaining] = useState(25);
  const [done, setDone] = useState(false);
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setRemaining(r => (r <= 1 ? (setDone(true), 0) : r - 1)), 1000);
    return () => clearInterval(id);
  }, [done, key]);
  const reset = () => { setDone(false); setRemaining(25); setKey(k => k + 1); };
  if (done) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-32 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-300 w-full max-w-sm" style={mono}>WRAP-UP COMPLETE</div>
        <button onClick={reset} style={mono} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 transition-colors">↺ Restart</button>
      </div>
    );
  }
  return (
    <ModalContainer height={500}>
      <WrapUpTimer key={key} remaining={remaining} participantName="Carol Davis" issueTag="Billing Dispute" onComplete={reset} onSkip={reset} onDismiss={reset} />
    </ModalContainer>
  );
}

function SentimentAlertDemo() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const show = () => { setDismissed(false); setVisible(false); setTimeout(() => setVisible(true), 50); };
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-sm overflow-hidden">
        <div className={cn('transition-all duration-300 ease-out', visible && !dismissed ? 'opacity-100 translate-y-0 max-h-24' : 'opacity-0 -translate-y-2 max-h-0')}>
          <div className="flex items-start gap-2.5 px-4 py-2.5 bg-red-50 border border-red-100">
            <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-700">Sentiment escalating — customer is upset</p>
              <p className="text-[10px] text-gray-500 mt-0.5">AI: Acknowledge frustration before troubleshooting.</p>
            </div>
            <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 mt-0.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        {(!visible || dismissed) && (
          <div className="h-16 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-300" style={mono}>ALERT APPEARS HERE</div>
        )}
      </div>
      <button onClick={show} style={mono} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 transition-colors">↺ Show Alert</button>
    </div>
  );
}

function SLACountdownDemo() {
  const [secs, setSecs] = useState(45);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => setSecs(s => { if (s <= 1) { setRunning(false); return 0; } return s - 1; }), 80);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);
  const pct = (secs / 45) * 100;
  const urgent = secs <= 15;
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-sm">
        <div className={cn('flex items-center gap-2 text-xs font-bold px-3 py-2 border transition-colors duration-300', urgent ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-800')}>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="flex-1">SLA · Response Due</span>
          <span className="tabular-nums" style={mono}>{secs}s</span>
        </div>
        <div className="h-1 bg-gray-100 mt-1.5 overflow-hidden">
          <div className={cn('h-full transition-all duration-75 ease-linear', urgent ? 'bg-red-400' : 'bg-amber-400')} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <button onClick={() => { setSecs(45); setRunning(true); }} style={mono} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 transition-colors">↺ Replay</button>
    </div>
  );
}

function ContextStripDemo() {
  return (
    <RailBox>
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="text-sm font-semibold text-gray-900">Sarah Chen</div>
        <div className="text-xs text-gray-400">#CS-1042 · Billing Dispute</div>
      </div>
      <ContextStrip thread={DEMO_CHAT} />
      <div className="px-4 py-3 text-xs text-gray-400" style={mono}>Click strip to expand / collapse</div>
    </RailBox>
  );
}

function MessageBubblesDemo() {
  return (
    <RailBox>
      <div className="p-4 space-y-3 bg-gray-50">
        <div className="flex gap-2 items-end">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white">SC</div>
          <div className="bg-white text-gray-800 text-sm px-3 py-2 rounded-2xl rounded-bl-md shadow-sm max-w-[80%] leading-relaxed">
            Hi, I've been charged twice for my subscription this month.
          </div>
        </div>
        <div className="flex justify-center">
          <span className="text-[10px] text-gray-400 italic">Agent joined the conversation</span>
        </div>
        <div className="flex gap-2 items-end flex-row-reverse">
          <div className="w-7 h-7 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-gray-600">JR</div>
          <div className="bg-blue-600 text-white text-sm px-3 py-2 rounded-2xl rounded-br-md max-w-[80%] leading-relaxed">
            Hi Sarah! I can see the issue — let me check your billing history right away.
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white">SC</div>
          <div className="bg-white text-gray-800 text-sm px-3 py-2 rounded-2xl rounded-bl-md shadow-sm max-w-[80%] leading-relaxed">
            I need this resolved urgently.
          </div>
        </div>
      </div>
    </RailBox>
  );
}

function ChatComposerDemo() {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const handleSend = () => {
    if (!value.trim()) return;
    setSent(s => [...s, value]);
    setValue('');
  };
  return (
    <RailBox>
      {sent.length > 0 && (
        <div className="p-3 bg-gray-50 border-b border-gray-100 space-y-1 max-h-28 overflow-y-auto">
          {sent.map((m, i) => (
            <div key={i} className="ml-auto bg-blue-600 text-white text-xs px-3 py-1.5 rounded-2xl rounded-br-md max-w-[80%] w-fit">{m}</div>
          ))}
        </div>
      )}
      <ChatComposer value={value} onChange={setValue} onSend={handleSend} onAISuggest={() => {}} onQuickReplies={() => {}} onShareCart={() => {}} recipientName="Sarah Chen" />
      <div className="px-4 py-2 text-xs text-gray-400" style={mono}>Type and press Enter or Send</div>
    </RailBox>
  );
}

function MessageFadeDemo() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi, I need help with my order.', agent: false },
    { id: 2, text: "Of course! What's the order number?", agent: true },
  ]);
  const [nextId, setNextId] = useState(3);
  const addMessage = () => {
    setMessages(m => [...m, { id: nextId, text: nextId % 2 === 1 ? "It's ORD-78234 — it never arrived." : 'I can see it now — let me check the status.', agent: nextId % 2 === 0 }]);
    setNextId(n => n + 1);
  };
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-sm bg-gray-50 p-3 space-y-2 max-h-48 overflow-y-auto border border-gray-100 rounded-lg">
        {messages.map((m, i) => (
          <div key={m.id} className={cn('text-xs px-3 py-2 leading-relaxed max-w-[85%] rounded-xl', m.agent ? 'bg-blue-600 text-white ml-auto rounded-br-md' : 'bg-white text-gray-800 shadow-sm rounded-bl-md')}
            style={i === messages.length - 1 ? { animation: 'fadeSlideIn 0.3s ease-out' } : {}}>
            {m.text}
          </div>
        ))}
      </div>
      <button onClick={addMessage} style={mono} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 transition-colors">+ Send Message</button>
      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function ResponseAssistAIDemo() {
  const [inserted, setInserted] = useState('');
  return (
    <div className="w-full max-w-sm">
      {inserted && (
        <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
          <span className="font-semibold">Inserted: </span>{inserted.slice(0, 60)}…
        </div>
      )}
      <RailBox maxHeight={420}>
        <ResponseAssistPanel thread={DEMO_CHAT} initialTab="suggested" onInsert={t => setInserted(t)} onClose={() => {}} />
      </RailBox>
    </div>
  );
}

function ResponseAssistLibraryDemo() {
  const [inserted, setInserted] = useState('');
  return (
    <div className="w-full max-w-sm">
      {inserted && (
        <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
          <span className="font-semibold">Inserted: </span>{inserted.slice(0, 60)}…
        </div>
      )}
      <RailBox maxHeight={420}>
        <ResponseAssistPanel thread={DEMO_PREMIUM_CHAT} initialTab="library" onInsert={t => setInserted(t)} onClose={() => {}} />
      </RailBox>
    </div>
  );
}

function ShareCartDemo() {
  const [key, setKey] = useState(0);
  return (
    <RailBox>
      <ShareCartPanel key={key} mode="chat" onSendToChat={() => setTimeout(() => setKey(k => k + 1), 1400)} onClose={() => setKey(k => k + 1)} />
      <div className="px-4 py-2 text-xs text-gray-400" style={mono}>Click Send to see confirmation state</div>
    </RailBox>
  );
}

function DirectoryOutboundDemo() {
  const noop = () => {};
  return (
    <RailBox maxHeight={480}>
      <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
        <DirectoryPanel mode="outbound" activeCustomerCall={null} onConsult={noop} onTransfer={noop} onOutboundCall={noop} onStartInternalChat={noop} onDialNumber={noop} onClose={noop} />
      </div>
    </RailBox>
  );
}

function DirectoryTransferDemo() {
  const noop = () => {};
  return (
    <RailBox maxHeight={480}>
      <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
        <DirectoryPanel mode="active-call" activeCustomerCall={DEMO_CHAT} onConsult={noop} onTransfer={noop} onOutboundCall={noop} onStartInternalChat={noop} onDialNumber={noop} onClose={noop} transferSuggestion="Billing & Payments" />
      </div>
    </RailBox>
  );
}

function PresencePulseDemo() {
  const [active, setActive] = useState(true);
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 px-5 py-3 w-full max-w-sm">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">JR</div>
          <span className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white bg-yellow-400', active ? 'animate-pulse' : '')} />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-800">Jordan Riley</div>
          <div className="text-xs text-yellow-700 font-medium">Wrap-Up · 24s</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-yellow-800 px-2 py-1 bg-yellow-100">
          <span className={cn('w-2 h-2 rounded-full bg-yellow-400', active ? 'animate-pulse' : '')} />
          Wrap-Up
        </div>
      </div>
      <button onClick={() => { setActive(false); setTimeout(() => setActive(true), 50); }} style={mono} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 px-3 py-1.5 transition-colors">↺ Replay</button>
    </div>
  );
}

function PanelExpandDemo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="bg-white border border-gray-200 overflow-hidden rounded-lg">
        <div className="transition-all duration-300 ease-in-out overflow-hidden" style={{ width: expanded ? 300 : 180 }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">JR</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">Jordan Riley</div>
            </div>
            <button onClick={() => setExpanded(e => !e)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1.5" y="1.5" width="15" height="15" rx="2" />
                {expanded ? <line x1="11.5" y1="1.5" x2="11.5" y2="16.5" /> : <line x1="6.5" y1="1.5" x2="6.5" y2="16.5" />}
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="h-2 bg-gray-100 w-3/4 mb-2 rounded" /><div className="h-2 bg-gray-100 w-1/2 mb-2 rounded" /><div className="h-2 bg-gray-100 w-2/3 rounded" />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400" style={mono}>380px → 640px · 300ms ease-in-out</p>
    </div>
  );
}

// ── Pattern definitions ───────────────────────────────────────────────────────
interface PatternDef {
  id: string;
  title: string;
  description: string;
  group: string;
  detail: string;
  demo: React.ReactNode;
  wide?: boolean;
}

const PATTERNS: PatternDef[] = [
  { id: 'presence-available', title: 'Presence Control — Available', group: 'Presence', detail: 'Click dropdown · 7 status options', description: 'Agent status selector with avatar, status dot, and all availability states. Click to open the dropdown and switch between Available, Busy, Wrap-Up, Break, Lunch, Away, and Offline.', demo: <PresenceAvailableDemo /> },
  { id: 'presence-wrapup', title: 'Presence Control — Wrap-Up', group: 'Presence', detail: 'animate-pulse · live countdown', description: 'Wrap-up state shows an amber pulsing dot and live countdown timer. The presence bar transitions to a yellow background to signal the agent is not accepting new contacts.', demo: <PresenceWrapUpDemo /> },
  { id: 'thread-active', title: 'Thread Item — Active', group: 'Thread List', detail: 'Click to toggle selected state', description: 'Active customer chat with gold tier badge, live SLA timer, escalating sentiment dot, and unread count. Left accent border indicates thread type.', demo: <ThreadActiveDemo /> },
  { id: 'thread-waiting', title: 'Thread Item — Waiting', group: 'Thread List', detail: 'Amber SLA timer · 2 unread', description: 'Waiting state with amber SLA timer approaching expiry. The thread sorts to the top of the queue based on urgency.', demo: <ThreadWaitingDemo /> },
  { id: 'thread-escalated', title: 'Thread Item — Escalated', group: 'Thread List', detail: 'Red ESCALATED badge · urgent SLA', description: 'Escalated thread floats to the top of the list with a red badge and critical SLA timer. Premium tier badge shown.', demo: <ThreadEscalatedDemo /> },
  { id: 'thread-idle-internal', title: 'Thread Items — Idle & Internal', group: 'Thread List', detail: 'Idle customer + internal colleague', description: 'Idle customer thread (no urgency) and an internal colleague chat. Internal threads use a slate accent and show role/department.', demo: <ThreadIdleDemo /> },
  { id: 'call-active', title: 'Active Call Card', group: 'Call Controls', detail: 'Live timer · mute toggle', description: 'Full call card on dark slate background with live elapsed timer. Click Mute to toggle microphone state with visual feedback.', demo: <CallActiveDemo /> },
  { id: 'call-hold', title: 'Hold State Transition', group: 'Call Controls', detail: '500ms background crossfade', description: 'Toggling hold transitions the call card from dark slate to warm amber — an unmistakable visual signal that the customer is waiting.', demo: <HoldTransitionDemo /> },
  { id: 'call-consult', title: 'Consult & Warm Transfer', group: 'Call Controls', detail: 'Two-leg call · confirm transfer', description: 'During a consult the agent sees both call legs: customer on hold (amber) and the internal consult (slate). Warm transfer button moves the customer to the colleague.', demo: <ConsultTransferDemo /> },
  { id: 'inbound-alert', title: 'Inbound Call Alert', group: 'Alerts & Overlays', detail: '30s auto-reject · pulsing ring', description: 'Full-screen overlay with pulsing ring animation. 30-second countdown auto-rejects if not answered. Accept and Decline buttons are always accessible.', demo: <InboundAlertDemoWrapper /> },
  { id: 'wrapup-timer-full', title: 'Wrap-Up Form', group: 'Alerts & Overlays', detail: 'Live countdown · required disposition', description: 'Post-call wrap-up modal with live timer, AI-generated summary, required disposition picker, and optional notes. Blocks new contacts until complete or skipped.', demo: <WrapUpTimerDemoWrapper /> },
  { id: 'sentiment-alert', title: 'Sentiment Alert', group: 'Alerts & Overlays', detail: '300ms ease-out slide + fade', description: "Slides in when AI detects escalating sentiment. Dismissible. Includes a coaching tip to guide the agent's next response.", demo: <SentimentAlertDemo /> },
  { id: 'sla-countdown', title: 'SLA Countdown', group: 'Alerts & Overlays', detail: '80ms linear · red at 33%', description: 'Depleting progress bar counts down the SLA response window. Bar and text transition amber → red in the final third.', demo: <SLACountdownDemo /> },
  { id: 'context-strip', title: 'Context Strip', group: 'Conversation', detail: 'Click to expand / collapse', description: 'Collapsible strip showing account tier, issue tag, and sentiment. Expands to reveal full customer context. Persists expanded state per thread across navigation.', demo: <ContextStripDemo /> },
  { id: 'message-bubbles', title: 'Message Bubbles', group: 'Conversation', detail: 'Customer · Agent · System', description: 'Three message types: customer (white card, left-aligned), agent (blue, right-aligned), and system messages (centered italic). Rounded corners differentiate thread direction.', demo: <MessageBubblesDemo /> },
  { id: 'chat-composer', title: 'Chat Composer', group: 'Conversation', detail: 'Auto-resize · Enter to send', description: 'Auto-resizing textarea with action toolbar: AI suggest, quick replies, share cart, emoji, and attach. Enter sends; Shift+Enter for newline.', demo: <ChatComposerDemo /> },
  { id: 'message-fade', title: 'Message Fade-In', group: 'Conversation', detail: '300ms ease-out (opacity + translateY)', description: 'New messages slide up and fade in as they appear, creating a natural chat rhythm. Click "+ Send Message" to add to the thread.', demo: <MessageFadeDemo /> },
  { id: 'response-assist-ai', title: 'AI Suggestions Panel', group: 'AI Assist', detail: 'Context-aware · 3 tonal variants', description: 'AI generates context-aware response suggestions based on conversation content. Three options per scenario with selectable tone: Balanced, Formal, Friendly, Brief.', demo: <ResponseAssistAIDemo />, wide: true },
  { id: 'response-assist-library', title: 'Quick Reply Library', group: 'AI Assist', detail: 'Category browse · search', description: 'Pre-written responses organized by category. Agents can browse or search, then insert directly into the composer with one click.', demo: <ResponseAssistLibraryDemo />, wide: true },
  { id: 'share-cart', title: 'Share Cart Panel', group: 'AI Assist', detail: 'Live cart · send to chat', description: "Shows the customer's current cart with itemized pricing. \"Send to Chat\" dispatches a formatted cart summary message directly into the conversation.", demo: <ShareCartDemo /> },
  { id: 'directory-outbound', title: 'Directory — Outbound Call', group: 'Directory', detail: 'Search · filter · dial', description: 'Contact directory for making outbound calls. Search agents by name or department, filter by availability, or dial a custom number.', demo: <DirectoryOutboundDemo />, wide: true },
  { id: 'directory-transfer', title: 'Directory — Transfer Call', group: 'Directory', detail: 'AI suggestion · consult or cold transfer', description: 'Transfer mode shows AI-suggested destination based on conversation context, with options to consult (warm transfer) or transfer immediately (cold).', demo: <DirectoryTransferDemo />, wide: true },
  { id: 'presence-pulse', title: 'Presence Pulse', group: 'Motion & Timing', detail: 'CSS animate-pulse · 1s infinite', description: 'Avatar dot and status badge pulse during wrap-up to signal the agent is unavailable for new contacts.', demo: <PresencePulseDemo /> },
  { id: 'panel-expand', title: 'Panel Expand', group: 'Motion & Timing', detail: '300ms ease-in-out width transition', description: 'The left rail expands from 380px to 640px to give agents more space during complex conversations or directory use.', demo: <PanelExpandDemo /> },
];

const GROUPS = ['Presence', 'Thread List', 'Call Controls', 'Alerts & Overlays', 'Conversation', 'AI Assist', 'Directory', 'Motion & Timing'];

// ── Pattern Card ──────────────────────────────────────────────────────────────
function PatternCard({ pattern }: { pattern: PatternDef }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#ffffff',
        border: `1px solid ${hovered ? '#a3a3a3' : '#e5e5e5'}`,
        transition: 'border-color 0.15s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gridColumn: pattern.wide ? '1 / -1' : undefined,
      }}
    >
      <div style={{ backgroundColor: '#f7f7f5', padding: '28px 24px', borderBottom: '1px solid #e5e5e5', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {pattern.demo}
      </div>
      <div style={{ padding: '16px 20px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
          <h3 style={{ ...sans, fontSize: 13, fontWeight: 700, color: '#171717', margin: 0 }}>{pattern.title}</h3>
        </div>
        <p style={{ ...sans, fontSize: 12, color: '#737373', lineHeight: 1.55, margin: '0 0 12px' }}>{pattern.description}</p>
        <div style={{ ...mono, fontSize: 10, color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: 6, marginTop: 'auto' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          {pattern.detail}
        </div>
      </div>
    </div>
  );
}

// ── Pattern Library Page ──────────────────────────────────────────────────────
export default function PatternLibrary({ onNavigate }: Props) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const visibleGroups = activeGroup ? [activeGroup] : GROUPS;
  const totalCount = PATTERNS.length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f7f7f5', ...sans }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        backgroundColor: 'rgba(247,247,245,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', height: 52, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 32 }}>
          <div style={{ width: 26, height: 26, backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span style={{ ...mono, fontSize: 12, fontWeight: 600, color: '#171717', letterSpacing: '0.02em' }}>WORKBENCH</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => onNavigate('scenarios')}
            style={{ ...mono, padding: '0 14px', height: 52, fontSize: 11, fontWeight: 500, color: '#a3a3a3', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', letterSpacing: '0.04em' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#737373')}
            onMouseLeave={e => (e.currentTarget.style.color = '#a3a3a3')}>
            SCENARIOS
          </button>
          <button onClick={() => onNavigate('patterns')}
            style={{ ...mono, padding: '0 14px', height: 52, fontSize: 11, fontWeight: 600, color: '#171717', background: 'none', border: 'none', borderBottom: '2px solid #171717', cursor: 'pointer', letterSpacing: '0.04em' }}>
            PATTERNS
          </button>
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ ...mono, fontSize: 11, color: '#a3a3a3', letterSpacing: '0.06em' }}>{totalCount} COMPONENTS</span>
          <button onClick={() => onNavigate('prototype')}
            style={{ ...mono, display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, color: '#171717', padding: '7px 16px', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', cursor: 'pointer', letterSpacing: '0.04em', transition: 'background-color 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}>
            OPEN PROTOTYPE
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex' }}>
        <aside style={{ width: 196, flexShrink: 0, borderRight: '1px solid #e5e5e5', backgroundColor: '#ffffff', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '28px 0 24px', position: 'sticky', top: 52, height: 'calc(100vh - 52px)', alignSelf: 'flex-start' }}>
          <div style={{ ...mono, padding: '0 20px 10px', fontSize: 9, color: '#a3a3a3', letterSpacing: '0.14em' }}>COMPONENT LIBRARY</div>

          <button onClick={() => setActiveGroup(null)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 20px', ...mono, fontSize: 11, fontWeight: activeGroup === null ? 700 : 400, color: activeGroup === null ? '#171717' : '#737373', backgroundColor: activeGroup === null ? '#f7f7f5' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', letterSpacing: '0.02em', borderLeft: `2px solid ${activeGroup === null ? '#171717' : 'transparent'}` }}>
            All components
            <span style={{ fontSize: 10, color: activeGroup === null ? '#737373' : '#a3a3a3' }}>{totalCount}</span>
          </button>

          <div style={{ height: 1, backgroundColor: '#f3f4f6', margin: '8px 0' }} />

          {GROUPS.map(group => {
            const count = PATTERNS.filter(p => p.group === group).length;
            const active = activeGroup === group;
            return (
              <button key={group} onClick={() => setActiveGroup(active ? null : group)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 20px', ...mono, fontSize: 11, fontWeight: active ? 700 : 400, color: active ? '#171717' : '#737373', backgroundColor: active ? '#f7f7f5' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', letterSpacing: '0.02em', borderLeft: `2px solid ${active ? '#171717' : 'transparent'}`, transition: 'color 0.1s, background-color 0.1s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#171717'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#737373'; }}>
                {group}
                <span style={{ fontSize: 10, color: active ? '#737373' : '#a3a3a3' }}>{count}</span>
              </button>
            );
          })}
        </aside>

        <main style={{ flex: 1, padding: '40px 44px 80px', minWidth: 0 }}>
          <div style={{ marginBottom: 44 }}>
            <p style={{ ...mono, fontSize: 10, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>COMPONENT LIBRARY</p>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#171717', margin: '0 0 8px', letterSpacing: '-0.02em' }}>Pattern Library</h1>
            <p style={{ fontSize: 13, color: '#737373', margin: 0, lineHeight: 1.6, maxWidth: 540 }}>
              Every prototype component shown 1:1 — same code, same interactions, same data. Use the sidebar to filter by category.
            </p>
          </div>

          {visibleGroups.map(group => {
            const groupPatterns = PATTERNS.filter(p => p.group === group);
            return (
              <section key={group} id={group.toLowerCase().replace(/\s+/g, '-')} style={{ marginBottom: 56 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #e5e5e5' }}>
                  <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: '#171717', letterSpacing: '0.04em' }}>{group.toUpperCase()}</span>
                  <span style={{ ...mono, fontSize: 10, color: '#a3a3a3' }}>{groupPatterns.length} {groupPatterns.length === 1 ? 'component' : 'components'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  {groupPatterns.map(pattern => <PatternCard key={pattern.id} pattern={pattern} />)}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
