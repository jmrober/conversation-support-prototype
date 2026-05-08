import { useState, useRef, useCallback, type CSSProperties, type MouseEvent, type WheelEvent } from 'react';
import type { FlowStep, ScenarioFlow } from '../scenarios';
import ConversationTabs from '../features/tabs/ConversationTabs';
import ConversationPanel from '../features/conversation/ConversationPanel';

// ── Constants ──────────────────────────────────────────────────────────────────

const PREVIEW_W = 380;
const PREVIEW_H = 620;
const PREVIEW_SCALE = 0.58;
const DISPLAY_W = Math.round(PREVIEW_W * PREVIEW_SCALE);
const DISPLAY_H = Math.round(PREVIEW_H * PREVIEW_SCALE);

const STEP_GAP = 80;  // horizontal gap between step nodes
const ARROW_Y = DISPLAY_H * 0.28; // vertical center of arrow (near top of preview)

const mono: CSSProperties = { fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' };
const sans: CSSProperties = { fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif' };

// ── Step UI Preview ────────────────────────────────────────────────────────────

function StepPreview({ step }: { step: FlowStep }) {
  const selectedId = step.initialSelectedId ?? step.threads[0]?.id ?? null;
  const selectedThread = step.threads.find(t => t.id === selectedId) ?? null;

  const noop = () => {};

  return (
    // zoom (not transform) so flex height calculations inside resolve correctly
    <div style={{ zoom: PREVIEW_SCALE, pointerEvents: 'none' }}>
      <div style={{
        width: PREVIEW_W,
        height: PREVIEW_H,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
      }}>
        {/* Presence bar stub */}
        <div style={{
          height: 40,
          backgroundColor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
          paddingRight: 12,
          gap: 8,
          flexShrink: 0,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span style={{ ...mono, fontSize: 11, color: '#a3a3a3', letterSpacing: '0.04em' }}>AVAILABLE</span>
        </div>

        {/* Conversation tabs */}
        {step.threads.length > 0 && (
          <ConversationTabs
            threads={step.threads}
            selectedId={selectedId}
            onSelect={noop}
          />
        )}

        {/* Conversation panel */}
        {selectedThread ? (
          <ConversationPanel
            thread={selectedThread}
            composerText=""
            muted={false}
            onComposerChange={noop}
            onSendMessage={noop}
            onHoldToggle={noop}
            onMuteToggle={noop}
            onEndCall={noop}
            onOpenDirectory={noop}
            onOpenResponseAssist={noop}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...sans, fontSize: 13, color: '#9ca3af' }}>No active conversation</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step node ──────────────────────────────────────────────────────────────────

function StepNode({ step, stepIndex }: { step: FlowStep; stepIndex: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      {/* Step badge */}
      <div style={{
        ...mono,
        fontSize: 10, fontWeight: 600,
        color: '#a3a3a3', letterSpacing: '0.06em',
        marginBottom: 8,
      }}>
        {String(stepIndex + 1).padStart(2, '0')}
      </div>

      {/* Label */}
      <div style={{
        ...sans,
        fontSize: 11, fontWeight: 600,
        color: '#171717',
        marginBottom: 10,
        textAlign: 'center',
        maxWidth: DISPLAY_W + 16,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      }}>
        {step.label}
      </div>

      {/* Preview frame */}
      <div style={{
        width: DISPLAY_W,
        height: DISPLAY_H,
        overflow: 'hidden',
        border: '1.5px solid #d4d4d4',
        borderRadius: 6,
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        flexShrink: 0,
      }}>
        <StepPreview step={step} />
      </div>

      {/* Brief */}
      {step.hint && (
        <div style={{ marginTop: 12, width: DISPLAY_W + 16, textAlign: 'center' }}>
          {/* Decorative lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', marginBottom: 7 }}>
            {[100, 75, 55].map((pct, i) => (
              <div key={i} style={{ width: `${pct}%`, height: 1.5, backgroundColor: '#d4d4d4', borderRadius: 1 }} />
            ))}
          </div>
          <p style={{ ...sans, fontSize: 11, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
            {step.hint}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Arrow ─────────────────────────────────────────────────────────────────────

function FlowArrow() {
  return (
    <div style={{
      flexShrink: 0,
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: 28 + 18 + ARROW_Y, // badge + label + arrow center
      width: STEP_GAP,
      justifyContent: 'center',
    }}>
      <svg width={STEP_GAP - 8} height="16" style={{ overflow: 'visible' }}>
        <circle cx="4" cy="8" r="3" fill="#9ca3af" />
        <line x1="7" y1="8" x2={STEP_GAP - 18} y2="8" stroke="#9ca3af" strokeWidth="1.5" />
        <path d={`M ${STEP_GAP - 22} 4 L ${STEP_GAP - 13} 8 L ${STEP_GAP - 22} 12`} fill="#9ca3af" />
      </svg>
    </div>
  );
}

// ── Flow Page ──────────────────────────────────────────────────────────────────

interface Props {
  flow: ScenarioFlow;
  onBack: () => void;
}

export default function FlowPage({ flow, onBack }: Props) {
  const [pan, setPan] = useState({ x: 60, y: 80 });
  const [zoom, setZoom] = useState(1);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const onMouseDown = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(2, Math.max(0.25, z * delta)));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f0f0ee', ...sans }}>

      {/* Header */}
      <header style={{
        height: 52,
        backgroundColor: 'rgba(240,240,238,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        gap: 16,
        flexShrink: 0,
        zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: 'none', backgroundColor: 'transparent',
            cursor: 'pointer', padding: '4px 0',
            ...mono, fontSize: 11, color: '#737373',
            letterSpacing: '0.04em',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#171717')}
          onMouseLeave={e => (e.currentTarget.style.color = '#737373')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          BACK
        </button>

        <div style={{ width: 1, height: 16, backgroundColor: '#e5e5e5' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ ...mono, fontSize: 9, color: '#a3a3a3', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            FLOW DIAGRAM
          </span>
          <span style={{ ...sans, fontSize: 14, fontWeight: 700, color: '#171717', letterSpacing: '-0.01em', lineHeight: 1 }}>
            {flow.title}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setZoom(z => Math.max(0.25, z * 0.9))}
              style={{
                width: 24, height: 24, border: '1px solid #e5e5e5',
                backgroundColor: '#fff', borderRadius: 4, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...mono, fontSize: 14, color: '#555',
              }}
            >−</button>
            <span style={{ ...mono, fontSize: 10, color: '#a3a3a3', letterSpacing: '0.04em', minWidth: 36, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(2, z * 1.1))}
              style={{
                width: 24, height: 24, border: '1px solid #e5e5e5',
                backgroundColor: '#fff', borderRadius: 4, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                ...mono, fontSize: 14, color: '#555',
              }}
            >+</button>
            <button
              onClick={() => { setPan({ x: 60, y: 80 }); setZoom(1); }}
              style={{
                border: '1px solid #e5e5e5', backgroundColor: '#fff',
                borderRadius: 4, cursor: 'pointer', padding: '2px 8px',
                ...mono, fontSize: 10, color: '#737373', letterSpacing: '0.04em',
              }}
            >RESET</button>
          </div>

          <span style={{ ...mono, fontSize: 10, color: '#a3a3a3', letterSpacing: '0.06em' }}>
            {flow.steps.length} {flow.steps.length === 1 ? 'STATE' : 'STATES'} · WORKFLOW MAP
          </span>
        </div>
      </header>

      {/* Canvas */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        style={{
          flex: 1,
          overflow: 'hidden',
          cursor: dragging.current ? 'grabbing' : 'grab',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {/* Inner canvas (transformed) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0,
          }}
        >
          {flow.steps.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <StepNode step={step} stepIndex={i} />
              {i < flow.steps.length - 1 && <FlowArrow />}
            </div>
          ))}
        </div>

        {/* Hint overlay */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          ...mono, fontSize: 10, color: '#b0b0b0',
          letterSpacing: '0.06em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          DRAG TO PAN · SCROLL TO ZOOM
        </div>
      </div>
    </div>
  );
}
