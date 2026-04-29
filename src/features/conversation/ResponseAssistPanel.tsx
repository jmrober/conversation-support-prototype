import { useState, useEffect } from 'react';
import type { Thread, AISuggestion, QuickResponse, Message } from '../../types';
import { mockQuickResponses } from '../../data/mockQuickResponses';
import { cn } from '../../utils/cn';

type Tab = 'suggested' | 'library';

interface Props {
  thread: Thread;
  initialTab?: Tab;
  onInsert: (text: string) => void;
  onClose: () => void;
}

function generateSuggestions(thread: Thread): AISuggestion[] {
  const customerMsgs = thread.messages.filter((m) => m.sender === 'customer');
  const all = customerMsgs.map((m) => m.text).join(' ').toLowerCase();

  if (all.includes('frustrated') || all.includes('two weeks') || all.includes('still hasn')) {
    return [
      { id: 'ai-1', label: 'Acknowledge & apologise', text: "I completely understand how frustrating this must be, especially after waiting so long. I sincerely apologise — this isn't the experience we want for you. I'm going to look into this right now and make it a priority." },
      { id: 'ai-2', label: 'Investigate & commit', text: "I can see why you're frustrated, and you're absolutely right to be. I'm pulling up your order now and will get you a concrete update within the next few minutes. I won't leave you without an answer." },
      { id: 'ai-3', label: 'Empathise & escalate', text: "Two weeks is far too long, and I'm sorry you've had to follow up on this. I'm escalating your case so it gets immediate attention from our logistics team. I'll make sure you hear back today." },
    ];
  }

  if (all.includes('refund') || all.includes('item #') || all.includes('wrong size') || all.includes('exchange')) {
    return [
      { id: 'ai-1', label: 'Confirm refund', text: "I can see your order is eligible for a full refund. I'll initiate the process now — you should see the funds returned to your original payment method within 5–7 business days. Shall I go ahead?" },
      { id: 'ai-2', label: 'Offer exchange', text: "I can arrange an exchange for you at no additional cost. Could you confirm the item number and the size or colour you'd like instead? I'll get a replacement dispatched as quickly as possible." },
      { id: 'ai-3', label: 'Request details', text: "I'd be happy to help with this. To process your request accurately, could you confirm the order number and the reason for the return? I want to make sure we get this right for you." },
    ];
  }

  if (all.includes("can't log") || all.includes('log into') || all.includes('account') || all.includes('password')) {
    return [
      { id: 'ai-1', label: 'Send password reset', text: "I'll send a password reset link to the email address on your account right now. It should arrive within a few minutes — please also check your spam or junk folder just in case." },
      { id: 'ai-2', label: 'Unlock account', text: "I can see your account was temporarily locked as a security precaution. I've unlocked it now — please try logging in again. If the issue persists, let me know and I'll dig deeper." },
      { id: 'ai-3', label: 'Verify & assist', text: "I want to help you regain access securely. Could you confirm the email address associated with your account? Once verified, I can reset your credentials directly." },
    ];
  }

  if (all.includes('promo') || all.includes('code') || all.includes('discount') || all.includes('applying')) {
    return [
      { id: 'ai-1', label: 'Check & apply discount', text: "Let me look up that promo code for you. If it's expired or restricted, I can apply an equivalent discount manually to make sure you still get the saving you were expecting." },
      { id: 'ai-2', label: 'Code expired — offer alternative', text: "That code appears to have expired, but I can apply a manual discount of the same value to your order today. I want to make sure you get the deal you came for." },
      { id: 'ai-3', label: 'Troubleshoot code', text: "Promo codes can sometimes be case-sensitive or tied to specific items. Could you confirm the exact code you're using and which items are in your cart? I'll track down why it isn't applying." },
    ];
  }

  return [
    { id: 'ai-1', label: 'Acknowledge & offer help', text: "Thank you for getting in touch. I can see your concern and I'm happy to help resolve this for you. Let me look into this straight away." },
    { id: 'ai-2', label: 'Request clarification', text: "I want to make sure I fully understand your situation so I can give you the most accurate help. Could you share a bit more detail about what happened?" },
    { id: 'ai-3', label: 'Offer solution', text: "I've reviewed your account and have a couple of options that should resolve this. Would you like me to walk you through them so we can find the best fit?" },
  ];
}

const CATEGORIES = [...new Set(mockQuickResponses.map((r) => r.category))];

