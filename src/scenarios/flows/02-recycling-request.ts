import type { ScenarioFlow } from '../types';

export function getRecyclingRequestFlow(): ScenarioFlow {
  const now = Date.now();

  // ── Messages ──────────────────────────────────────────────────────────────

  const managerMsg1 = {
    id: 's2-m1',
    sender: 'customer' as const,
    senderName: 'Alex',
    text: "Hey, I have a customer here at Store #442 who'd like to recycle an old LG washer. Can the chat team help schedule a pickup?",
    timestamp: '10:14',
  };

  const agentMsg1 = {
    id: 's2-a1',
    sender: 'agent' as const,
    senderName: 'You',
    text: "Absolutely — I'm looking up a recycling vendor in your area now. What's the customer's pickup address?",
    timestamp: '10:15',
  };

  const managerMsg2 = {
    id: 's2-m2',
    sender: 'customer' as const,
    senderName: 'Alex',
    text: "88 Birchwood Ave, Naperville IL 60540. Customer name is David Park.",
    timestamp: '10:15',
  };

  const agentMsg2 = {
    id: 's2-a2',
    sender: 'agent' as const,
    senderName: 'You',
    text: "Got it. I'm calling EcoHaul Recycling now to schedule the pickup — stay with me.",
    timestamp: '10:17',
  };

  const agentMsg3 = {
    id: 's2-a3',
    sender: 'agent' as const,
    senderName: 'You',
    text: "Confirmed with EcoHaul — pickup is scheduled for Thursday, 10am–2pm at 88 Birchwood Ave. Confirmation #RCY-8821. You're all set!",
    timestamp: '10:21',
  };

  // ── Step 1: Internal chat arrives from store manager ──────────────────────

  const step1Chat = {
    id: 's2-chat',
    type: 'internal-chat' as const,
    status: 'active' as const,
    participantName: 'Alex Thompson',
    participantRole: 'Store Manager · Store #442',
    lastMessage: managerMsg1.text,
    timestamp: '10:14',
    unreadCount: 0,
    messages: [managerMsg1],
  };

  // ── Step 2: Agent places outbound call to recycling vendor ────────────────

  const step2Chat = {
    ...step1Chat,
    messages: [managerMsg1, agentMsg1, managerMsg2, agentMsg2],
    lastMessage: agentMsg2.text,
    timestamp: '10:17',
  };

  const step2Call = {
    id: 's2-call',
    type: 'customer-call' as const,
    status: 'active' as const,
    participantName: 'EcoHaul Recycling',
    participantRole: 'Third-party vendor',
    issueTag: 'Recycling Pickup Scheduling',
    callDirection: 'outbound' as const,
    callStartedAt: now - 90_000,
    lastMessage: 'Outbound call',
    timestamp: '10:18',
    unreadCount: 0,
    messages: [],
  };

  // ── Step 3: Agent confirms pickup details via chat while on call ──────────

  const step3Chat = {
    ...step2Chat,
    messages: [managerMsg1, agentMsg1, managerMsg2, agentMsg2, agentMsg3],
    lastMessage: agentMsg3.text,
    timestamp: '10:21',
  };

  const step3Call = {
    ...step2Call,
    callStartedAt: now - 240_000,
  };

  return {
    id: 'recycling-request',
    index: 2,
    title: 'Recycling Request (Internal)',
    subtitle: 'Store manager on chat while agent calls a recycling vendor',
    tags: ['CHAT+CALL', 'OUTBOUND', 'INTERNAL'],
    description: 'Store manager contacts agent via internal chat to schedule a customer recycling pickup. Agent calls a third-party vendor to confirm, then relays details back through the chat.',
    steps: [
      {
        id: 'chat-arrives',
        label: 'Store manager contacts agent',
        hint: 'Alex Thompson at Store #442 has reached out via internal chat — a customer wants to recycle an LG washer and needs a pickup scheduled.',
        threads: [step1Chat],
        initialSelectedId: 's2-chat',
        initialView: 'detail',
      },
      {
        id: 'outbound-call',
        label: 'Agent calls recycling vendor',
        hint: 'Agent has collected the pickup address and placed an outbound call to EcoHaul Recycling to schedule the pickup. The internal chat with Alex remains open simultaneously.',
        threads: [step2Chat, step2Call],
      },
      {
        id: 'confirm-details',
        label: 'Agent confirms pickup via chat',
        hint: 'While still on the call with EcoHaul, the agent switches to the internal chat and sends Alex the confirmed pickup window and confirmation number.',
        threads: [step3Chat, step3Call],
        initialSelectedId: 's2-chat',
        initialView: 'detail',
      },
    ],
  };
}
