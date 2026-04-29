import { useEffect, useRef, useState, useCallback } from 'react';
import type { Thread, Message } from '../../types';
import { cn } from '../../utils/cn';
import MessageBubble from './MessageBubble';
import ChatComposer from './ChatComposer';
import CallControls from '../call/CallControls';
import ContextStrip from './ContextStrip';
import ShareCartPanel from './ShareCartPanel';

interface Props {
  thread: Thread;
  consultingWithThread: Thread | null;
  composerText: string;
  muted: boolean;
  onBack: () => void;
  onComposerChange: (v: string) => void;
  onSendMessage: () => void;
  onHoldToggle: () => void;
  onMuteToggle: () => void;
  onEndCall: () => void;
  onWarmTransfer: () => void;
  onOpenDirectory: () => void;
  onOpenResponseAssist: (tab: 'suggested' | 'library') => void;
  onOpenChatTransfer?: () => void;
  onStartCall?: () => void;
  onEndChat?: () => void;
  relatedChat?: Thread | null;
  onSwitchToChat?: () => void;
  transferSuggestion?: string;
}

const CHANNEL_EYEBROW: Record<string, { label: string; labelClass: string }> = {
  'customer-chat': { label: 'Customer · Chat', labelClass: 'text-blue-700' },
  'internal-chat': { label: 'Internal · Chat', labelClass: 'text-slate-600' },
  'customer-call': { label: 'Customer · Call', labelClass: 'text-blue-900' },
  'internal-call': { label: 'Internal · Call', labelClass: 'text-slate-700' },
};

// ── Summary generation ────────────────────────────────────────────────────────
function generateSummary(messages: Message[], participantName: string): string {
  if (messages.length === 0) return 'No messages yet.';
  const agentMsgs = messages.filter((m) => m.sender === 'agent');
  const allText = messages.map((m) => m.text).join(' ').toLowerCase();
  const lines: string[] = [];

  if (allText.includes('order') || allText.includes('ord-')) {
    const orderMatch = allText.match(/ord-\d+/);
    lines.push(`${participantName} contacted support about a delayed order${orderMatch ? ` (${orderMatch[0].toUpperCase()})` : ''}.`);
  } else if (allText.includes('refund') || allText.includes('exchange') || allText.includes('wrong size')) {
    lines.push(`${participantName} is requesting a refund or exchange.`);
  } else if (allText.includes("can't log") || allText.includes('account') || allText.includes('password')) {
    lines.push(`${participantName} is having trouble accessing their account.`);
  } else if (allText.includes('promo') || allText.includes('code') || allText.includes('discount')) {
    lines.push(`${participantName} reported an issue applying a promo code.`);
  } else {
    lines.push(`${participantName} reached out for support.`);
  }

  if (allText.includes('frustrated') || allText.includes('two weeks') || allText.includes('still hasn')) {
    lines.push('Customer expressed frustration — the issue has been ongoing for an extended period.');
  }

  if (agentMsgs.length > 0) {
    const agentText = agentMsgs.map((m) => m.text).join(' ').toLowerCase();
    if (agentText.includes('refund')) lines.push('Agent has initiated or confirmed a refund.');
    else if (agentText.includes('checking') || agentText.includes('look into') || agentText.includes('pull up')) lines.push('Agent is actively investigating.');
    else if (agentText.includes('escalat')) lines.push('Agent has escalated the case.');
    else if (agentText.includes('reset') || agentText.includes('unlock')) lines.push('Agent has taken action on the account.');
    else lines.push(`Agent has responded ${agentMsgs.length} time${agentMsgs.length > 1 ? 's' : ''}.`);
  }

  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.sender === 'customer') {
    const t = lastMsg.text.toLowerCase();
    if (t.includes('thank') || t.includes('worked') || t.includes('sorted') || t.includes('great')) lines.push('Customer confirmed the issue is resolved.');
    else lines.push('Awaiting agent response — customer sent the last message.');
  } else if (lastMsg?.sender === 'agent') {
    lines.push('Agent sent the last message — awaiting customer reply.');
  }

  lines.push(`${messages.length} message${messages.length > 1 ? 's' : ''} · Started ${messages[0]?.timestamp ?? ''}`);
  return lines.join(' ');
}

