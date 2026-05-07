import type { ScenarioFlow } from '../types';

export function getCallOnlyAgentFlow(): ScenarioFlow {
  const now = Date.now();

  // ── Call states ───────────────────────────────────────────────────────────

  const activeCall = {
    id: 's10-call-1',
    type: 'customer-call' as const,
    status: 'active' as const,
    participantName: 'James Okafor',
    participantPhone: '+44 7911 223344',
    issueTag: 'Billing Dispute',
    caseId: 'CS-7712',
    callDirection: 'inbound' as const,
    callStartedAt: now - 3 * 60_000,
    transferSuggestion: 'Billing Support Queue',
    sentiment: 'negative' as const,
    accountTier: 'premium' as const,
    lastMessage: 'Inbound call',
    timestamp: '09:31',
    unreadCount: 0,
    messages: [],
  };

  const callOnHold = {
    ...activeCall,
    status: 'on-hold' as const,
  };

  const callTransferring = {
    ...activeCall,
    status: 'transferring' as const,
    lastMessage: 'Transferring to Billing Support Queue',
  };

  return {
    id: 'call-only-agent',
    index: 10,
    title: 'Call-Only Agent',
    subtitle: 'Agent handles a single inbound call — no chats',
    tags: ['CALL', 'INBOUND'],
    description: 'Call-only agent receives one inbound call at a time. This scenario walks through the full call lifecycle: active call, placing on hold, and warm-transferring to a specialist queue.',
    steps: [
      {
        id: 'call-active',
        label: 'Inbound call — active',
        hint: 'James Okafor has called in about a billing dispute (3 min in). Premium account, negative sentiment. Agent has full call controls: hold, mute, consult, transfer.',
        threads: [activeCall],
        initialSelectedId: 's10-call-1',
        initialView: 'detail',
      },
      {
        id: 'call-on-hold',
        label: 'Customer placed on hold',
        hint: 'Agent placed James on hold to review the account and verify the disputed charge before responding.',
        threads: [callOnHold],
        initialSelectedId: 's10-call-1',
        initialView: 'detail',
      },
      {
        id: 'call-transferring',
        label: 'Transferring to Billing',
        hint: 'Agent has confirmed this needs specialist handling — initiating a warm transfer to the Billing Support Queue.',
        threads: [callTransferring],
        initialSelectedId: 's10-call-1',
        initialView: 'detail',
      },
    ],
  };
}
