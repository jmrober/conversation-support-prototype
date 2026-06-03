import type { ScenarioFlow } from '../types';

export function getDeliveryIssueConfirmFlow(): ScenarioFlow {
  const now = Date.now();

  const ivrData = {
    chatbotSummary: {
      botName: 'IVR',
      handoffReason: 'Delivery Issue',
      summary:
        'A client is reaching out for assistance regarding their Deluxe Gaming Chair. They opted for express shipping, but the order status has shown "Out for Delivery" for more than a day. The client requires the chair urgently for a crucial gaming tournament happening tomorrow. They have double-checked their shipping details and confirmed that no delivery attempts have been made.',
      dataPoints: [
        { label: 'Intent', value: 'Delivery Issue' },
        { label: 'Reason', value: 'Package delayed' },
        { label: 'Order number', value: '#ORD-23405' },
        { label: 'Task ID', value: 'W18487D-28c23948575657' },
        { label: 'Category', value: 'Delivery Issue' },
        { label: 'Manufacturer Warranty', value: 'Yes - 1 Year' },
        { label: 'Serial number', value: 'SN-GC-2024-88421' },
      ],
    },
  };

  const ringingCall = {
    id: 's12-call-1',
    type: 'customer-call' as const,
    status: 'ringing' as const,
    participantName: 'Liam Hawthorne',
    participantPhone: '+1 (555) 346-5780',
    issueTag: 'Delivery Issue',
    caseId: '#ORD-23405',
    taskId: 'W18487D-28c23948575657',
    callDirection: 'inbound' as const,
    queue: 'Services - Appliances',
    sentiment: 'negative' as const,
    accountTier: 'standard' as const,
    lastMessage: 'Inbound call',
    timestamp: '10:25',
    unreadCount: 0,
    messages: [],
    ...ivrData,
  };

  const activeCall = {
    ...ringingCall,
    status: 'active' as const,
    callStartedAt: now - 41_000,
  };

  const liamOnHold = {
    ...activeCall,
    status: 'on-hold' as const,
  };

  const carrierCall = {
    id: 's12-call-2',
    type: 'customer-call' as const,
    status: 'active' as const,
    participantName: 'Services - Appliances',
    participantPhone: '+1 (555) 346-5780',
    issueTag: 'Carrier Check',
    callDirection: 'outbound' as const,
    callStartedAt: now - 3_000,
    queue: 'Services - Appliances',
    sentiment: 'neutral' as const,
    accountTier: 'standard' as const,
    lastMessage: 'Outbound call to carrier',
    timestamp: '10:28',
    unreadCount: 0,
    messages: [],
  };

  const resumedCall = {
    ...liamOnHold,
    status: 'active' as const,
    callStartedAt: now - 90_000,
  };

  return {
    id: 'delivery-issue-call-confirm',
    index: 12,
    title: 'Delivery Issue — Click to Confirm End',
    subtitle: 'Same scenario, click-to-confirm end call pattern',
    tags: ['CALL', 'INBOUND', 'IVR'],
    description:
      'Same delivery issue call flow as scenario 11, but the End button uses a click-to-confirm pattern instead of hold-to-confirm.',
    steps: [
      {
        id: 'inbound-ringing',
        label: 'Inbound call ringing',
        hint: 'Liam Hawthorne is calling in from the Services – Appliances queue about a delayed delivery. IVR has pre-populated the issue context. Agent must accept or reject within 30 seconds.',
        threads: [ringingCall],
      },
      {
        id: 'call-active',
        label: 'Call accepted — IVR context visible',
        hint: 'Agent accepted the call. Liam Hawthorne is live — 41 seconds in. The IVR summary and metadata are visible in the context panel.',
        threads: [activeCall],
        initialSelectedId: 's12-call-1',
        initialView: 'detail',
      },
      {
        id: 'customer-on-hold',
        label: 'Customer placed on hold — click End to confirm',
        hint: 'Agent placed Liam on hold. Click End once — the button changes to "Confirm end". Click again to complete. This is the click-to-confirm pattern.',
        threads: [liamOnHold],
        initialSelectedId: 's12-call-1',
        initialView: 'detail',
      },
      {
        id: 'two-calls',
        label: 'Second call — contacting carrier',
        hint: 'Agent has dialled the carrier while Liam waits on hold. Two call cards are now visible.',
        threads: [liamOnHold, carrierCall],
        initialSelectedId: 's12-call-2',
        initialView: 'detail',
      },
      {
        id: 'call-resumed',
        label: 'Customer resumed — resolving issue',
        hint: 'Agent confirmed delivery details with the carrier and resumed Liam\'s call.',
        threads: [resumedCall],
        initialSelectedId: 's12-call-1',
        initialView: 'detail',
      },
    ],
  };
}
