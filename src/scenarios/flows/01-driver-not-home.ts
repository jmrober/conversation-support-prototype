import type { ScenarioFlow } from '../types';

export function getDriverNotHomeFlow(): ScenarioFlow {
  const now = Date.now();

  // ── Shared message sets ───────────────────────────────────────────────────

  const driverMsg1 = {
    id: 's1-d1',
    sender: 'customer' as const,
    senderName: 'Marcus',
    text: "Hi, I'm the delivery driver for order ORD-44821. I'm at 12 Maple Street — customer isn't home. Delivery window was 10am–2pm.",
    timestamp: '9:41',
  };

  const agentMsg1 = {
    id: 's1-a1',
    sender: 'agent' as const,
    senderName: 'You',
    text: "Thanks Marcus, I'm looking up the order now. Give me just a moment.",
    timestamp: '9:42',
  };

  const driverMsg2 = {
    id: 's1-d2',
    sender: 'customer' as const,
    senderName: 'Marcus',
    text: "No problem. I can wait about 20 minutes before I have to move on. Should I attempt redelivery tomorrow if we can't reach them?",
    timestamp: '9:43',
  };

  const agentMsg2 = {
    id: 's1-a2',
    sender: 'agent' as const,
    senderName: 'You',
    text: "Got it. I've opened case CS-5102 for the missed delivery and I'm calling the customer now to verify. Stay on standby.",
    timestamp: '9:46',
  };

  const agentMsg3 = {
    id: 's1-a3',
    sender: 'agent' as const,
    senderName: 'You',
    text: "Update: spoke with Sarah — she's about 15 minutes away. She asked if you can wait. Does that work on your end?",
    timestamp: '9:49',
  };

  // ── Step 1: Driver chat arrives ───────────────────────────────────────────

  const step1Chat = {
    id: 's1-chat',
    type: 'customer-chat' as const,
    status: 'active' as const,
    participantName: 'Marcus Rivera',
    issueTag: 'LPFR – Not Home',
    lastMessage: driverMsg1.text,
    timestamp: '9:41',
    unreadCount: 0,
    messages: [driverMsg1],
  };

  // ── Step 2: Agent looks up customer + creates case ────────────────────────

  const step2Chat = {
    ...step1Chat,
    messages: [driverMsg1, agentMsg1, driverMsg2],
    lastMessage: driverMsg2.text,
    timestamp: '9:43',
  };

  // ── Step 3: Agent has placed outbound call to customer ────────────────────

  const step3Chat = {
    ...step2Chat,
    messages: [driverMsg1, agentMsg1, driverMsg2, agentMsg2],
    lastMessage: agentMsg2.text,
    timestamp: '9:46',
  };

  const step3Call = {
    id: 's1-call',
    type: 'customer-call' as const,
    status: 'active' as const,
    participantName: 'Sarah Chen',
    issueTag: 'Delivery – Not Home',
    caseId: 'CS-5102',
    callDirection: 'outbound' as const,
    callStartedAt: now - 120_000,
    relatedChatId: 's1-chat',
    lastMessage: 'Outbound call',
    timestamp: '9:47',
    unreadCount: 0,
    messages: [],
  };

  // ── Step 4: Agent messages driver while still on call ────────────────────

  const step4Chat = {
    ...step3Chat,
    messages: [driverMsg1, agentMsg1, driverMsg2, agentMsg2, agentMsg3],
    lastMessage: agentMsg3.text,
    timestamp: '9:49',
  };

  const step4Call = {
    ...step3Call,
    callStartedAt: now - 180_000,
  };

  return {
    id: 'driver-not-home',
    index: 1,
    title: 'Driver Not Home (LPFR)',
    subtitle: 'Coordinating a missed delivery between driver and customer',
    tags: ['CHAT+CALL', 'OUTBOUND', 'DELIVERY'],
    description: 'Driver contacts agent via LPFR queue — agent creates a case, calls the customer, then relays details back to the driver while still on the call.',
    steps: [
      {
        id: 'chat-arrives',
        label: 'Driver chat arrives',
        hint: 'Marcus Rivera has contacted the agent via the LPFR queue to report the customer is not home at the delivery address.',
        threads: [step1Chat],
        initialSelectedId: 's1-chat',
        initialView: 'detail',
      },
      {
        id: 'case-created',
        label: 'Agent looks up customer',
        hint: 'Agent has acknowledged Marcus and switched to an external CRM to look up the order and customer contact details.',
        annotation: 'Agent opens CRM in a separate tab → searches order ORD-44821 → creates case CS-5102 for the missed delivery. This happens outside the call & chat component.',
        threads: [step2Chat],
        initialSelectedId: 's1-chat',
        initialView: 'detail',
      },
      {
        id: 'outbound-call',
        label: 'Agent calls customer',
        hint: 'Agent has placed an outbound call to Sarah Chen (customer) using CS-5102 as the case reference. Marcus is still on chat — both contacts active simultaneously.',
        threads: [step3Chat, step3Call],
      },
      {
        id: 'driver-update',
        label: 'Agent updates the driver',
        hint: 'Agent switches back to the Marcus chat to relay what Sarah confirmed, while keeping the customer call live.',
        threads: [step4Chat, step4Call],
        initialSelectedId: 's1-chat',
        initialView: 'detail',
      },
    ],
  };
}
