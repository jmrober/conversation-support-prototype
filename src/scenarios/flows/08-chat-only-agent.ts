import type { ScenarioFlow } from '../types';

export function getChatOnlyAgentFlow(): ScenarioFlow {
  const now = Date.now();

  // ── Threads ───────────────────────────────────────────────────────────────

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

  return {
    id: 'chat-only-agent',
    index: 8,
    title: 'Chat-Only Agent',
    subtitle: 'Agent handles concurrent customer chats — no calls',
    tags: ['CHAT', 'CONCURRENT'],
    description: 'Chat-only agent manages two concurrent customer chats. A second chat arrives while the first is mid-conversation — agent must triage and respond to both.',
    steps: [
      {
        id: 'single-chat',
        label: 'Active chat — mid-conversation',
        hint: 'Aisha Patel is mid-conversation about an undelivered order. Agent is actively investigating.',
        threads: [chat1],
        initialSelectedId: 's8-chat-1',
        initialView: 'detail',
      },
      {
        id: 'second-chat-arrives',
        label: 'Second chat arrives',
        hint: 'Leo Martins has come in on a separate chat about a promo code issue — agent now has two concurrent chats to manage.',
        threads: [chat1, chat2],
        initialSelectedId: 's8-chat-2',
        initialView: 'detail',
      },
      {
        id: 'both-active',
        label: 'Both chats active',
        hint: 'Agent has responded to Leo and is now juggling both conversations simultaneously — the core chat-only agent workflow.',
        threads: [chat1Reply, chat2Active],
        initialSelectedId: 's8-chat-1',
        initialView: 'detail',
      },
    ],
  };
}
