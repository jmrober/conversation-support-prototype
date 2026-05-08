import type { CSSProperties } from 'react';

// ── Diagram data ─────────────────────────────────────────────────────────────

interface DiagramStep {
  label: string;
  brief: string;
  parallel?: { label: string; brief: string };
}

const DIAGRAMS: Record<string, DiagramStep[]> = {
  'chat-only-agent': [
    { label: 'Single Chat Active', brief: 'One customer in focus. Full conversation history accessible.' },
    { label: '2nd Chat Arrives', brief: 'Triage begins. SLA timer on Leo signals who needs attention first.' },
    { label: '3 Chats Live', brief: 'Three concurrent customers. Context switching across all threads.' },
    { label: 'Internal Message', brief: "Team lead flags expired promo code — directly solves Leo's open issue." },
    { label: 'All 4 Threads Active', brief: 'Full orchestration. Agent sees every channel status simultaneously.' },
  ],
  'chat-and-call-agent': [
    { label: 'Chat In Progress', brief: 'Agent builds customer context via text before escalating to voice.' },
    {
      label: 'Outbound Call Active',
      brief: 'Call and chat share context. Agent can speak while referencing chat history.',
      parallel: { label: 'Chat Still Open', brief: 'Originating chat stays live — no context is lost on escalation.' },
    },
  ],
  'call-only-agent': [
    { label: 'Inbound Alert', brief: 'Caller identity and account tier visible before the agent picks up.' },
    { label: 'Call Active', brief: 'Full controls available: hold, mute, transfer, and consult mid-call.' },
    { label: 'Customer On Hold', brief: 'Agent reviews account and verifies dispute details in silence.' },
    { label: 'Warm Transfer', brief: 'Context handed to specialist before release. No cold drop for the customer.' },
  ],
  'driver-not-home': [
    { label: 'Driver Chat Arrives', brief: 'Driver reports delivery issue via internal chat. Full address context provided.' },
    { label: 'Customer Lookup', brief: 'Agent locates customer contact details to complete the loop.' },
    {
      label: 'Outbound Call Placed',
      brief: 'Agent calls customer directly while the driver chat stays open.',
      parallel: { label: 'Driver Chat Open', brief: 'Both channels managed simultaneously — no switching or dropping.' },
    },
    { label: 'Driver Updated', brief: 'Agent relays call outcome to driver via chat. Loop fully closed.' },
  ],
  'recycling-request': [
    { label: 'Store Manager Chat', brief: 'Store contacts agent via internal chat. Pickup need and address captured upfront.' },
    {
      label: 'Vendor Call Active',
      brief: 'Agent calls EcoHaul to confirm pickup while store chat remains open.',
      parallel: { label: 'Store Chat Open', brief: 'Agent can reference chat details and relay information mid-call.' },
    },
    { label: 'Pickup Confirmed', brief: 'Confirmation number and window sent via chat while still on the vendor call.' },
  ],
  'retail-escalation': [
    { label: 'Associate Contacts', brief: 'Error code and customer context established via internal chat first.' },
    { label: 'Case CS-6774 Opened', brief: 'Structured record created before escalating to voice. Context documented.' },
    { label: 'Call Placed to Associate', brief: 'Voice call allows richer diagnostic conversation than typing allows.' },
    { label: 'Call Ends — Wrap-Up', brief: 'Post-call notes complete the case before agent returns to available queue.' },
  ],
  'blended-agent': [
    { label: 'Call + 2 Chats + Internal', brief: 'Inbound call, two customer chats, and an internal message all visible at once.' },
    { label: 'Call Held — Chat Focus', brief: 'Call paused to prevent SLA breach. Deliberate triage prioritises Sam\'s request.' },
  ],
};

// ── Visual constants ──────────────────────────────────────────────────────────

const FRAME_W = 90;
const FRAME_H = 118;
const ARROW_PADDING_TOP = Math.floor(FRAME_H / 2) - 8; // aligns arrow with frame centre

