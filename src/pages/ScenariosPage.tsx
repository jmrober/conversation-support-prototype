import { useState, type CSSProperties } from 'react';
import { getFlows } from '../scenarios';

interface Props {
  onSelectFlow: (id: string) => void;
  onViewDiagram: (id: string) => void;
}

const mono: CSSProperties = { fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' };
const sans: CSSProperties = { fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif' };

// ── Scenario Card ─────────────────────────────────────────────────────────────

function ScenarioCard({
  flow,
  index,
  onClick,
  onViewDiagram,
}: {
  flow: ScenarioFlow;
  index: number;
  onClick: () => void;
  onViewDiagram: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [diagramHovered, setDiagramHovered] = useState(false);
  const idStr = String(index + 1).padStart(2, '0');

  return (
    <div
      style={{
        position: 'relative',
        border: `1px solid ${hovered ? '#a3a3a3' : '#e5e5e5'}`,
        backgroundColor: '#ffffff',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Clickable main area */}
      <button
        onClick={onClick}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          padding: '22px 24px 14px',
          ...sans,
        }}
      >
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
            <span style={{ ...mono, fontSize: 11, color: '#a3a3a3', letterSpacing: '0.05em', flexShrink: 0 }}>{idStr}</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#171717', lineHeight: 1.3, margin: 0, letterSpacing: '-0.01em' }}>{flow.title}</h3>
          </div>
          <p style={{ fontSize: 12, color: '#737373', lineHeight: 1.6, margin: 0 }}>{flow.description}</p>
        </div>
      </button>

      {/* Footer row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px 18px',
        borderTop: '1px solid #f3f4f6',
      }}>
        {/* Step dots */}
        <div style={{ display: 'flex', gap: 4 }}>
          {flow.steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === 0 ? 16 : 6,
                height: 5, borderRadius: 3,
                backgroundColor: i === 0 ? '#171717' : '#e5e5e5',
              }}
            />
          ))}
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* View Flow link */}
          <button
            onClick={e => { e.stopPropagation(); onViewDiagram(); }}
            onMouseEnter={() => setDiagramHovered(true)}
            onMouseLeave={() => setDiagramHovered(false)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'flex', alignItems: 'center', gap: 5,
              ...mono,
              fontSize: 11,
              color: diagramHovered ? '#171717' : '#a3a3a3',
              letterSpacing: '0.04em',
              transition: 'color 0.15s',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M17.5 14v3m0 0v3m0-3h-3m3 0h3" />
            </svg>
            VIEW FLOW
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 12, backgroundColor: '#e5e5e5' }} />

          {/* Launch link */}
          <button
            onClick={onClick}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: 0,
              ...mono,
              fontSize: 11,
              color: hovered ? '#171717' : '#a3a3a3',
              letterSpacing: '0.04em',
              transition: 'color 0.15s',
            }}
          >
            Launch →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Scenarios Page ────────────────────────────────────────────────────────────

export default function ScenariosPage({ onSelectFlow, onViewDiagram }: Props) {
  const flows = getFlows();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f7f7f5', ...sans }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        backgroundColor: 'rgba(247,247,245,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e5e5',
        padding: '0 48px',
        display: 'flex', alignItems: 'center', height: 52,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span style={{ ...mono, fontSize: 12, fontWeight: 600, color: '#171717', letterSpacing: '0.02em' }}>WORKBENCH</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ ...mono, fontSize: 11, color: '#a3a3a3', letterSpacing: '0.06em' }}>{flows.length} {flows.length === 1 ? 'SCENARIO' : 'SCENARIOS'}</span>
        </div>
      </header>

      <div style={{ padding: '52px 48px 40px', borderBottom: '1px solid #e5e5e5' }}>
        <p style={{ ...mono, fontSize: 10, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>SCENARIO LIBRARY</p>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#171717', margin: '0 0 8px', letterSpacing: '-0.025em' }}>Communication Workbench</h1>
        <p style={{ fontSize: 14, color: '#737373', margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
          Agent workflow scenarios across chat, call, and blended contact types.
          Select a scenario to launch the prototype — use the step controls to walk through the flow.
        </p>
      </div>

      <div style={{ padding: '40px 48px 80px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: 720 }}>
        {flows.map((flow, i) => (
          <ScenarioCard
            key={flow.id}
            flow={flow}
            index={i}
            onClick={() => onSelectFlow(flow.id)}
            onViewDiagram={() => onViewDiagram(flow.id)}
          />
        ))}
      </div>

      <div style={{ padding: '20px 48px', borderTop: '1px solid #e5e5e5' }}>
        <span style={{ ...mono, fontSize: 10, color: '#a3a3a3', letterSpacing: '0.06em' }}>COMMUNICATION SUPPORT WORKBENCH · PROTOTYPE</span>
      </div>

    </div>
  );
}
