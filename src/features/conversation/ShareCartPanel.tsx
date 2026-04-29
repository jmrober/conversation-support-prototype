import { useState } from 'react';
import { cn } from '../../utils/cn';

interface Props {
  mode: 'call' | 'chat';
  onSendToChat?: (text: string) => void;
  onClose: () => void;
}

const CART_ITEMS = [
  { name: 'ProBook X1 Laptop Stand', qty: 1, unitPrice: 49.99 },
  { name: 'USB-C Hub 7-in-1',        qty: 2, unitPrice: 44.99 },
  { name: 'Screen Cleaning Kit',      qty: 1, unitPrice: 14.99 },
];

const CART_TOTAL = CART_ITEMS.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}

function buildCartMessage(): string {
  const lines = CART_ITEMS.map(
    item => `• ${item.name} × ${item.qty} — ${formatPrice(item.unitPrice * item.qty)}`
  );
  return `Here's a link to your current cart:\n\n${lines.join('\n')}\n\nCart total: ${formatPrice(CART_TOTAL)}\n\nClick the link to review and complete your purchase: https://shop.example.com/cart/restore/abc123`;
}

export default function ShareCartPanel({ mode, onSendToChat, onClose }: Props) {
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (mode === 'chat' && onSendToChat) {
      onSendToChat(buildCartMessage());
    }
    setSent(true);
    if (mode === 'chat') {
      setTimeout(onClose, 1200);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[11px] font-semibold text-gray-700">Customer Cart</span>
          <span className="min-w-[18px] h-[18px] bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {CART_ITEMS.length}
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Cart items */}
      <div className="px-4 pb-2 flex flex-col gap-1.5">
        {CART_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0 w-5 h-5 rounded bg-gray-100 text-gray-500 text-[10px] font-semibold flex items-center justify-center">
                {item.qty}
              </span>
              <span className="text-[11px] text-gray-700 truncate">{item.name}</span>
            </div>
            <span className="text-[11px] font-medium text-gray-600 flex-shrink-0 tabular-nums">
              {formatPrice(item.unitPrice * item.qty)}
            </span>
          </div>
        ))}

        {/* Divider + total */}
        <div className="flex justify-between items-center pt-1.5 border-t border-gray-100 mt-0.5">
          <span className="text-[11px] font-semibold text-gray-500">Total</span>
          <span className="text-[12px] font-bold text-gray-800 tabular-nums">{formatPrice(CART_TOTAL)}</span>
        </div>
      </div>

      {/* Action */}
      <div className="px-4 pb-3 pt-1">
        {sent ? (
          <div className={cn(
            'flex items-center justify-center gap-1.5 h-9 rounded-lg text-[12px] font-semibold',
            mode === 'call' ? 'bg-green-50 text-green-700' : 'bg-green-50 text-green-700'
          )}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {mode === 'call' ? 'Cart link sent' : 'Sent to chat'}
          </div>
        ) : (
          <button
            onClick={handleSend}
            className="w-full h-9 rounded-lg bg-blue-600 text-white text-[12px] font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {mode === 'call' ? 'Send Cart Link to Customer' : 'Send to Chat'}
          </button>
        )}
      </div>
    </div>
  );
}
