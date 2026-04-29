import type { ScenarioFlow } from '../types';

export function getInboundCallAgentFlow(): ScenarioFlow {
  const now = Date.now();

  const activeCall = {
    id: 's5-call',
    type: 'customer-call' as const,
    status: 'active' as const,
    participantName: 'Michael Torres',
    caseId: 'CS-5302',
    issueTag: 'Technical Support',
    callDirection: 'inbound' as const,
    callStartedAt: now - 210000,
    transferSuggestion: 'Technical Support Queue',
    sentiment: 'neutral' as const,
    accountTier: 'standard' as const,
    lastMessage: 'Inbound call',
    timestamp: '14:12',
    unreadCount: 0,
    messages: [],
  };

  const onHoldCall = {
    ...activeCall,
    status: 'on-hold' as const,
  };

  return {
    id: 'inbound-call-agent',
    index: 6,
    title: 'Inbound Call Agent',
    subtitle: 'Call agent handling an inbound call — transfer and wrap-up flow',
    tags: ['CALL ONLY', 'INBOUND', 'WRAP-UP'],
    description: 'Call-only agent receives an inbound call, handles transfer options, then enters post-call wrap-up.',
    steps: [
      {
        id: 'call-active',
        label: 'Inbound call active',
        hint: 'Michael Torres called in for technical support — 3:30 into the call. Agent can transfer, consult, mute, or hold.',
        threads: [activeCall],
      },
      {
        id: 'call-on-hold',
        label: 'Customer placed on hold',
        hint: 'Agent has placed Michael on hold to consult the knowledge base or warm transfer to Technical Support Queue.',
        threads: [onHoldCall],
      },
    ],
  };
}
