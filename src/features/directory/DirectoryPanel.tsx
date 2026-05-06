import { useState } from 'react';
import type { DirectoryEntry, Thread } from '../../types';
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
  outbound:        'New Call',
  'active-call':   'Transfer Call',
  'internal-chat': 'New Message',
  'chat-transfer': 'Transfer Chat',
};

export default function DirectoryPanel({
  mode,
  activeCustomerCall,
  onDialNumber,
  onClose,
}: Props) {
  const [dialInput, setDialInput] = useState('');

  const isTransfer = mode === 'active-call';
  const accentRing = isTransfer ? 'focus:ring-blue-300' : 'focus:ring-green-300';
  const actionBg   = isTransfer ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';

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
        <span className="text-sm font-semibold text-gray-700">{HEADER_LABEL[mode]}</span>
      </div>

      {/* Dial pad */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-4">
        {isTransfer && activeCustomerCall && (
          <p className="text-[11px] text-gray-500 leading-snug">
            Dial an external number to transfer{' '}
            <span className="font-semibold text-gray-700">{activeCustomerCall.participantName}</span>.
          </p>
        )}

        <input
          type="tel"
          placeholder="e.g. +44 7700 900123"
          value={dialInput}
          onChange={(e) => setDialInput(e.target.value)}
          autoFocus
          className={cn(
            'text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:border-transparent',
            accentRing
          )}
        />

        <div className="grid grid-cols-3 gap-2">
          {['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => (
            <button
              key={key}
              onClick={() => setDialInput(v => v + key)}
              className="h-12 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-base font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              {key}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => setDialInput(v => v.slice(0, -1))}
            disabled={!dialInput}
            className="flex items-center justify-center w-12 h-11 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors flex-shrink-0"
            title="Backspace"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
            </svg>
          </button>
          <button
            onClick={() => dialInput.trim() && onDialNumber(dialInput.trim())}
            disabled={!dialInput.trim()}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 h-11 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
              actionBg
            )}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
            </svg>
            {isTransfer ? `Transfer to ${dialInput || 'number'}` : 'Dial'}
          </button>
        </div>
      </div>
    </div>
  );
}
