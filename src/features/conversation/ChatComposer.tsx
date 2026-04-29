import { useRef, useEffect, type KeyboardEvent } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onAISuggest: () => void;
  recipientName?: string;
  disabled?: boolean;
}

export default function ChatComposer({ value, onChange, onSend, onAISuggest, recipientName, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    resize(e.target);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSend();
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    if (!value) {
      el.style.height = 'auto';
    } else {
      resize(el);
    }
  }, [value]);

  return (
    <div className="border-t border-gray-200 bg-white px-4 pt-3 pb-4 flex-shrink-0">
      {recipientName && (
        <p className="text-[10px] text-gray-400 mb-1.5 px-0.5">
          Replying to <span className="font-semibold text-gray-500">{recipientName}</span>
        </p>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a reply…"
        disabled={disabled}
        rows={2}
        style={{ maxHeight: 120 }}
        className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 leading-relaxed overflow-y-auto"
      />
      <div className="flex items-center justify-between mt-2">

        {/* Assist button */}
        <button
          onClick={onAISuggest}
          disabled={disabled}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z" />
          </svg>
          Assist
        </button>

        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-3.5 h-3.5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}