export default function ResponseAssistPanel({ thread, initialTab = 'suggested', onInsert, onClose }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const showTabs = initialTab !== 'library';
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (tab !== 'suggested') return;
    setLoading(true);
    setSuggestions([]);
    const timer = setTimeout(() => {
      setSuggestions(generateSuggestions(thread));
      setLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [thread.id, tab]);

  const lastCustomerMessages: Message[] = thread.messages
    .filter((m) => m.sender === 'customer' || m.sender === 'internal')
    .slice(-2);

  const isSearching = query.trim().length > 0;
  const filtered = isSearching
    ? mockQuickResponses.filter((r) =>
        `${r.title} ${r.body} ${r.category}`.toLowerCase().includes(query.toLowerCase())
      )
    : mockQuickResponses;

  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {showTabs ? 'Response Assist' : 'Quick Responses'}
        </span>
      </div>

      {/* Tabs — only shown when opened from AI Suggest entry point */}
      {showTabs && (
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setTab('suggested')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors border-b-2',
              tab === 'suggested'
                ? 'text-blue-900 border-blue-900'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Suggested
          </button>
          <button
            onClick={() => setTab('library')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors border-b-2',
              tab === 'library'
                ? 'text-blue-900 border-blue-900'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            )}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Responses
          </button>
        </div>
      )}

      {/* AI Suggested tab */}
      {tab === 'suggested' && (
        <>
          {/* Context banner: last customer messages + instruction */}
          <div className="px-4 pt-4 pb-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
            {lastCustomerMessages.length > 0 && (
              <div className="mb-2 flex flex-col gap-1">
                {lastCustomerMessages.map((m) => (
                  <p key={m.id} className="text-xs text-blue-900 bg-white/70 border border-blue-100 rounded-md px-2.5 py-1.5 leading-relaxed line-clamp-2">
                    {m.text}
                  </p>
                ))}
              </div>
            )}
            <p className="text-[11px] text-blue-700 leading-snug">
              Suggestions for <span className="font-semibold">{thread.participantName}</span>
              {thread.caseId && <span className="font-mono"> · {thread.caseId}</span>}. Review and edit before sending.
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 h-48 px-6">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-900">Generating suggestions…</span>
                </div>
                <p className="text-xs text-gray-400 text-center">Analysing conversation context</p>
              </div>
            ) : (
              <div className="px-4 py-4 flex flex-col gap-4">
                {suggestions.map((s) => (
                  <SuggestionCard key={s.id} suggestion={s} onInsert={onInsert} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick Responses tab */}
      {tab === 'library' && (
        <>
          <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search responses…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-10">No responses match</div>
            ) : isSearching ? (
              filtered.map((r) => (
                <ResponseItem
                  key={r.id}
                  response={r}
                  showCategory
                  expanded={expandedId === r.id}
                  onExpand={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  onInsert={onInsert}
                />
              ))
            ) : (
              CATEGORIES.map((cat) => {
                const items = filtered.filter((r) => r.category === cat);
                return (
                  <div key={cat}>
                    <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 sticky top-0">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{cat}</span>
                    </div>
                    {items.map((r) => (
                      <ResponseItem
                        key={r.id}
                        response={r}
                        showCategory={false}
                        expanded={expandedId === r.id}
                        onExpand={() => setExpandedId(expandedId === r.id ? null : r.id)}
                        onInsert={onInsert}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SuggestionCard({ suggestion, onInsert }: { suggestion: AISuggestion; onInsert: (text: string) => void }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-700 flex-shrink-0" />
        <span className="text-xs font-semibold text-gray-700">{suggestion.label}</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs text-gray-700 leading-relaxed">{suggestion.text}</p>
      </div>
      <div className="px-3 pb-2.5">
        <button
          onClick={() => onInsert(suggestion.text)}
          className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Use this reply
        </button>
      </div>
    </div>
  );
}

function ResponseItem({
  response,
  showCategory,
  expanded,
  onExpand,
  onInsert,
}: {
  response: QuickResponse;
  showCategory: boolean;
  expanded: boolean;
  onExpand: () => void;
  onInsert: (text: string) => void;
}) {
  return (
    <div className={cn('border-b border-gray-100 transition-colors', expanded ? 'bg-blue-50' : 'bg-white hover:bg-gray-50')}>
      {/* Row — click to expand/collapse */}
      <button
        onClick={onExpand}
        className="w-full text-left px-4 py-3.5"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            {showCategory && (
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">
                {response.category} ·
              </span>
            )}
            <span className={cn('text-xs font-semibold leading-tight truncate', expanded ? 'text-blue-700' : 'text-gray-900')}>
              {response.title}
            </span>
          </div>
          <span className={cn(
            'text-[10px] font-semibold flex-shrink-0 transition-opacity',
            expanded ? 'text-blue-500 opacity-100' : 'text-gray-400 opacity-50 group-hover:opacity-100'
          )}>
            {expanded ? '▲' : 'Preview ▼'}
          </span>
        </div>
        <p className={cn('text-xs text-gray-500 leading-relaxed', expanded ? '' : 'line-clamp-2')}>{response.body}</p>
      </button>

      {/* Expanded: insert button */}
      {expanded && (
        <div className="px-4 pb-3.5">
          <button
            onClick={() => onInsert(response.body)}
            className="w-full flex items-center justify-center gap-1.5 h-8 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Use this reply
          </button>
        </div>
      )}
    </div>
  );
}
