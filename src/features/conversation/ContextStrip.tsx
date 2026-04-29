import { useState, useRef, useEffect } from 'react';
import type { Thread } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  thread: Thread;
}

const TIER_LABEL: Record<string, { label: string; classes: string }> = {
  gold:     { label: 'Gold',    classes: 'bg-amber-100 text-amber-800' },
  premium:  { label: 'Premium', classes: 'bg-blue-100 text-blue-700' },
  standard: { label: 'Standard', classes: 'bg-gray-100 text-gray-500' },
};

const SENTIMENT_CONFIG = {
  positive:   { label: '↑ Positive',   classes: 'text-emerald-600' },
  neutral:    { label: '→ Neutral',     classes: 'text-gray-400' },
  negative:   { label: '↓ Negative',   classes: 'text-amber-600' },
  escalating: { label: '↓↓ Escalating', classes: 'text-red-600 font-semibold' },
};

export default function ContextStrip({ thread }: Props) {
  // Persist expanded state per thread id across navigation
  const expandedByThread = useRef<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(expandedByThread.current[thread.id] ?? false);
  }, [thread.id]);

  const toggleExpanded = () => {
    const next = !expanded;
    expandedByThread.current[thread.id] = next;
    setExpanded(next);
  };

  const tier = thread.accountTier ? TIER_LABEL[thread.accountTier] : null;
  const sentiment = thread.sentiment ? SENTIMENT_CONFIG[thread.sentiment] : null;

  // Only render for customer conversations with context data
  const hasContext = thread.issueTag || tier || sentiment;
  if (!hasContext) return null;

  return (
    <div className="flex-shrink-0 border-b border-gray-100">
      {/* Collapsed strip — always visible */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="text-[11px] font-semibold text-gray-500">Chat Details</span>

        {/* Sentiment — pushed to right */}
        {sentiment && (
          <span className={cn('text-[10px] font-medium ml-auto flex-shrink-0', sentiment.classes)}>
            {sentiment.label}
          </span>
        )}

        {/* Expand chevron */}
        <svg
          className={cn('w-3 h-3 text-gray-400 flex-shrink-0 transition-transform duration-150', expanded ? 'rotate-180' : '')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded context panel */}
      {expanded && (
        <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 space-y-3 overflow-y-auto max-h-48">

          {/* Account info */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Account</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-800">{thread.participantName}</span>
              {tier && (
                <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none', tier.classes)}>
                  {tier.label}
                </span>
              )}
              {thread.caseId && (
                <span className="text-[11px] font-mono text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                  {thread.caseId}
                </span>
              )}
            </div>
          </div>

          {/* Current issue */}
          {thread.issueTag && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Issue</p>
              <p className="text-xs text-gray-700 font-medium">{thread.issueTag}</p>
            </div>
          )}

          {/* Sentiment */}
          {sentiment && (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Sentiment</p>
              <p className={cn('text-xs font-medium', sentiment.classes)}>{sentiment.label}</p>
            </div>
          )}

          {/* Channel */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Channel</p>
            <p className="text-xs text-gray-600 capitalize">
              {thread.type === 'customer-chat' ? 'Chat' : thread.type === 'customer-call' ? 'Voice' : thread.type}
              {thread.chatMode && ` · ${thread.chatMode}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
