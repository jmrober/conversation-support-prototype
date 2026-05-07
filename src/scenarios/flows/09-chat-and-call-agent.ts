import type { ScenarioFlow } from '../types';

export function getChatAndCallAgentFlow(): ScenarioFlow {
  const now = Date.now();

  const CHAT_ID = 's9-chat-1';

  // ── Chat thread ───────────────────────────────────────────────────────────

  const chat = {
    id: CHAT_ID,
    type: 'customer-chat' as const,
    status: 'active' as const,
    participantName: 'Sofia Reyes',
    participantPhone: '+44 7700 900247',
    issueTag: 'Delivery Dispute',
    chatMode: 'live' as const,
    queue: 'Customer Support',
    source: 'Web',
    entryUrl: 'acme.com/orders',
    entryPoint: 'Order History',
    chatId: 'CHT-990112',
    taskId: 'TSK-883301',
    chatStartedAt: now - 6 * 60_000,
    lastMessage: "I can assure you I was home all day — nobody knocked.",
    timestamp: '14:22',
    unreadCount: 0,
    messages: [
      { id: 's9-c1-m1', sender: 'customer' as const, senderName: 'Sofia', text: "My parcel says delivered but I never received it.", timestamp: '14:16' },
      { id: 's9-c1-m2', sender: 'agent' as const, senderName: 'You', text: "I'm sorry to hear that. Let me pull up your order now.", timestamp: '14:17' },
      { id: 's9-c1-m3', sender: 'customer' as const, senderName: 'Sofia', text: "The carrier says they attempted delivery at 2pm but I was home all day.", timestamp: '14:19' },
      { id: 's9-c1-m4', sender: 'agent' as const, senderName: 'You', text: "I can see the GPS scan on the carrier's end. Would it help if I called you directly so we can work through this together?", timestamp: '14:21' },
      { id: 's9-c1-m5', sender: 'customer' as const, senderName: 'Sofia', text: "I can assure you I was home all day — nobody knocked.", timestamp: '14:22' },
    ],
  };

  // ── Outbound call — linked to the chat above ──────────────────────────────

  const outboundCall = {
    id: 's9-call-1',
    type: 'customer-call' as const,
    status: 'active' as const,
    participantName: 'Sofia Reyes',
    participantPhone: '+44 7700 900247',
    issueTag: 'Delivery Dispute',
    caseId: 'CS-6601',
    callDirection: 'outbound' as const,
    callStartedAt: now - 90_000,
    relatedChatId: CHAT_ID,          // ← tied to the originating chat
    lastMessage: 'Outbound call',
    timestamp: '14:24',
    unreadCount: 0,
    messages: [],
  };

  // Chat stays visible alongside the call
  const chatDuringCall = {
    ...chat,
    status: 'active' as const,
  };

  return {
    id: 'chat-and-call-agent',
    index: 9,
    title: 'Chat + Call Agent',
    subtitle: 'Agent escalates a customer chat to an outbound call — both stay live',
    tags: ['CHAT', 'OUTBOUND', 'LINKED'],
    description: 'Agent is mid-chat with a customer about a delivery dispute. To resolve it faster, the agent calls the customer directly from the chat. The outbound call is tied to the originating chat — both are active simultaneously.',
    steps: [
      {
        id: 'chat-active',
        label: 'Chat mid-conversation',
        hint: "Sofia Reyes is in an active chat about a delivery dispute. Agent has offered to call her directly to resolve it faster.",
        threads: [chat],
        initialSelectedId: CHAT_ID,
        initialView: 'detail',
      },
      {
        id: 'call-started-from-chat',
        label: 'Outbound call started from chat',
        hint: 'Agent dialled Sofia from the chat — the call is linked to the originating chat. Both the chat and call are live simultaneously. Agent can switch between them.',
        threads: [outboundCall, chatDuringCall],
        initialSelectedId: 's9-call-1',
        initialView: 'detail',
      },
    ],
  };
}