// ── Inline AI suggestion generation ──────────────────────────────────────────
type Tone = 'balanced' | 'formal' | 'friendly' | 'brief';

function generateSuggestion(messages: Message[], participantName: string, tone: Tone): string {
  const customerMsgs = messages.filter((m) => m.sender === 'customer' || m.sender === 'internal');
  const all = customerMsgs.map((m) => m.text).join(' ').toLowerCase();

  let base = '';
  if (all.includes('frustrated') || all.includes('two weeks') || all.includes('still hasn')) {
    base = "I completely understand how frustrating this must be, especially after waiting so long. I sincerely apologise — this isn't the experience we want for you. I'm looking into this right now and will get you a concrete update within the next few minutes.";
  } else if (all.includes('refund') || all.includes('item #') || all.includes('wrong size') || all.includes('exchange')) {
    base = "I can see your order is eligible for a full refund. I'll initiate that now — funds will return to your original payment method within 5–7 business days. Shall I go ahead?";
  } else if (all.includes("can't log") || all.includes('log into') || all.includes('account') || all.includes('password')) {
    base = "I'll send a password reset link to the email address on your account right now. It should arrive within a few minutes — please also check your spam folder just in case.";
  } else if (all.includes('promo') || all.includes('code') || all.includes('discount') || all.includes('applying')) {
    base = "That code appears to have expired, but I can apply a manual discount of the same value to your order today. Would you like me to go ahead?";
  } else if (all.includes('route') || all.includes('check') || all.includes('ord-')) {
    base = "Thanks for checking on that. I've pulled up the route details — I'll have a status update for you shortly.";
  } else {
    base = "Thank you for getting in touch. I'm looking into this for you right now and will have an update shortly.";
  }

  if (tone === 'formal') {
    return base
      .replace(/I'll/g, 'I will').replace(/I'm/g, 'I am')
      .replace(/you're/g, 'you are').replace(/isn't/g, 'is not')
      .replace(/can't/g, 'cannot').replace(/won't/g, 'will not');
  }
  if (tone === 'friendly') {
    return `Hey ${participantName}! ` + base.replace("I sincerely apologise", "I'm really sorry about that");
  }
  if (tone === 'brief') {
    const sentences = base.split('. ');
    return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
  }
  return base;
}

