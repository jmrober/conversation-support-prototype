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
    messages: [
      { id: 's6-c2-m1', sender: 'customer' as const, senderName: 'Sam', text: "Hi, I'd like to return a product I bought last week.", timestamp: '15:01' },
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
        label: 'Blended — call + 2 chats',
        hint: 'Dave Miller on inbound call (2:05 in), Yuki Tanaka active in chat, Sam Osei waiting with SLA ticking',
        threads: [inboundCall, activeChat, waitingChat],
      },
      {
        id: 'call-held-chats-focus',
        label: 'Call on hold — chat focus',
        hint: "Dave placed on hold so agent can respond to Sam's return request before SLA breach — classic blended agent triage",
        threads: [callOnHold, activeChat, waitingChatUrgent],
      },
    ],
  };
}
