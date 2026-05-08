import type { ScenarioFlow } from '../types';

export function getChatOnlyAgentFlow(): ScenarioFlow {
  const now = Date.now();

  // ── Chat 1 — Aisha Patel (customer) ──────────────────────────────────────

  const chat1 = {
    id: 's8-chat-1',
    type: 'customer-chat' as const,
    status: 'active' as const,
    participantName: 'Aisha Patel',
    issueTag: 'Order Not Received',
    chatMode: 'live' as const,
    queue: 'Customer Support',
    source: 'Web',
    entryUrl: 'acme.com/orders/track',
    entryPoint: 'Order Tracking',
    chatId: 'CHT-881201',
    taskId: 'TSK-774401',
    chatStartedAt: now - 4 * 60_000,
    lastMessage: "It was supposed to arrive three days ago and tracking hasn't updated.",
    timestamp: '11:14',
    unreadCount: 0,
    messages: [
      { id: 's8-c1-m1', sender: 'customer' as const, senderName: 'Aisha', text: "Hi, my order still hasn't arrived.", timestamp: '11:10' },
      { id: 's8-c1-m2', sender: 'agent' as const, senderName: 'You', text: "Sorry to hear that — I'll look into it. Can you share your order number?", timestamp: '11:11' },
      { id: 's8-c1-m3', sender: 'customer' as const, senderName: 'Aisha', text: "It's ORD-55902. It was supposed to arrive three days ago and tracking hasn't updated.", timestamp: '11:14' },
    ],
  };

  const chat1Reply = {
    ...chat1,
    messages: [
      ...chat1.messages,
      { id: 's8-c1-m4', sender: 'agent' as const, senderName: 'You', text: "I can see ORD-55902 — the carrier last scanned it 4 days ago. I'm raising a trace with them now and will follow up within 24 hours.", timestamp: '11:20' },
    ],
    lastMessage: "I can see ORD-55902 — the carrier last scanned it 4 days ago. I'm raising a trace with them now and will follow up within 24 hours.",
    timestamp: '11:20',
    status: 'active' as const,
  };

  // ── Chat 2 — Leo Martins (customer) ──────────────────────────────────────

  const chat2 = {
    id: 's8-chat-2',
    type: 'customer-chat' as const,
    status: 'waiting' as const,
    participantName: 'Leo Martins',
    issueTag: 'Promo Code Issue',
    queue: 'Customer Support',
    source: 'Web',
    entryUrl: 'acme.com/checkout',
    entryPoint: 'Checkout',
    chatId: 'CHT-882302',
    taskId: 'TSK-775502',
    slaDeadlineAt: now + 5 * 60_000,
    chatStartedAt: now - 2 * 60_000,
    lastMessage: "I'm trying to apply a promo code but it says it's invalid.",
    timestamp: '11:16',
    unreadCount: 1,
    messages: [
      { id: 's8-c2-m1', sender: 'customer' as const, senderName: 'Leo', text: "Hi, I'm trying to apply a promo code but it says it's invalid.", timestamp: '11:16' },
    ],
  };

  const chat2Active = {
    ...chat2,
    status: 'active' as const,
    unreadCount: 0,
    messages: [
      ...chat2.messages,
      { id: 's8-c2-m2', sender: 'agent' as const, senderName: 'You', text: "Happy to help! Which promo code are you trying to use?", timestamp: '11:18' },
      { id: 's8-c2-m3', sender: 'customer' as const, senderName: 'Leo', text: "WELCOME20 — it's the one from my signup email.", timestamp: '11:19' },
    ],
    lastMessage: "WELCOME20 — it's the one from my signup email.",
    timestamp: '11:19',
  };

  // ── Chat 3 — Maya Santos (customer) ──────────────────────────────────────

  const chat3 = {
    id: 's8-chat-3',
    type: 'customer-chat' as const,
    status: 'waiting' as const,
    participantName: 'Maya Santos',
    issueTag: 'Return Request',
    queue: 'Customer Support',
    source: 'Mobile App',
    entryUrl: 'acme.com/returns',
    entryPoint: 'Returns Portal',
    chatId: 'CHT-883403',
    taskId: 'TSK-776603',
    slaDeadlineAt: now + 8 * 60_000,
    chatStartedAt: now - 1 * 60_000,
    lastMessage: "I want to return a jacket I bought last week — still has tags on.",
    timestamp: '11:21',
    unreadCount: 1,
    messages: [
      { id: 's8-c3-m1', sender: 'customer' as const, senderName: 'Maya', text: "Hi, I want to return a jacket I bought last week — still has tags on. How do I start the return?", timestamp: '11:21' },
    ],
  };

  const chat3Active = {
    ...chat3,
    status: 'active' as const,
    unreadCount: 0,
    messages: [
      ...chat3.messages,
      { id: 's8-c3-m2', sender: 'agent' as const, senderName: 'You', text: "Of course! I can get that started for you. Can you share your order number?", timestamp: '11:23' },
      { id: 's8-c3-m3', sender: 'customer' as const, senderName: 'Maya', text: "It's ORD-61104.", timestamp: '11:24' },
    ],
    lastMessage: "It's ORD-61104.",
    timestamp: '11:24',
  };

  // ── Chat 4 — Sam Thompson (internal) ─────────────────────────────────────

  const chat4 = {
    id: 's8-chat-4',
    type: 'internal-chat' as const,
    status: 'unread' as const,
    participantName: 'Sam Thompson',
    participantRole: 'Team Lead',
    chatStartedAt: now - 30_000,
    lastMessage: "Quick heads up — promo code WELCOME20 expired yesterday, FYI for any chats.",
    timestamp: '11:22',
    unreadCount: 1,
    messages: [
      { id: 's8-c4-m1', sender: 'customer' as const, senderName: 'Sam', text: "Quick heads up — promo code WELCOME20 expired yesterday. Just letting the team know in case it comes up in chats.", timestamp: '11:22' },
    ],
  };

  const chat4Active = {
    ...chat4,
    status: 'active' as const,
    unreadCount: 0,
    messages: [
      ...chat4.messages,
      { id: 's8-c4-m2', sender: 'agent' as const, senderName: 'You', text: "Thanks Sam — I actually have a customer on that exact issue right now. Super helpful timing!", timestamp: '11:25' },
    ],
    lastMessage: "Thanks Sam — I actually have a customer on that exact issue right now. Super helpful timing!",
    timestamp: '11:25',
  };

  return {
    id: 'chat-only-agent',
    index: 8,
    title: 'Chat-Only Agent',
    subtitle: 'Agent handles four concurrent chats — no calls',
    tags: ['CHAT', 'CONCURRENT', 'INTERNAL'],
    description: 'Chat-only agent manages four concurrent chats — three customer contacts and one internal message from a team lead. Chats arrive progressively, requiring the agent to triage, respond, and stay on top of all four simultaneously.',
    steps: [
      {
        id: 'single-chat',
        label: 'Active chat — mid-conversation',
        hint: 'Aisha Patel is mid-conversation about an undelivered order. Agent is actively investigating.',
        threads: [chat1],
        initialSelectedId: 's8-chat-1',
        initialView: 'detail' as const,
      },
      {
        id: 'second-chat-arrives',
        label: 'Second chat arrives',
        hint: 'Leo Martins has come in with a promo code issue — agent now has two concurrent chats to manage.',
        threads: [chat1, chat2],
        initialSelectedId: 's8-chat-2',
        initialView: 'detail' as const,
      },
      {
        id: 'third-chat-arrives',
        label: 'Third chat arrives',
        hint: 'Maya Santos joins with a return request. Agent is juggling three customer chats simultaneously.',
        threads: [chat1Reply, chat2Active, chat3],
        initialSelectedId: 's8-chat-3',
        initialView: 'detail' as const,
      },
      {
        id: 'internal-message-arrives',
        label: 'Internal message arrives',
        hint: "Team lead Sam Thompson sends a quick internal message — WELCOME20 expired yesterday, directly relevant to Leo's open chat.",
        threads: [chat1Reply, chat2Active, chat3Active, chat4],
        initialSelectedId: 's8-chat-4',
        initialView: 'detail' as const,
      },
      {
        id: 'all-four-active',
        label: 'All four chats active',
        hint: 'Agent is now managing all four chats simultaneously — three customers and one internal. Sam\'s tip directly helps resolve Leo\'s promo code issue.',
        threads: [chat1Reply, chat2Active, chat3Active, chat4Active],
        initialSelectedId: 's8-chat-1',
        initialView: 'detail' as const,
      },
    ],
  };
}
