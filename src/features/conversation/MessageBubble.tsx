import type { Message } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isAgent = message.sender === 'agent';
  const isInternal = message.sender === 'internal';
  const isSystem = message.sender === 'system';
  const isAutomated = message.automated === true;

  // System messages — centered pill
  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 max-w-[88%]">
          <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] text-gray-500 text-center leading-snug">{message.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex mb-4', isAgent ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[82%]', isAgent ? 'items-end' : 'items-start', 'flex flex-col gap-0.5')}>
        {/* Sender name */}
        {!isAgent && (
          <span className={cn('text-[10px] font-medium px-1', isInternal ? 'text-slate-500' : 'text-gray-500')}>
            {message.senderName}
          </span>
        )}
        {/* Automated badge for agent messages */}
        {isAgent && isAutomated && (
          <div className="flex items-center justify-end gap-1 px-1 mb-0.5">
            <svg className="w-2.5 h-2.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z" />
            </svg>
            <span className="text-[9px] text-blue-400 font-medium">Automated</span>
          </div>
        )}
        {/* Bubble */}
        <div
          className={cn(
            'px-3 py-2 rounded-2xl text-sm leading-relaxed',
            isAgent
              ? isAutomated
                ? 'bg-blue-500/80 text-white rounded-br-sm'
                : 'bg-blue-600 text-white rounded-br-sm'
              : isInternal
              ? 'bg-slate-100 text-slate-800 rounded-bl-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          )}
        >
          {message.text}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{message.timestamp}</span>
      </div>
    </div>
  );
}
