import { useState } from 'react';
import type { QuickResponse } from '../../types';
import { mockQuickResponses } from '../../data/mockQuickResponses';
import { cn } from '../../utils/cn';

interface Props {
  onInsert: (text: string) => void;
  onClose: () => void;
}

const CATEGORIES = [...new Set(mockQuickResponses.map((r) => r.category))];

export default function QuickResponsePanel({ onInsert, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  const isSearching = query.trim().length > 0;
  const filtered = isSearching
    ? mockQuickResponses.filter((r) =>
        `${r.title} ${r.body} ${r.category}`.toLowerCase().includes(query.toLowerCase())
      )
    : mockQuickResponses;

  return (
    <div className="absolute inset-0 z-30 bg-white flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <span className="text-sm font-semibold text-gray-700">Quick Responses</span>
        <span className="ml-auto text-[11px] text-gray-400">{mockQuickResponses.length} responses</span>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, content, or category…"
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

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-10">No responses match your search</div>
        ) : isSearching ? (
          /* Flat list when searching */
          filtered.map((r) => (
            <ResponseItem
              key={r.id}
              response={r}
              showCategory
              hovered={hovered === r.id}
              onMouseEnter={() => setHovered(r.id)}
              onMouseLeave={() => setHovered(null)}
              onInsert={onInsert}
            />
          ))
        ) : (
          /* Grouped by category when browsing */
          CATEGORIES.map((cat) => {
            const items = filtered.filter((r) => r.category === cat);
            return (
              <div key={cat}>
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 sticky top-0">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {cat}
                  </span>
                </div>
                {items.map((r) => (
                  <ResponseItem
                    key={r.id}
                    response={r}
                    showCategory={false}
                    hovered={hovered === r.id}
                    onMouseEnter={() => setHovered(r.id)}
                    onMouseLeave={() => setHovered(null)}
                    onInsert={onInsert}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ResponseItem({
  response,
  showCategory,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onInsert,
}: {
  response: QuickResponse;
  showCategory: boolean;
  hovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onInsert: (text: string) => void;
}) {
  return (
    <button
      onClick={() => onInsert(response.body)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'w-full text-left px-3 py-2.5 border-b border-gray-100 transition-colors group',
        hovered ? 'bg-blue-50' : 'bg-white'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          {showCategory && (
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">
              {response.category} ·
            </span>
          )}
          <span className={cn(
            'text-xs font-semibold leading-tight truncate',
            hovered ? 'text-blue-700' : 'text-gray-900'
          )}>
            {response.title}
          </span>
        </div>
        <span className={cn(
          'text-[10px] font-semibold flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
          hovered ? 'text-blue-600' : 'text-gray-400'
        )}>
          Insert →
        </span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
        {response.body}
      </p>
    </button>
  );
}
