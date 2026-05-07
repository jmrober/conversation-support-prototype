import { useState, useEffect, useRef, type CSSProperties } from 'react';
import type { Thread, PresenceStatus, PanelType, DirectoryEntry } from '../types';
import { getFlow, type ScenarioFlow } from '../scenarios';
import { useWrapUpTimer } from '../hooks/useWrapUpTimer';
import { SLOTS } from './registry';

interface Props {
  flowId: string | null;
  onNavigateScenarios: () => void;
}

// ── Prototype Nav ─────────────────────────────────────────────────────────────

interface NavProps {
  flow: ScenarioFlow | null;
  stepIndex: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onNavigateScenarios: () => void;
  onPresent: () => void;
}

function PrototypeNav({
  flow,
  stepIndex,
  totalSteps,
  onPrevStep,
  onNextStep,
  onNavigateScenarios,
  onPresent,
}: NavProps) {
  const mono: CSSProperties = { fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' };
  const sans: CSSProperties = { fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif' };
  const currentStep = flow?.steps[stepIndex];
  const canPrev = stepIndex > 0;
  const canNext = stepIndex < totalSteps - 1;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, backgroundColor: '#f7f7f5', ...mono }}>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', gap: 0 }}>
        {flow && currentStep ? (
          <div style={{ textAlign: 'center', maxWidth: 280, width: '100%' }}>
            {/* Scenario label */}
            <div style={{ fontSize: 9, color: '#a3a3a3', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              Active Scenario
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#171717', lineHeight: 1.35, marginBottom: 4, ...sans, letterSpacing: '-0.01em' }}>
              {flow.title}
            </div>
            <div style={{ fontSize: 12, color: '#737373', lineHeight: 1.55, marginBottom: 28, ...sans }}>
              {flow.subtitle}
            </div>

            {/* Step stepper */}
            {totalSteps > 1 && (
              <div style={{ marginBottom: 20 }}>
                {/* Step progress dots */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 14 }}>
                  {flow.steps.map((step, i) => (
                    <div
                      key={step.id}
                      style={{
                        width: i === stepIndex ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: i === stepIndex ? '#171717' : i < stepIndex ? '#d4d4d4' : '#e5e5e5',
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>

                {/* Step label */}
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: '#a3a3a3', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                    Step {stepIndex + 1} of {totalSteps}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#171717', lineHeight: 1.3, ...sans }}>
                    {currentStep.label}
                  </div>
                </div>

                {/* Hint */}
                {currentStep.hint && (
                  <div style={{ fontSize: 11, color: '#737373', lineHeight: 1.6, marginBottom: 12, ...sans, padding: '10px 12px', backgroundColor: '#ffffff', border: '1px solid #e5e5e5', textAlign: 'left' }}>
                    {currentStep.hint}
                  </div>
                )}

                {/* Annotation — out-of-band action callout */}
                {currentStep.annotation && (
                  <div style={{ fontSize: 11, color: '#525252', lineHeight: 1.6, marginBottom: 16, ...sans, padding: '10px 12px', backgroundColor: '#fafafa', border: '1px dashed #d4d4d4', textAlign: 'left' }}>
                    <div style={{ ...mono, fontSize: 8, color: '#a3a3a3', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>Outside component</div>
                    {currentStep.annotation}
                  </div>
                )}

                {/* Prev / Next */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button
                    onClick={onPrevStep}
                    disabled={!canPrev}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: canPrev ? '#171717' : '#d4d4d4', background: '#ffffff', border: `1px solid ${canPrev ? '#d4d4d4' : '#e5e5e5'}`, padding: '6px 12px', cursor: canPrev ? 'pointer' : 'default', letterSpacing: '0.06em', transition: 'all 0.1s' }}
                    onMouseEnter={e => { if (canPrev) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    PREV
                  </button>
                  <button
                    onClick={onNextStep}
                    disabled={!canNext}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: canNext ? '#171717' : '#d4d4d4', background: '#ffffff', border: `1px solid ${canNext ? '#d4d4d4' : '#e5e5e5'}`, padding: '6px 12px', cursor: canNext ? 'pointer' : 'default', letterSpacing: '0.06em', transition: 'all 0.1s' }}
                    onMouseEnter={e => { if (canNext) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    NEXT
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <button
                onClick={onPresent}
                style={{ fontSize: 10, fontWeight: 700, color: '#ffffff', background: '#171717', border: '1px solid #171717', padding: '7px 16px', cursor: 'pointer', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#404040'; e.currentTarget.style.borderColor = '#404040'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#171717'; e.currentTarget.style.borderColor = '#171717'; }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
                </svg>
                PRESENT
              </button>
              <button
                onClick={onNavigateScenarios}
                style={{ fontSize: 10, fontWeight: 600, color: '#737373', background: 'none', border: '1px solid #e5e5e5', padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.06em' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#a3a3a3'; e.currentTarget.style.color = '#171717'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#737373'; }}
              >
                ← CHANGE SCENARIO
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', maxWidth: 220 }}>
            <div style={{ fontSize: 9, color: '#d4d4d4', letterSpacing: '0.12em', marginBottom: 14 }}>NO SCENARIO SELECTED</div>
            <button
              onClick={onNavigateScenarios}
              style={{ fontSize: 12, fontWeight: 700, color: '#171717', background: '#ffffff', border: '1px solid #d4d4d4', padding: '8px 18px', cursor: 'pointer', letterSpacing: '0.04em' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              BROWSE SCENARIOS →
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '14px 24px', borderTop: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: 9, color: '#d4d4d4', letterSpacing: '0.08em' }}>WORKBENCH · PROTOTYPE</span>
        {flow && <span style={{ fontSize: 9, color: '#d4d4d4', letterSpacing: '0.06em' }}>SCN {String(flow.index).padStart(2, '0')}</span>}
      </div>
    </div>
  );
}

// ── Presentation Bar ─────────────────────────────────────────────────────────

interface PresentationBarProps {
  flow: ScenarioFlow | null;
  stepIndex: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onExit: () => void;
}

function PresentationBar({ flow, stepIndex, totalSteps, onPrevStep, onNextStep, onExit }: PresentationBarProps) {
  const [hintVisible, setHintVisible] = useState(false);
  const canPrev = stepIndex > 0;
  const canNext = stepIndex < totalSteps - 1;
  const currentStep = flow?.steps[stepIndex];
  const mono: CSSProperties = { fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' };

  const btnBase: CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', padding: '6px 10px',
    transition: 'background 0.1s, color 0.1s', ...mono,
  };

  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
      {/* Hint tooltip */}
      {hintVisible && currentStep?.hint && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
          width: 280, padding: '10px 14px', borderRadius: 10,
          background: 'rgba(15,23,42,0.96)', backdropFilter: 'blur(16px)',
          color: 'rgba(255,255,255,0.78)', fontSize: 11, lineHeight: 1.6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 5, ...mono }}>
            PRESENTER HINT
          </div>
          {currentStep.hint}
        </div>
      )}

      {/* Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: 'rgba(15,23,42,0.94)', backdropFilter: 'blur(16px)',
        borderRadius: 12, padding: '6px 8px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07)',
      }}>
        {/* PREV */}
        <button
          onClick={onPrevStep} disabled={!canPrev}
          style={{ ...btnBase, color: canPrev ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)' }}
          onMouseEnter={e => { if (canPrev) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          PREV
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

        {/* Step dots + info */}
        <button
          onMouseEnter={() => setHintVisible(true)}
          onMouseLeave={() => setHintVisible(false)}
          style={{ ...btnBase, flexDirection: 'column', gap: 4, padding: '6px 14px', cursor: currentStep?.hint ? 'pointer' : 'default' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {flow?.steps.map((step, i) => (
              <div key={step.id} style={{
                width: i === stepIndex ? 16 : 5, height: 5, borderRadius: 3,
                background: i === stepIndex ? 'rgba(255,255,255,0.9)' : i < stepIndex ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)',
                transition: 'all 0.2s ease', flexShrink: 0,
              }} />
            ))}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', whiteSpace: 'nowrap', ...mono }}>
            {currentStep ? `${currentStep.label.toUpperCase()} · ${stepIndex + 1}/${totalSteps}` : 'NO STEP'}
          </div>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

        {/* NEXT */}
        <button
          onClick={onNextStep} disabled={!canNext}
          style={{ ...btnBase, color: canNext ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)' }}
          onMouseEnter={e => { if (canNext) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >
          NEXT
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

        {/* EXIT */}
        <button
          onClick={onExit}
          style={{ ...btnBase, color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          EXIT
        </button>
      </div>
    </div>
  );
}

// ── Transfer annotation ───────────────────────────────────────────────────────

function TransferAnnotationCard({ onClose }: { onClose: () => void }) {
  const mono: CSSProperties = { fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' };
  const sans: CSSProperties = { fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif' };
  return (
    <div style={{ backgroundColor: '#ffffff', width: 300, padding: '24px 24px 22px', border: '1px dashed #d4d4d4', ...sans }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ ...mono, fontSize: 8, fontWeight: 700, color: '#a3a3a3', letterSpacing: '0.14em', textTransform: 'uppercase', paddingTop: 2 }}>
          Outside component
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a3a3a3', padding: 0, display: 'flex', lineHeight: 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#525252')}
          onMouseLeave={e => (e.currentTarget.style.color = '#a3a3a3')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#171717', marginBottom: 8, letterSpacing: '-0.01em' }}>Transfer Chat</div>
      <p style={{ fontSize: 12, color: '#525252', lineHeight: 1.65, margin: 0 }}>
        A transfer modal will appear here — allowing the agent to search for an agent or queue and confirm the transfer. This experience is not in scope for the current prototype.
      </p>
    </div>
  );
}

// Full right-panel wrapper for normal mode
function TransferAnnotationPanel({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f7f7f5' }}>
      <TransferAnnotationCard onClose={onClose} />
    </div>
  );
}

// ── New message toast ─────────────────────────────────────────────────────────

function NewMessageToast({ name, preview, onView, onDismiss }: {
  name: string;
  preview: string;
  onView: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="absolute bottom-4 left-3 right-3 z-50 animate-toast-enter">
      <div className="bg-gray-900 rounded-xl px-3.5 py-3 flex items-center gap-3 shadow-2xl">
        <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-white block leading-tight">{name}</span>
          <span className="text-[11px] text-gray-400 block truncate leading-tight mt-0.5">{preview}</span>
        </div>
        <button
          onClick={onView}
          className="flex-shrink-0 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-colors"
        >
          View
        </button>
        <button onClick={onDismiss} className="text-gray-600 hover:text-gray-400 flex-shrink-0 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

type View = 'list' | 'detail';
const MAX_CHATS = 3;

// ── Prototype ─────────────────────────────────────────────────────────────────

export default function Prototype({ flowId, onNavigateScenarios }: Props) {
  const flow = flowId ? getFlow(flowId) : null;
  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = flow?.steps.length ?? 0;

  // ── Prototype state ───────────────────────────────────────────────────────
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, setView] = useState<View>('list');
  const [presence, setPresence] = useState<PresenceStatus>('available');
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [composerText, setComposerText] = useState('');
  const [wrapUpActive, setWrapUpActive] = useState(false);
  const [directoryIntent, setDirectoryIntent] = useState<'outbound' | 'internal-chat'>('outbound');
  const [railExpanded, setRailExpanded] = useState(false);
  const [assistTab, setAssistTab] = useState<'suggested' | 'library'>('suggested');
  const [presentationMode, setPresentationMode] = useState(false);
  const [toastThread, setToastThread] = useState<{ id: string; name: string; preview: string } | null>(null);
  const prevUnreadsRef = useRef<Record<string, number>>({});
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatStartTimesRef = useRef<Record<string, number>>({});

  // Reset step when flow changes, load first step's threads
  useEffect(() => {
    setStepIndex(0);
  }, [flowId]);

  // Load threads whenever step changes
  useEffect(() => {
    const step = flow?.steps[stepIndex];
    if (step) {
      const now = Date.now();
      const threadsWithStartTimes = step.threads.map(t => {
        const isChat = t.type === 'customer-chat' || t.type === 'internal-chat';
        if (isChat && !t.chatStartedAt) {
          if (!chatStartTimesRef.current[t.id]) chatStartTimesRef.current[t.id] = now;
          return { ...t, chatStartedAt: chatStartTimesRef.current[t.id] };
        }
        return t;
      });
      setThreads(threadsWithStartTimes);
      const initialSelected = step.initialSelectedId ?? null;
      setSelectedId(initialSelected);
      setView(step.initialView ?? 'list');
      setActivePanel(null);
      setToastThread(null);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      // Reset unread tracking so we don't false-fire on step load
      prevUnreadsRef.current = Object.fromEntries(step.threads.map(t => [t.id, t.unreadCount]));
      if (step.initialWrapUpActive) {
        setWrapUpActive(true);
        setPresence('wrap-up');
      } else {
        setWrapUpActive(false);
      }
      // Show toast for any thread that starts with unread messages and isn't the selected one
      const effectiveSelected = initialSelected ?? step.threads[0]?.id ?? null;
      const unreadThread = step.threads.find(t => t.unreadCount > 0 && t.id !== effectiveSelected);
      if (unreadThread) {
        toastTimerRef.current = setTimeout(() => {
          setToastThread({ id: unreadThread.id, name: unreadThread.participantName, preview: unreadThread.lastMessage });
        }, 900);
      }
    }
  }, [stepIndex, flowId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Detect real-time unread increases on non-selected threads
  useEffect(() => {
    threads.forEach(t => {
      const prev = prevUnreadsRef.current[t.id];
      if (prev !== undefined && t.id !== effectiveSelectedId && t.unreadCount > prev) {
        setToastThread({ id: t.id, name: t.participantName, preview: t.lastMessage });
      }
      prevUnreadsRef.current[t.id] = t.unreadCount;
    });
  }, [threads]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (!toastThread) return;
    const id = setTimeout(() => setToastThread(null), 5000);
    return () => clearTimeout(id);
  }, [toastThread]);

  // Auto-expire wrap-up threads after 30s
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setThreads(prev => prev.map(t =>
        t.status === 'wrap-up' && t.wrapUpStartedAt && now - t.wrapUpStartedAt >= 30_000
          ? { ...t, status: 'ended' }
          : t
      ));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleWrapUpEnd = () => {
    setWrapUpActive(false);
    setPresence('available');
  };

  const wrapUpSecondsLeft = useWrapUpTimer(wrapUpActive, 30, handleWrapUpEnd);

  // ── Derived state ─────────────────────────────────────────────────────────
  const customerCall = threads.find(
    t => t.type === 'customer-call' && (t.status === 'active' || t.status === 'on-hold' || t.status === 'consulting' || t.status === 'transferring')
  ) ?? null;

  const consultCall = threads.find(
    t => t.type === 'internal-call' && t.status === 'active' && !!t.consultingWithThreadId
  ) ?? null;

  const anyActiveCall = customerCall ?? consultCall ?? null;

  const ringingCall = threads.find(t => t.type === 'customer-call' && t.status === 'ringing') ?? null;

  // All active threads shown in tab bar — excludes ended/transferred/ringing and internal consult legs
  const tabThreads = threads.filter(
    t => t.status !== 'ended' && t.status !== 'transferred' && t.status !== 'ringing'
      && !(t.type === 'internal-call' && !!t.consultingWithThreadId)
  );

  const activeChatCount = threads.filter(
    t => t.type === 'customer-chat' && t.status !== 'ended' && t.status !== 'transferred'
  ).length;

  // Auto-select highest-priority tab when nothing is explicitly selected
  const effectiveSelectedId = selectedId ?? tabThreads[0]?.id ?? null;
  const selectedThread = threads.find(t => t.id === effectiveSelectedId) ?? null;
  const selectedIsCall = selectedThread?.type === 'customer-call' || selectedThread?.type === 'internal-call';
  const muted = selectedThread?.muted ?? false;

  // When the selected customer call is in consulting status, find its consult leg
  const consultCallForCustomer = selectedThread?.status === 'consulting'
    ? (threads.find(t => t.type === 'internal-call' && t.consultingWithThreadId === selectedThread.id) ?? null)
    : null;

  const activeCustomerCall = selectedThread?.type === 'customer-call' && selectedThread?.status === 'active'
    ? selectedThread
    : null;

  const selectedCallRelatedChat = selectedThread?.relatedChatId
    ? (threads.find(t => t.id === selectedThread.relatedChatId) ?? null)
    : null;

  const directoryMode = anyActiveCall ? 'active-call' : directoryIntent;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const updateThread = (id: string, updates: Partial<Thread>) =>
    setThreads(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAcceptCall = (id: string) => {
    updateThread(id, { status: 'active', callStartedAt: Date.now() });
    setSelectedId(id);
    setView('detail');
  };

  const handleRejectCall = (id: string) => {
    updateThread(id, { status: 'ended' });
  };

  const handleSelectThread = (id: string) => {
    setSelectedId(id);
    setView('detail');
    setActivePanel(null);
    setComposerText('');
    const t = threads.find(th => th.id === id);
    if (t && t.unreadCount > 0) {
      updateThread(id, { unreadCount: 0, status: t.status === 'unread' ? 'active' : t.status });
    }
  };

  const handlePresenceChange = (p: PresenceStatus) => {
    setPresence(p);
    if (p === 'wrap-up') {
      setWrapUpActive(true);
    } else {
      setWrapUpActive(false);
    }
  };

  const handleSendMessage = () => {
    if (!selectedId || !composerText.trim()) return;
    const thread = threads.find(t => t.id === selectedId);
    if (!thread) return;
    updateThread(selectedId, {
      messages: [...thread.messages, {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        senderName: 'You',
        text: composerText.trim(),
        timestamp: formatTime(new Date()),
      }],
      lastMessage: composerText.trim(),
      timestamp: formatTime(new Date()),
    });
    setComposerText('');
  };

  const handleHoldToggle = () => {
    if (!selectedId) return;
    const t = threads.find(th => th.id === selectedId);
    if (!t) return;
    updateThread(selectedId, { status: t.status === 'on-hold' ? 'active' : 'on-hold' });
  };

  const handleEndCall = () => {
    if (!selectedId) return;
    // Clean up any consult leg that's attached to this customer call
    const consultThread = threads.find(t => t.type === 'internal-call' && t.consultingWithThreadId === selectedId);
    if (consultThread) {
      setThreads(prev => prev.filter(t => t.id !== consultThread.id));
    }
    updateThread(selectedId, { status: 'wrap-up', wrapUpStartedAt: Date.now() });
    setSelectedId(null);
  };

  const handleEndConsult = () => {
    if (!selectedId) return;
    const consultThread = threads.find(t => t.type === 'internal-call' && t.consultingWithThreadId === selectedId);
    if (!consultThread) return;
    setThreads(prev => prev.filter(t => t.id !== consultThread.id));
    updateThread(selectedId, { status: 'active' });
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
    setThreads(prev => [...prev, consultThread]);
    // Stay on the customer thread — consult is embedded in the same panel
    setActivePanel(null);
  };

  const handleColdTransfer = (entry: DirectoryEntry) => {
    if (!selectedId) return;
    const customerThreadId = selectedId;
    updateThread(customerThreadId, { status: 'transferring', lastMessage: `Transferring to ${entry.name}` });
    setActivePanel(null);
    setTimeout(() => {
      setThreads(prev => prev.map(t => t.id === customerThreadId ? { ...t, status: 'transferred' } : t));
      setSelectedId(prev => (prev === customerThreadId ? null : prev));
      setView('list');
    }, 2000);
  };

  const handleEndChat = () => {
    if (!selectedId) return;
    updateThread(selectedId, { status: 'wrap-up', wrapUpStartedAt: Date.now() });
    setSelectedId(null);
  };

  const handleOutboundCall = (entry: DirectoryEntry) => {
    const callId = `call-${Date.now()}`;
    setThreads(prev => [...prev, {
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
    }]);
    setSelectedId(callId);
    setView('detail');
    setActivePanel(null);
  };

  const handleDialNumber = (number: string, name?: string, fromChatId?: string) => {
    const callId = `call-${Date.now()}`;
    setThreads(prev => [...prev, {
      id: callId,
      type: 'customer-call',
      status: 'active',
      participantName: name ?? number,
      participantPhone: number,
      lastMessage: 'Outbound call',
      timestamp: formatTime(new Date()),
      unreadCount: 0,
      messages: [],
      callDirection: 'outbound',
      callStartedAt: Date.now(),
      ...(fromChatId ? { relatedChatId: fromChatId } : {}),
    }]);
    setSelectedId(callId);
    setView('detail');
    setActivePanel(null);
  };

  const handleStartInternalChat = (entry: DirectoryEntry) => {
    const existing = threads.find(t => t.type === 'internal-chat' && t.participantName === entry.name && t.status !== 'ended');
    if (existing) { setSelectedId(existing.id); setView('detail'); setActivePanel(null); return; }
    if (activeChatCount >= MAX_CHATS) { setActivePanel(null); return; }
    const chatId = `internal-chat-${Date.now()}`;
    setThreads(prev => [...prev, {
      id: chatId,
      type: 'internal-chat',
      status: 'active',
      participantName: entry.name,
      participantRole: entry.role,
      lastMessage: '',
      timestamp: formatTime(new Date()),
      unreadCount: 0,
      messages: [],
      chatStartedAt: Date.now(),
    }]);
    setSelectedId(chatId);
    setView('detail');
    setActivePanel(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (presentationMode) { setPresentationMode(false); return; }
        if (activePanel) { setActivePanel(null); return; }
      }
      if (presentationMode) {
        if (e.key === 'ArrowRight') { setStepIndex(i => Math.min(totalSteps - 1, i + 1)); return; }
        if (e.key === 'ArrowLeft')  { setStepIndex(i => Math.max(0, i - 1)); return; }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        if (!customerCall && !consultCall) return;
        e.preventDefault();
        if (effectiveSelectedId) updateThread(effectiveSelectedId, { muted: !(selectedThread?.muted ?? false) });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        if (!customerCall) return;
        e.preventDefault();
        setThreads(prev => prev.map(t =>
          t.id === customerCall.id ? { ...t, status: t.status === 'on-hold' ? 'active' : 'on-hold' } : t
        ));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePanel, presentationMode, customerCall, consultCall, totalSteps]);

  // ── Render ────────────────────────────────────────────────────────────────

  // Presentation mode: centered rail on neutral bg, floating bar
  if (presentationMode) {
    return (
      <div style={{ position: 'relative', display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#e5e5e3', paddingTop: 20, paddingBottom: 100, boxSizing: 'border-box' }}>
        <div
          style={{
            width: railExpanded ? 640 : 380,
            height: '100%',
            borderRadius: 4, overflow: 'hidden', position: 'relative',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)',
          }}
          className="bg-white flex-shrink-0 transition-all duration-300 ease-in-out"
        >
          <SLOTS.PresenceControl
            presence={presence}
            onChange={handlePresenceChange}
            wrapUpSecondsLeft={wrapUpActive ? wrapUpSecondsLeft : undefined}
            expanded={railExpanded}
            onToggleExpand={() => setRailExpanded(e => !e)}
          />

          <SLOTS.ConversationTabs
            threads={tabThreads}
            selectedId={effectiveSelectedId}
            onSelect={handleSelectThread}
          />
          {selectedThread ? (
            <SLOTS.ConversationPanel
              thread={selectedThread} consultCall={consultCallForCustomer}
              composerText={composerText} muted={muted}
              onComposerChange={setComposerText} onSendMessage={handleSendMessage}
              onHoldToggle={handleHoldToggle} onMuteToggle={() => { if (effectiveSelectedId) updateThread(effectiveSelectedId, { muted: !muted }); }}
              onEndCall={handleEndCall} onEndConsult={handleEndConsult}
              onOpenDirectory={() => setActivePanel('directory')}
              onOpenResponseAssist={tab => { setAssistTab(tab); setActivePanel('responseassist'); }}
              onOpenChatTransfer={selectedThread?.type === 'customer-chat' ? () => setActivePanel('chat-transfer') : undefined}
              onEndChat={selectedThread && (selectedThread.type === 'customer-chat' || selectedThread.type === 'internal-chat') ? handleEndChat : undefined}
              onStartCall={selectedThread && (selectedThread.type === 'customer-chat' || selectedThread.type === 'internal-chat')
                ? (phone: string) => handleDialNumber(phone, selectedThread.participantName, selectedThread.id)
                : undefined}
              relatedChat={selectedIsCall ? selectedCallRelatedChat : null}
              onSwitchToChat={selectedIsCall && selectedCallRelatedChat ? () => handleSelectThread(selectedCallRelatedChat.id) : undefined}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
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
                onClick={() => { setDirectoryIntent('outbound'); setActivePanel('directory'); }}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                </svg>
                Outbound Call
              </button>
            </div>
          )}

          {ringingCall && (
            <SLOTS.InboundCallAlert call={ringingCall} onAccept={handleAcceptCall} onReject={handleRejectCall} />
          )}
          {activePanel === 'directory' && (
            <SLOTS.DirectoryPanel
              mode={directoryMode} activeCustomerCall={activeCustomerCall}
              onConsult={handleConsult} onTransfer={handleColdTransfer} onOutboundCall={handleOutboundCall}
              onStartInternalChat={handleStartInternalChat} onDialNumber={handleDialNumber}
              onClose={() => setActivePanel(null)}
              transferSuggestion={directoryMode === 'active-call' ? customerCall?.transferSuggestion : undefined}
            />
          )}
          {activePanel === 'responseassist' && selectedThread && (
            <SLOTS.ResponseAssistPanel
              thread={selectedThread} initialTab={assistTab}
              onInsert={text => { setComposerText(text); setActivePanel(null); }}
              onClose={() => setActivePanel(null)}
            />
          )}
          {toastThread && (
            <NewMessageToast
              name={toastThread.name}
              preview={toastThread.preview}
              onView={() => { handleSelectThread(toastThread.id); setToastThread(null); }}
              onDismiss={() => setToastThread(null)}
            />
          )}
        </div>

        {/* Transfer annotation — floats to the right of the centered rail */}
        {activePanel === 'chat-transfer' && (
          <div style={{ position: 'absolute', left: `calc(50% + ${(railExpanded ? 640 : 380) / 2}px + 28px)`, top: '50%', transform: 'translateY(-50%)' }}>
            <TransferAnnotationCard onClose={() => setActivePanel(null)} />
          </div>
        )}

        <PresentationBar
          flow={flow} stepIndex={stepIndex} totalSteps={totalSteps}
          onPrevStep={() => setStepIndex(i => Math.max(0, i - 1))}
          onNextStep={() => setStepIndex(i => Math.min(totalSteps - 1, i + 1))}
          onExit={() => setPresentationMode(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-200 items-stretch">
      <div
        style={{ width: railExpanded ? 640 : 380 }}
        className="flex-shrink-0 border-r border-gray-300 bg-white relative flex flex-col overflow-hidden shadow-xl transition-all duration-300 ease-in-out"
      >
        <SLOTS.PresenceControl
          presence={presence}
          onChange={handlePresenceChange}
          wrapUpSecondsLeft={wrapUpActive ? wrapUpSecondsLeft : undefined}
          expanded={railExpanded}
          onToggleExpand={() => setRailExpanded(e => !e)}
        />


        {/* Main view — tab bar always visible, content pane below */}
        <SLOTS.ConversationTabs
          threads={tabThreads}
          selectedId={effectiveSelectedId}
          onSelect={handleSelectThread}
        />
        {selectedThread ? (
          <SLOTS.ConversationPanel
            thread={selectedThread}
            consultCall={consultCallForCustomer}
            composerText={composerText}
            muted={muted}
            onComposerChange={setComposerText}
            onSendMessage={handleSendMessage}
            onHoldToggle={handleHoldToggle}
            onMuteToggle={() => { if (effectiveSelectedId) updateThread(effectiveSelectedId, { muted: !muted }); }}
            onEndCall={handleEndCall}
            onEndConsult={handleEndConsult}
            onOpenDirectory={() => setActivePanel('directory')}
            onOpenResponseAssist={tab => { setAssistTab(tab); setActivePanel('responseassist'); }}
            onOpenChatTransfer={selectedThread?.type === 'customer-chat' ? () => setActivePanel('chat-transfer') : undefined}
            onEndChat={selectedThread && (selectedThread.type === 'customer-chat' || selectedThread.type === 'internal-chat') ? handleEndChat : undefined}
            onStartCall={selectedThread && (selectedThread.type === 'customer-chat' || selectedThread.type === 'internal-chat')
              ? (phone: string) => handleDialNumber(phone, selectedThread.participantName)
              : undefined}
            relatedChat={selectedIsCall ? selectedCallRelatedChat : null}
            onSwitchToChat={selectedIsCall && selectedCallRelatedChat ? () => handleSelectThread(selectedCallRelatedChat.id) : undefined}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
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
              onClick={() => { setDirectoryIntent('outbound'); setActivePanel('directory'); }}
              disabled={wrapUpActive}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-xl hover:bg-blue-800 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
              </svg>
              Outbound Call
            </button>
          </div>
        )}

        {/* Inbound call alert */}
        {ringingCall && (
          <SLOTS.InboundCallAlert
            call={ringingCall}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
          />
        )}

        {/* Overlay panels */}
        {activePanel === 'directory' && (
          <SLOTS.DirectoryPanel
            mode={directoryMode}
            activeCustomerCall={activeCustomerCall}
            onConsult={handleConsult}
            onTransfer={handleColdTransfer}
            onOutboundCall={handleOutboundCall}
            onStartInternalChat={handleStartInternalChat}
            onDialNumber={handleDialNumber}
            onClose={() => setActivePanel(null)}
            transferSuggestion={directoryMode === 'active-call' ? customerCall?.transferSuggestion : undefined}
          />
        )}

        {activePanel === 'responseassist' && selectedThread && (
          <SLOTS.ResponseAssistPanel
            thread={selectedThread}
            initialTab={assistTab}
            onInsert={text => { setComposerText(text); setActivePanel(null); }}
            onClose={() => setActivePanel(null)}
          />
        )}
        {toastThread && (
          <NewMessageToast
            name={toastThread.name}
            preview={toastThread.preview}
            onView={() => { handleSelectThread(toastThread.id); setToastThread(null); }}
            onDismiss={() => setToastThread(null)}
          />
        )}
      </div>

      {activePanel === 'chat-transfer'
        ? <TransferAnnotationPanel onClose={() => setActivePanel(null)} />
        : (
          <PrototypeNav
            flow={flow}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            onPrevStep={() => setStepIndex(i => Math.max(0, i - 1))}
            onNextStep={() => setStepIndex(i => Math.min(totalSteps - 1, i + 1))}
            onNavigateScenarios={onNavigateScenarios}
            onPresent={() => setPresentationMode(true)}
          />
        )
      }
    </div>
  );
}