const mono: CSSProperties = { fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' };
const sans: CSSProperties = { fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif' };

// ── Sub-components ────────────────────────────────────────────────────────────

function PhoneFrame({ label, small = false, muted = false }: { label: string; small?: boolean; muted?: boolean }) {
  const w = small ? 78 : FRAME_W;
  const h = small ? 102 : FRAME_H;
  return (
    <div style={{
      width: w, height: h,
      border: `1.5px solid ${muted ? '#bbb' : '#1a1a1a'}`,
      borderRadius: 6,
      backgroundColor: '#fff',
      position: 'relative',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Screen with cross-hatch */}
      <div style={{
        position: 'absolute',
        top: 4, left: 4, right: 4, bottom: 13,
        backgroundColor: muted ? '#f8f8f8' : '#f2f2f2',
        backgroundImage: muted
          ? 'repeating-linear-gradient(45deg, #ebebeb 0, #ebebeb 1px, transparent 0, transparent 50%)'
          : 'repeating-linear-gradient(45deg, #dcdcdc 0, #dcdcdc 1px, transparent 0, transparent 50%)',
        backgroundSize: '9px 9px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px 5px',
        }}>
          <span style={{
            ...mono,
            fontSize: small ? 7.5 : 8.5,
            fontWeight: 600,
            color: muted ? '#aaa' : '#222',
            textAlign: 'center',
            lineHeight: 1.3,
          }}>
            {label}
          </span>
        </div>
      </div>
      {/* Home bar */}
      <div style={{
        position: 'absolute', bottom: 3,
        left: '50%', transform: 'translateX(-50%)',
        width: small ? 16 : 20, height: 5,
        borderRadius: 3,
        backgroundColor: muted ? '#eee' : '#dedede',
        border: `0.5px solid ${muted ? '#ddd' : '#ccc'}`,
      }} />
    </div>
  );
}

function BriefText({ text, width }: { text: string; width: number }) {
  return (
    <div style={{ marginTop: 10, width, textAlign: 'center' }}>
      {/* 3 sketch-style lines above text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', marginBottom: 7 }}>
        {[100, 80, 60].map((pct, i) => (
          <div key={i} style={{ width: `${pct}%`, height: 1.5, backgroundColor: '#c8c8c8', borderRadius: 1 }} />
        ))}
      </div>
      <p style={{ ...sans, fontSize: 10, color: '#5a5a5a', lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      paddingTop: ARROW_PADDING_TOP,
      flexShrink: 0, marginTop: 0,
    }}>
      <svg width="62" height="16" style={{ overflow: 'visible' }}>
        <circle cx="5" cy="8" r="3.5" fill="#1a1a1a" />
        <line x1="8" y1="8" x2="53" y2="8" stroke="#1a1a1a" strokeWidth="1.5" />
        <path d="M 48 4 L 57 8 L 48 12" fill="#1a1a1a" />
      </svg>
    </div>
  );
}

function FlowNode({ step, stepNumber }: { step: DiagramStep; stepNumber: number }) {
  const nodeWidth = FRAME_W + 20;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Step number badge */}
      <div style={{
        ...mono,
        fontSize: 9, fontWeight: 600,
        color: '#a3a3a3', letterSpacing: '0.04em',
        marginBottom: 6,
      }}>
        {String(stepNumber).padStart(2, '0')}
      </div>

      {/* Primary phone frame */}
      <PhoneFrame label={step.label} />
      <BriefText text={step.brief} width={nodeWidth} />

      {/* Parallel secondary state */}
      {step.parallel && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
            <div style={{ height: 1, width: 24, backgroundColor: '#ddd' }} />
            <span style={{ ...mono, fontSize: 8, color: '#bbb', letterSpacing: '0.04em' }}>ALSO</span>
            <div style={{ height: 1, width: 24, backgroundColor: '#ddd' }} />
          </div>
          <div style={{ marginTop: 10 }}>
            <PhoneFrame label={step.parallel.label} small muted />
          </div>
          <BriefText text={step.parallel.brief} width={nodeWidth} />
        </>
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface Props {
  scenarioId: string;
  scenarioTitle: string;
  scenarioSubtitle: string;
  onClose: () => void;
}

export default function FlowDiagramModal({ scenarioId, scenarioTitle, scenarioSubtitle, onClose }: Props) {
  const steps = DIAGRAMS[scenarioId];
  if (!steps) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#f7f7f5',
          width: '100%', maxWidth: 1140,
          maxHeight: '88vh',
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 96px rgba(0,0,0,0.35)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 28px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0, backgroundColor: '#fff',
        }}>
          <div>
            <p style={{ ...mono, fontSize: 10, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>
              FLOW DIAGRAM
            </p>
            <h2 style={{ ...sans, fontSize: 16, fontWeight: 700, color: '#171717', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
              {scenarioTitle}
            </h2>
            <p style={{ ...sans, fontSize: 12, color: '#737373', margin: 0 }}>{scenarioSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
              border: '1px solid #e5e5e5', backgroundColor: '#fff',
              borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginLeft: 20,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Diagram */}
        <div style={{
          flex: 1, overflow: 'auto',
          padding: '48px 56px 56px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'nowrap', gap: 0 }}>
            {steps.map((step, i) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'flex-start' }}>
                <FlowNode step={step} stepNumber={i + 1} />
                {i < steps.length - 1 && <FlowArrow />}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '11px 28px',
          borderTop: '1px solid #e5e5e5',
          flexShrink: 0, backgroundColor: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ ...mono, fontSize: 10, color: '#a3a3a3', letterSpacing: '0.06em' }}>
            {steps.length} AGENT STATES · WORKFLOW MAP
          </span>
          <span style={{ ...mono, fontSize: 10, color: '#a3a3a3', letterSpacing: '0.06em' }}>
            FOR PRODUCT REVIEW
          </span>
        </div>
      </div>
    </div>
  );
}
