import type { Thread } from '../types';

export const mockThreads: Thread[] = [
  // ── Active call ────────────────────────────────────────────────────────────
  {
    id: 'thread-2',
    type: 'customer-call',
    status: 'active',
    participantName: 'Carol Davis',
    caseId: 'CS-4823',
    lastMessage: 'Inbound call — active',
    timestamp: '10:40',
    unreadCount: 0,
    messages: [],
    callDirection: 'inbound',
    callStartedAt: Date.now() - 147_000,
    muted: false,
  },

  // ── Live customer chat (frustrated, unread) ────────────────────────────────
  {
    id: 'thread-1',
    type: 'customer-chat',
    status: 'active',
    chatMode: 'live',
    participantName: 'Alice Martin',
    caseId: 'CS-4821',
    lastMessage: "It's been over two weeks — I'm really frustrated.",
    timestamp: '10:42',
    unreadCount: 2,
    messages: [
      {
        id: 'm1-0',
        sender: 'agent',
        senderName: 'Jordan Riley',
        text: "Hi Alice! I'm Jordan and I'll be helping you today. How can I assist you?",
        timestamp: '10:37',
        automated: true,
      },
      { id: 'm1-1', sender: 'customer', senderName: 'Alice Martin', text: "Hi, I placed an order on the 3rd and it still hasn't arrived.", timestamp: '10:38' },
      { id: 'm1-2', sender: 'agent', senderName: 'You', text: "Hi Alice, I'm sorry to hear that. Let me pull up your order right now.", timestamp: '10:39' },
      { id: 'm1-3', sender: 'customer', senderName: 'Alice Martin', text: "Order number is ORD-88821. Tracking hasn't updated in days.", timestamp: '10:40' },
      { id: 'm1-4', sender: 'agent', senderName: 'You', text: 'Got it, checking on ORD-88821 now. One moment please.', timestamp: '10:41' },
      { id: 'm1-5', sender: 'customer', senderName: 'Alice Martin', text: "It's been over two weeks — I'm really frustrated.", timestamp: '10:42' },
    ],
  },

  // ── Async customer chat (waiting, no agent response yet) ───────────────────
  {
    id: 'thread-3',
    type: 'customer-chat',
    status: 'waiting',
    chatMode: 'async',
    participantName: 'Ben Torres',
    caseId: 'CS-4819',
    lastMessage: 'Can I get a refund for item #4421?',
    timestamp: '9:15',
    unreadCount: 3,
    messages: [
      { id: 'm3-1', sender: 'customer', senderName: 'Ben Torres', text: "Hi, I bought a pair of shoes last week but they're the wrong size.", timestamp: '9:12' },
      { id: 'm3-2', sender: 'customer', senderName: 'Ben Torres', text: "I'd like to either exchange or get a refund.", timestamp: '9:13' },
      { id: 'm3-3', sender: 'customer', senderName: 'Ben Torres', text: 'Can I get a refund for item #4421?', timestamp: '9:15' },
    ],
  },

  // ── Internal live chat ─────────────────────────────────────────────────────
  {
    id: 'thread-4',
    type: 'internal-chat',
    status: 'unread',
    chatMode: 'live',
    participantName: 'Sam Okafor',
    participantRole: 'Delivery Agent',
    lastMessage: 'Yes, I can check that route.',
    timestamp: '10:35',
    unreadCount: 1,
    messages: [
      { id: 'm4-1', sender: 'agent', senderName: 'You', text: 'Hey Sam — can you check on ORD-88821? Customer says no movement in 2 weeks.', timestamp: '10:33' },
      { id: 'm4-2', sender: 'internal', senderName: 'Sam Okafor', text: 'Yes, I can check that route.', timestamp: '10:35' },
    ],
  },

  // ── Async customer chat: auto-welcome + awaiting agent ─────────────────────
  {
    id: 'thread-5',
    type: 'customer-chat',
    status: 'waiting',
    chatMode: 'async',
    participantName: 'David Kim',
    caseId: 'CS-4817',
    lastMessage: "I can't log into my account at all.",
    timestamp: '9:55',
    unreadCount: 1,
    messages: [
      {
        id: 'm5-0',
        sender: 'agent',
        senderName: 'Jordan Riley',
        text: "Hi David! I'm Jordan and I'll be looking after you today. Give me just a moment to review your account and I'll be right with you.",
        timestamp: '9:54',
        automated: true,
      },
      { id: 'm5-1', sender: 'customer', senderName: 'David Kim', text: "I can't log into my account at all.", timestamp: '9:55' },
    ],
  },

  // ── Resolved chat with auto-close system message ───────────────────────────
  {
    id: 'thread-6',
    type: 'customer-chat',
    status: 'active',
    chatMode: 'async',
    participantName: 'Maya Patel',
    caseId: 'CS-4820',
    lastMessage: 'Chat closed after 2 minutes of inactivity.',
    timestamp: '10:22',
    unreadCount: 0,
    messages: [
      { id: 'm6-1', sender: 'customer', senderName: 'Maya Patel', text: 'My promo code SUMMER20 is not applying at checkout.', timestamp: '10:15' },
      { id: 'm6-2', sender: 'agent', senderName: 'You', text: 'That code expired on April 1st. I can apply a 15% discount manually for you today.', timestamp: '10:18' },
      { id: 'm6-3', sender: 'customer', senderName: 'Maya Patel', text: 'Thank you, that worked!', timestamp: '10:20' },
      {
        id: 'm6-4',
        sender: 'system',
        senderName: 'System',
        text: 'No activity for 2 minutes. An automated message was sent and this chat has been closed.',
        timestamp: '10:22',
      },
    ],
  },
];
