import type { Thread } from '../../types';

interface Props {
  thread: Thread;
  forceExpanded?: boolean;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3 py-1.5">
      <span className="text-[11px] text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-[11px] font-medium text-gray-700 text-right break-all">{value}</span>
    </div>
  );
}

export default function ContextStrip({ thread, forceExpanded }: Props) {
  const rows: { label: string; value: string }[] = [];

  if (thread.queue)        rows.push({ label: 'Queue',         value: thread.queue });
  if (thread.source)       rows.push({ label: 'Source',        value: thread.source });
  if (thread.entryPoint)   rows.push({ label: 'Entry Point',   value: thread.entryPoint });
  if (thread.entryUrl)     rows.push({ label: 'Entry URL',     value: thread.entryUrl });
  if (thread.storeAddress) rows.push({ label: 'Store Address', value: thread.storeAddress });
  if (thread.storeNumber)  rows.push({ label: 'Store Number',  value: thread.storeNumber });
  if (thread.chatId)       rows.push({ label: 'Chat ID',       value: thread.chatId });
  if (thread.taskId)       rows.push({ label: 'Task ID',       value: thread.taskId });

  if (rows.length === 0) return null;

  return (
    <div className="flex-shrink-0 border-b border-gray-100">
      {forceExpanded && (
        <div className="bg-white px-4 pt-1 pb-2 overflow-y-auto max-h-64">
          {rows.map(r => <Row key={r.label} label={r.label} value={r.value} />)}
        </div>
      )}
    </div>
  );
}
