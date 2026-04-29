import type { ScenarioFlow } from '../types';

export function getEscalateToCallFlow(): ScenarioFlow {
  const now = Date.now();

  const chatThread = {
    id: 's4-chat',
    type: 'customer-chat' as const,
    status: 'active' as const,
    participantName: 'Sophie Martin',
    issueTag: 'Complex Billing Dispute',
    hasProfile: true,
    accountTier: 'gold' as const,
    sentiment: 'negative' as const,
    chatMode: 'live' as const,
    caseId: 'CS-5301',
    slaDeadlineAt: now + 8 * 60_000,
    lastMessage: "This is the third time I've been charged incorrectly — I need this resolved today.",
    timestamp: '11:33',
    unreadCount: 2,
    messages: [
      { id: 's4-m1', sender: 'customer' as const, senderName: 'Sophie', text: "Hi, I've noticed a double charge on my account again this month — $149 taken twice on the 14th.", timestamp: '11:28' },
      { id: 's4-m2', sender: 'agent' as const, senderName: 'You', text: "I'm sorry to hear that, Sophie. Let me pull up your account right now.", timestamp: '11:29' },
      { id: 's4-m3', sender: 'customer' as const, senderName: 'Sophie', text: "This happened last month too and the refund took 3 weeks. I'm a Gold member — I shouldn't be dealing with this.", timestamp: '11:30' },
      { id: 's4-m4', sender: 'agent' as const, senderName: 'You', text: "You're absolutely right, and I sincerely apologize. I can see the duplicate charge. I'm processing a refund now.", timestamp: '11:32' },
      { id: 's4-m5', sender: 'customer' as const, senderName: 'Sophie', text: "This is the third time I've been charged incorrectly — I need this resolved today.", timestamp: '11:33' },
    ],
  };

  const outboundCallThread = {
    id: 's4-call',
    type: 'customer-call' as const,
    status: 'active' as const,
    participantName: 'Sophie Martin',
    issueTag: 'Complex Billing Dispute',
    accountTier: 'gold' as const,
    caseId: 'CS-5301',
    callDirection: 'outbound' as const,
    callStartedAt: now - 45000,
    relatedChatId: 's4-chat',
    transferSuggestion: 'Billing & Payments Queue',
    lastMessage: 'Outbound call',
    timestamp: '11:35',
    unreadCount: 0,
    messages: [],
  };

  return {
    id: 'escalate-to-call',
    index: 5,
    title: 'Escalate Chat to Call',
    subtitle: 'Live chat with a Gold customer that warrants an outbound call',
    tags: ['CHAT', 'GOLD TIER', 'BILLING'],
    description: 'Gold-tier customer with a recurring billing dispute. Agent evaluates whether to escalate to a call — then does.',
    steps: [
      {
        id: 'chat-dispute',
        label: 'Billing dispute in chat',
        hint: 'Sophie Martin (Gold) has 2 unread messages and a recurring billing issue — the SLA is ticking. Consider escalating to a call.',
        threads: [chatThread],
      },
      {
        id: 'call-placed',
        label: 'Agent escalates to call',
        hint: 'Agent calls Sophie directly — chat stays open. The phone call allows for faster resolution and a more personal touch for Gold tier.',
        threads: [chatThread, outboundCallThread],
      },
    ],
  };
}
