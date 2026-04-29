import type { ScenarioFlow } from '../types';

export function getRetailEscalationFlow(): ScenarioFlow {
  const now = Date.now();

  // ── Messages ──────────────────────────────────────────────────────────────

  const associateMsg1 = {
    id: 's3-m1',
    sender: 'customer' as const,
    senderName: 'Jamie',
    text: "Hey, I have a customer here who bought a 65\" Samsung QLED last week. It's showing a setup error — code E302. They're asking for a replacement or Geek Squad service. How should I handle this?",
    timestamp: '2:08',
  };

  const agentMsg1 = {
    id: 's3-a1',
    sender: 'agent' as const,
    senderName: 'You',
    text: "Got it. I'm pulling up the order now — can you grab the order number from the customer?",
    timestamp: '2:09',
  };

  const associateMsg2 = {
    id: 's3-m2',
    sender: 'customer' as const,
    senderName: 'Jamie',
    text: "Sure — it's ORD-51294.",
    timestamp: '2:09',
  };

  const agentMsg2 = {
    id: 's3-a2',
    sender: 'agent' as const,
    senderName: 'You',
    text: "Thanks. I've opened case CS-6774 for the E302 setup error. I need to call you to go over the device details — is now a good time?",
    timestamp: '2:11',
  };

  const associateMsg3 = {
    id: 's3-m3',
    sender: 'customer' as const,
    senderName: 'Jamie',
    text: "Yes, go ahead.",
    timestamp: '2:11',
  };

  // ── Step 1: Floor associate contacts agent via internal chat ──────────────

  const step1Chat = {
    id: 's3-chat',
    type: 'internal-chat' as const,
    status: 'active' as const,
    participantName: 'Jamie Ruiz',
    participantRole: 'Floor Associate · Store #118',
    lastMessage: associateMsg1.text,
    timestamp: '2:08',
    unreadCount: 0,
    messages: [associateMsg1],
  };

  // ── Step 2: Agent creates case (annotation), chat exchange continues ──────

  const step2Chat = {
    ...step1Chat,
    messages: [associateMsg1, agentMsg1, associateMsg2, agentMsg2, associateMsg3],
    lastMessage: associateMsg3.text,
    timestamp: '2:11',
  };

  // ── Step 3: Agent calls the retail associate directly ─────────────────────

  const step3Chat = { ...step2Chat };

  const step3Call = {
    id: 's3-call',
    type: 'customer-call' as const,
    status: 'active' as const,
    participantName: 'Jamie Ruiz',
    participantRole: 'Floor Associate · Store #118',
    issueTag: 'Device Setup Error · CS-6774',
    caseId: 'CS-6774',
    callDirection: 'outbound' as const,
    callStartedAt: now - 60_000,
    relatedChatId: 's3-chat',
    lastMessage: 'Outbound call',
    timestamp: '2:12',
    unreadCount: 0,
    messages: [],
  };

  // ── Step 4: Call ends — wrap-up triggered ─────────────────────────────────

  const step4Chat = { ...step3Chat };

  return {
    id: 'retail-escalation',
    index: 3,
    title: 'Device Setup Error (Retail)',
    subtitle: 'Chat escalates to a direct call with the floor associate',
    tags: ['CHAT+CALL', 'OUTBOUND', 'INTERNAL'],
    description: 'Floor associate reports a customer device setup error via internal chat. Agent creates a case, then calls the associate directly to gather details — call ends and triggers wrap-up.',
    steps: [
      {
        id: 'chat-arrives',
        label: 'Associate contacts agent',
        hint: 'Jamie Ruiz at Store #118 has opened an internal chat — a customer is in-store with a Samsung QLED showing setup error E302 and wants a replacement or service.',
        threads: [step1Chat],
        initialSelectedId: 's3-chat',
        initialView: 'detail',
      },
      {
        id: 'case-created',
        label: 'Agent creates a case',
        hint: 'Agent has gathered the order number and opened case CS-6774 for the E302 error. Agent lets Jamie know they\'ll call to go over the device details.',
        annotation: 'Agent opens CRM → looks up order ORD-51294 → creates case CS-6774 for the Samsung QLED setup error E302. This happens outside the call & chat component.',
        threads: [step2Chat],
        initialSelectedId: 's3-chat',
        initialView: 'detail',
      },
      {
        id: 'outbound-call',
        label: 'Agent calls the associate',
        hint: 'Agent has placed an outbound call to Jamie\'s store line. The internal chat remains accessible but the call is primary — Jamie can\'t type and talk at the same time.',
        threads: [step3Chat, step3Call],
      },
      {
        id: 'wrap-up',
        label: 'Call ends — wrap-up',
        hint: 'Jamie has ended the call. The agent enters wrap-up to complete post-call notes on case CS-6774 before returning to available status.',
        threads: [step4Chat],
        initialWrapUpActive: true,
        initialWrapUpContext: { participantName: 'Jamie Ruiz', issueTag: 'Device Setup Error · CS-6774' },
      },
    ],
  };
}
