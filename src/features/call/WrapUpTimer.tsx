interface Props {
  remaining: number;
  onSkip: () => void;
  onDismiss: () => void;
}

export default function WrapUpTimer({ remaining, onSkip, onDismiss }: Props) {
  const pct = Math.max(0, (remaining / 30) * 100);

  return (
    <div className="absolute inset-0 z-40 bg-black/50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl px-6 pt-6 pb-8 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Wrap-Up
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Wrap-up in progress
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 tabular-nums leading-none">
                {remaining}
              </div>
              <div className="text-xs text-gray-400 text-right">seconds</div>
            </div>
            {/* Dismiss — hides overlay, timer keeps running */}
            <button
              onClick={onDismiss}
              className="mt-0.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              title="Dismiss — wrap-up continues in the status bar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Status will return to <span className="font-medium text-green-600">Available</span> automatically when the timer ends.
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 text-sm font-medium text-gray-500 hover:text-gray-700 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Minimize
          </button>
          <button
            onClick={onSkip}
            className="flex-1 text-sm font-semibold text-amber-700 py-2 border border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors"
          >
            Skip Wrap-Up
          </button>
        </div>
      </div>
    </div>
  );
}
