import type { ScenarioFlow } from '../types';

export function getBlendedAgentFlow(): ScenarioFlow {
  const now = Date.now();

  const inboundCall = {
    id: 's6-call',
    type: 'customer-call' as const,
    status: 'active' as const,
    participantName: 'Dave Miller',
    caseId: 'CS-5305',
    issueTag: 'Billing Dispute',
    callDirection: 'inbound' as const,
    callStartedAt: now - 125000,
    transferSuggestion: 'Billing Support Queue',
    sentiment: 'negative' as const,
    accountTier: 'premium' as const,
    lastMessage: 'Inbound call',
    timestamp: '15:04',
    unreadCount: 0,
    messages: [],
  };

  const activeChat = {
    id: 's6-chat-1',
    type: 'customer-chat' as const,
    status: 'active' as const,
    participantName: 'Yuki Tanaka',
    issueTag: 'Delivery Issue',
    chatMode: 'live' as const,
    lastMessage: 'The parcel was marked delivered but it never arrived.',
    timestamp: '15:02',
    unreadCount: 0,
    messages: [
      { id: 's6-c1-m1', sender: 'customer' as const, senderName: 'Yuki', text: 'The parcel was marked delivered but it never arrived.', timestamp: '15:02' },
    ],
  };

  const waitingChat = {
    id: 's6-chat-2',
    type: 'customer-chat' as const,
    status: 'waiting' as const,
    participantName: 'Sam Osei',
    issueTag: 'Return Request',
    slaDeadlineAt: now + 6 * 60_000,
    lastMessage: "Hi, I'd like to return a product I bought last week.",
    timestamp: '15:01',
    unreadCount: 1,
    chatbotSummary: {
      botName: 'Aria',
      handoffReason: 'Customer requested a human agent',
      summary: 'Customer wants to return a wireless headset purchased 6 days ago. Bot confirmed the item is within the 30-day return window and provided a returns label link, but the customer could not locate the original packaging and asked to speak with an agent about alternative return options.',
      dataPoints: [
        { label: 'Order', value: 'ORD-92847' },
        { label: 'Item', value: 'ProSound BT-400 Headset' },
        { label: 'Purchase date', value: '30 Apr 2026' },
        { label: 'Return reason', value: 'Changed mind' },
        { label: 'Bot resolution', value: 'Unresolved' },
      ],
    },
    messages: [
      { id: 's6-c2-m1', sender: 'customer' as const, senderName: 'Sam', text: "Hi, I'd like to return a product I bought last week.", timestamp: '15:01' },
    ],
  };

  const internalChat = {
    id: 's6-internal-1',
    type: 'internal-chat' as const,
    status: 'active' as const,
    participantName: 'Priya Nair',
    participantRole: 'Team Lead',
    lastMessage: "Hey, heads up — escalate any billing disputes over £200 to me directly today.",
    timestamp: '15:00',
    unreadCount: 1,
    messages: [
      { id: 's6-i1-m1', sender: 'customer' as const, senderName: 'Priya', text: "Hey, heads up — escalate any billing disputes over £200 to me directly today.", timestamp: '15:00' },
    ],
  };

  // Step 2: call on hold while agent focuses on chats
  const callOnHold = {
    ...inboundCall,
    status: 'on-hold' as const,
  };

  const waitingChatUrgent = {
    ...waitingChat,
    slaDeadlineAt: now + 75_000,
  };

  return {
    id: 'blended-agent',
    index: 7,
    title: 'Blended Agent — Chat & Call',
    subtitle: 'Handling concurrent chats while managing an active inbound call',
    tags: ['BLENDED', 'CONCURRENT', 'QUEUE'],
    description: 'Blended agent simultaneously manages an active inbound call and two concurrent chat contacts.',
    steps: [
      {
        id: 'blended-active',
        label: 'Blended — call + 2 chats + internal',
        hint: 'Dave Miller on inbound call (2:05 in), Yuki Tanaka active in chat, Sam Osei waiting (SLA ticking), Priya Nair (Team Lead) with an unread internal message',
        threads: [inboundCall, activeChat, waitingChat, internalChat],
      },
      {
        id: 'call-held-chats-focus',
        label: 'Call on hold — chat focus',
        hint: "Dave placed on hold so agent can respond to Sam's return request before SLA breach — classic blended agent triage",
        threads: [callOnHold, activeChat, waitingChatUrgent, internalChat],
      },
    ],
  };
}
