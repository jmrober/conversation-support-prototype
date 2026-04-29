import type { ScenarioFlow } from '../types';

export function getMultiChatQueueFlow(): ScenarioFlow {
  const now = Date.now();

  const escalatedChat = {
    id: 's3-chat-1',
    type: 'customer-chat' as const,
    status: 'escalated' as const,
    participantName: 'Chen Wei',
    issueTag: 'Account Locked',
    sentiment: 'escalating' as const,
    accountTier: 'premium' as const,
    lastMessage: "I've been locked out for 2 hours — this is completely unacceptable.",
    timestamp: '10:52',
    unreadCount: 3,
    messages: [
      { id: 's3-c1-m1', sender: 'customer' as const, senderName: 'Chen', text: "My account has been locked and I can't access anything.", timestamp: '10:48' },
      { id: 's3-c1-m2', sender: 'agent' as const, senderName: 'You', text: "I'm looking into this now. Can you confirm your email address?", timestamp: '10:49' },
      { id: 's3-c1-m3', sender: 'customer' as const, senderName: 'Chen', text: "chen.wei@email.com. I've been locked out for 2 hours — this is completely unacceptable.", timestamp: '10:52' },
    ],
  };

  const waitingChat = {
    id: 's3-chat-2',
    type: 'customer-chat' as const,
    status: 'waiting' as const,
    participantName: 'Emma Torres',
    issueTag: 'Billing Query',
    slaDeadlineAt: now + 4 * 60_000,
    lastMessage: 'Hi, I have a question about my last invoice.',
    timestamp: '10:55',
    unreadCount: 1,
    messages: [
      { id: 's3-c2-m1', sender: 'customer' as const, senderName: 'Emma', text: 'Hi, I have a question about my last invoice.', timestamp: '10:55' },
    ],
  };

  const activeChat = {
    id: 's3-chat-3',
    type: 'customer-chat' as const,
    status: 'active' as const,
    participantName: 'James Park',
    issueTag: 'Order Tracking',
    chatMode: 'live' as const,
    lastMessage: "Thanks! The order number is ORD-78234.",
    timestamp: '10:51',
    unreadCount: 0,
    messages: [
      { id: 's3-c3-m1', sender: 'customer' as const, senderName: 'James', text: "Where is my order? It was supposed to arrive yesterday.", timestamp: '10:49' },
      { id: 's3-c3-m2', sender: 'agent' as const, senderName: 'You', text: "I'd be happy to track that for you. Can you share your order number?", timestamp: '10:50' },
      { id: 's3-c3-m3', sender: 'customer' as const, senderName: 'James', text: "Thanks! The order number is ORD-78234.", timestamp: '10:51' },
    ],
  };

  const idleChat = {
    id: 's3-chat-4',
    type: 'customer-chat' as const,
    status: 'idle' as const,
    participantName: 'Priya Nair',
    issueTag: 'Refund Request',
    lastMessage: 'Could you check the status? I submitted it last week.',
    timestamp: '10:44',
    unreadCount: 0,
    messages: [
      { id: 's3-c4-m1', sender: 'customer' as const, senderName: 'Priya', text: "I submitted a refund request last week and haven't heard back.", timestamp: '10:42' },
      { id: 's3-c4-m2', sender: 'agent' as const, senderName: 'You', text: "I'll look that up now. One moment please.", timestamp: '10:43' },
      { id: 's3-c4-m3', sender: 'customer' as const, senderName: 'Priya', text: 'Could you check the status? I submitted it last week.', timestamp: '10:44' },
    ],
  };

  // Step 2: SLA on Emma is now critical
  const waitingChatUrgent = {
    ...waitingChat,
    slaDeadlineAt: now + 90_000,
  };

  return {
    id: 'multi-chat-queue',
    index: 4,
    title: 'Chat Queue — Multiple Contacts',
    subtitle: 'Agent managing several concurrent chats across different states',
    tags: ['MULTI-CHAT', 'QUEUE', 'SLA'],
    description: 'Agent manages four concurrent chats in varying states — escalated, waiting, active, and idle.',
    steps: [
      {
        id: 'full-queue',
        label: 'Full queue view',
        hint: 'Four concurrent chats: Chen Wei escalated (3 unread), Emma Torres waiting (SLA ticking), James Park active, Priya Nair idle',
        threads: [escalatedChat, waitingChat, activeChat, idleChat],
      },
      {
        id: 'sla-pressure',
        label: 'SLA pressure mounting',
        hint: "Emma Torres's SLA is now critical — agent must triage: respond to Chen Wei (escalated) or Emma (SLA breach imminent)?",
        threads: [escalatedChat, waitingChatUrgent, activeChat, idleChat],
      },
    ],
  };
}