export default function ConversationPanel({
  thread,
  consultingWithThread,
  composerText,
  muted,
  onBack,
  onComposerChange,
  onSendMessage,
  onHoldToggle,
  onMuteToggle,
  onEndCall,
  onWarmTransfer,
  onOpenDirectory,
  onOpenResponseAssist,
  onOpenChatTransfer,
  onStartCall,
  onEndChat,
  relatedChat,
  onSwitchToChat,
  transferSuggestion,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Summary state
  const [summaryState, setSummaryState] = useState<'idle' | 'loading' | 'shown'>('idle');
  const [summary, setSummary] = useState('');

  // Inline AI suggest state
  const [suggestState, setSuggestState] = useState<'idle' | 'loading' | 'shown'>('idle');
  const [suggestText, setSuggestText] = useState('');
  const [suggestTone, setSuggestTone] = useState<Tone>('balanced');

  // End-chat 2-tap confirm
  const [endChatConfirm, setEndChatConfirm] = useState(false);

  // Sentiment alert
  const [sentimentDismissed, setSentimentDismissed] = useState(false);

  // Share cart panel
  const [shareCartOpen, setShareCartOpen] = useState(false);

  // 3-dot menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages.length]);

  // Reset per-thread state when switching threads
  useEffect(() => {
    setSummaryState('idle');
    setSummary('');
    setSuggestState('idle');
    setSuggestText('');
    setSuggestTone('balanced');
    setEndChatConfirm(false);
    setSentimentDismissed(false);
    setShareCartOpen(false);
  }, [thread.id]);

  const handleSummarise = () => {
    setSummaryState('loading');
    setTimeout(() => {
      setSummary(generateSummary(thread.messages, thread.participantName));
      setSummaryState('shown');
    }, 900);
  };

  const handleAISuggest = () => {
    setSuggestState('loading');
    setSuggestTone('balanced');
    setTimeout(() => {
      setSuggestText(generateSuggestion(thread.messages, thread.participantName, 'balanced'));
      setSuggestState('shown');
    }, 800);
  };

  const handleRefreshSuggest = (tone: Tone) => {
    setSuggestState('loading');
    setTimeout(() => {
      setSuggestText(generateSuggestion(thread.messages, thread.participantName, tone));
      setSuggestState('shown');
    }, 500);
  };

  const handleToneChange = (tone: Tone) => {
    setSuggestTone(tone);
    handleRefreshSuggest(tone);
  };

  const handleInsertSuggestion = () => {
    onComposerChange(suggestText);
    setSuggestState('idle');
  };

  const isCall = thread.type === 'customer-call' || thread.type === 'internal-call';
  const isChat = thread.type === 'customer-chat' || thread.type === 'internal-chat';
  const eyebrow = CHANNEL_EYEBROW[thread.type];

  const TONES: { key: Tone; label: string }[] = [
    { key: 'balanced', label: 'Balanced' },
    { key: 'formal', label: 'Formal' },
    { key: 'friendly', label: 'Friendly' },
    { key: 'brief', label: 'Brief' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white relative">

      {/* Conversation header */}
      <div className="px-4 py-4 border-b border-gray-200 flex-shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <div className={cn('text-[10px] font-semibold tracking-widest uppercase leading-none mb-0.5', eyebrow.labelClass)}>
              {eyebrow.label}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold text-gray-900 leading-tight truncate">
                {thread.participantName}
              </span>
              {thread.participantRole && (
                <span className="text-xs text-gray-400 flex-shrink-0">{thread.participantRole}</span>
              )}
            </div>
          </div>
          {thread.caseId && (
            <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
              {thread.caseId}
            </span>
          )}

          {/* End Chat button */}
          {isChat && onEndChat && (
            <button
              onClick={() => setEndChatConfirm(true)}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              End Chat
            </button>
          )}

          {/* 3-dot overflow menu */}
          {isChat && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20">
                  {/* Summarize */}
                  {thread.messages.length > 0 && summaryState === 'idle' && (
                    <button
                      onClick={() => { handleSummarise(); closeMenu(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Summarize
                    </button>
                  )}
                  {/* Transfer */}
                  {thread.type === 'customer-chat' && onOpenChatTransfer && (
                    <button
                      onClick={() => { onOpenChatTransfer(); closeMenu(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      Transfer
                    </button>
                  )}
                  {/* Call */}
                  {onStartCall && (
                    <button
                      onClick={() => { onStartCall(); closeMenu(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                      </svg>
                      Call
                    </button>
                  )}
                  {/* Share Cart */}
                  {thread.type === 'customer-chat' && (
                    <button
                      onClick={() => { setShareCartOpen(o => !o); closeMenu(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Share Cart
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Context strip — customer identity, issue, sentiment */}
      {(thread.type === 'customer-chat' || thread.type === 'customer-call') && (
        <ContextStrip thread={thread} />
      )}

      {/* Summary — slim strip below header */}
      {isChat && summaryState !== 'idle' && (
        <div className="px-4 py-2 bg-white border-b border-gray-100 flex-shrink-0">
          {summaryState === 'loading' && (
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-blue-600 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-xs text-gray-500">Summarising…</span>
            </div>
          )}
          {summaryState === 'shown' && (
            <div className="flex items-start gap-2">
              <p className="flex-1 text-xs text-gray-700 leading-relaxed">{summary}</p>
              <button
                onClick={() => setSummaryState('idle')}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      {isCall ? (
        <CallControls
          thread={thread}
          consultingWithThread={consultingWithThread}
          muted={muted}
          onHoldToggle={onHoldToggle}
          onMuteToggle={onMuteToggle}
          onEndCall={onEndCall}
          onWarmTransfer={onWarmTransfer}
          onOpenDirectory={onOpenDirectory}
          relatedChat={relatedChat}
          onSwitchToChat={onSwitchToChat}
          transferSuggestion={transferSuggestion}
        />
      ) : isChat ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

          {/* ── Scrollable region: sentiment + messages only ── */}
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col bg-gray-50">

            {/* Sentiment alert */}
            {!sentimentDismissed && (thread.sentiment === 'negative' || thread.sentiment === 'escalating') && (
              <div className={cn(
                'flex items-start gap-2.5 px-4 py-2.5 border-b flex-shrink-0',
                thread.sentiment === 'escalating'
                  ? 'bg-red-50 border-red-100'
                  : 'bg-amber-50 border-amber-100'
              )}>
                <svg className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', thread.sentiment === 'escalating' ? 'text-red-500' : 'text-amber-500')} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[11px] font-semibold leading-tight', thread.sentiment === 'escalating' ? 'text-red-700' : 'text-amber-800')}>
                    {thread.sentiment === 'escalating' ? 'Sentiment escalating — customer is upset' : 'Negative sentiment detected'}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">AI: Consider acknowledging the frustration before troubleshooting.</p>
                </div>
                <button
                  onClick={() => setSentimentDismissed(true)}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Messages — push to bottom when few */}
            <div className="flex flex-col justify-end flex-1 px-4 py-2">
              {thread.messages.length === 0 ? (
                <div className="text-xs text-gray-400 text-center">No messages yet</div>
              ) : (
                thread.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── Footer: AI suggest + share cart + composer (pinned to bottom) ── */}

          {/* AI Suggest panel */}
          {suggestState !== 'idle' && (
            <div className="border-t border-gray-200 bg-white flex-shrink-0">
              {suggestState === 'loading' && (
                <div className="flex items-center gap-2 px-4 py-3">
                  <svg className="w-3.5 h-3.5 text-blue-600 animate-pulse flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z" />
                  </svg>
                  <span className="text-xs text-blue-700 font-medium">Generating suggestion…</span>
                </div>
              )}
              {suggestState === 'shown' && (
                <div className="px-4 pt-3 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z" />
                      </svg>
                      <span className="text-[11px] font-semibold text-gray-700">Assist</span>
                    </div>
                    <button onClick={() => setSuggestState('idle')} className="text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <textarea
                    value={suggestText}
                    onChange={(e) => setSuggestText(e.target.value)}
                    rows={3}
                    style={{ maxHeight: 96, overflowY: 'auto' }}
                    className="w-full text-xs text-gray-800 leading-relaxed border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-gray-50"
                  />
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      {TONES.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => handleToneChange(key)}
                          className={cn(
                            'text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors',
                            suggestTone === key
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleInsertSuggestion}
                      className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Use
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Share cart panel */}
          {shareCartOpen && (
            <ShareCartPanel
              mode="chat"
              onSendToChat={(text) => { onComposerChange(text); onSendMessage(); }}
              onClose={() => setShareCartOpen(false)}
            />
          )}

          {/* Composer */}
          <ChatComposer
            value={composerText}
            onChange={onComposerChange}
            onSend={onSendMessage}
            onAISuggest={handleAISuggest}
            recipientName={thread.participantName}
            disabled={thread.status === 'ended' || thread.status === 'transferred' || thread.status === 'transferring'}
          />
        </div>
      ) : null}

      {/* End Chat confirmation modal */}
      {endChatConfirm && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-xl w-64 p-6 flex flex-col gap-4">
            <div>
              <p className="text-[13px] font-bold text-gray-900 mb-1">End this chat?</p>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                This will close the conversation with {thread.participantName}. This action can't be undone.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setEndChatConfirm(false); onEndChat!(); }}
                className="w-full py-2 rounded-xl bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors"
              >
                End Chat
              </button>
              <button
                onClick={() => setEndChatConfirm(false)}
                className="w-full py-2 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
