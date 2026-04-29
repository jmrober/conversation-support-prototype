import { useState } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  remaining: number;
  participantName?: string;
  issueTag?: string;
  onComplete: () => void;
  onSkip: () => void;
  onDismiss: () => void;
}

type Disposition = 'resolved' | 'escalated' | 'follow-up' | 'unresolved';

const DISPOSITIONS: { key: Disposition; label: string }[] = [
  { key: 'resolved',   label: 'Resolved' },
  { key: 'escalated',  label: 'Escalated' },
  { key: 'follow-up',  label: 'Follow-Up' },
  { key: 'unresolved', label: 'Unresolved' },
];

function generateWrapUpSummary(name?: string, issueTag?: string): string {
  const who = name ?? 'Customer';
  const issue = issueTag ?? 'support issue';
  return `${who} contacted support regarding ${issue.toLowerCase()}. Issue discussed and next steps determined during the call.`;
}

export default function WrapUpTimer({ remaining, participantName, issueTag, onComplete, onSkip, onDismiss }: Props) {
  const pct = Math.max(0, (remaining / 30) * 100);
  const [disposition, setDisposition] = useState<Disposition | null>(null);
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState(() => generateWrapUpSummary(participantName, issueTag));
  const canComplete = disposition !== null;

  return (
    <div className="absolute inset-0 z-40 bg-black/50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl shadow-2xl max-h-[90dvh] flex flex-col">

        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Wrap-Up</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {participantName ? `${participantName} · ` : ''}{issueTag ?? 'Complete your notes'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="text-right">
                <div className={cn(
                  'text-2xl font-bold tabular-nums leading-none',
                  remaining <= 10 ? 'text-red-600' : 'text-gray-800'
                )}>
                  {remaining}
                </div>
                <div className="text-[10px] text-gray-400 text-right">sec</div>
              </div>
              <button
                onClick={onDismiss}
                className="mt-0.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                title="Minimize"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Timer bar */}
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-100 ease-linear',
                remaining <= 10 ? 'bg-red-400' : 'bg-amber-400'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pb-2 space-y-4">

          {/* AI Summary */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <svg className="w-3 h-3 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.09 3.26L16 6l-2.91.74L12 10l-1.09-3.26L8 6l2.91-.74L12 2zm6 10l.73 2.18L21 15l-2.27.82L18 18l-.73-2.18L15 15l2.27-.82L18 12zm-12 0l.73 2.18L9 15l-2.27.82L6 18l-.73-2.18L3 15l2.27-.82L6 12z" />
              </svg>
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">AI Summary</span>
            </div>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={2}
              className="w-full text-xs text-gray-700 leading-relaxed border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 bg-blue-50/40"
            />
          </div>

          {/* Disposition — required */}
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Disposition</span>
              <span className="text-[10px] font-bold text-red-500">*</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {DISPOSITIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setDisposition(key)}
                  className={cn(
                    'h-9 text-xs font-semibold rounded-lg border transition-colors',
                    disposition === key
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes — optional */}
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
              Notes <span className="normal-case font-normal text-gray-300">(optional)</span>
            </span>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional notes for the case record…"
              rows={2}
              className="w-full text-xs text-gray-700 placeholder-gray-300 leading-relaxed border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pt-3 pb-6 flex-shrink-0 border-t border-gray-100 space-y-2">
          <button
            onClick={onComplete}
            disabled={!canComplete}
            className={cn(
              'w-full h-11 rounded-xl text-sm font-bold transition-colors',
              canComplete
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {canComplete ? 'Complete Wrap-Up' : 'Select a disposition to complete'}
          </button>
          <button
            onClick={onSkip}
            className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
          >
            Skip wrap-up
          </button>
        </div>

      </div>
    </div>
  );
}
