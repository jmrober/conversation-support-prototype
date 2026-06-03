import type { ScenarioFlow } from '../types';

export function getDeliveryIssueCallFlow(): ScenarioFlow {
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
    id: 's11-call-1',
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

  // Step 3: agent places Liam on hold to call carrier
  const liamOnHold = {
    ...activeCall,
    status: 'on-hold' as const,
  };

  // Step 4: agent has a second call to the carrier open while Liam waits
  const carrierCall = {
    id: 's11-call-2',
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

  // Step 5: agent resumes Liam and ends carrier call
  const resumedCall = {
    ...liamOnHold,
    status: 'active' as const,
    callStartedAt: now - 90_000,
  };

  return {
    id: 'delivery-issue-call',
    index: 11,
    title: 'Delivery Issue — Inbound Call',
    subtitle: 'Customer calls about a delayed express delivery',
    tags: ['CALL', 'INBOUND', 'IVR'],
    description:
      'A customer calls in about a Deluxe Gaming Chair showing "Out for Delivery" for over a day. The agent reviews IVR context, places the customer on hold to contact the carrier, then resumes to resolve.',
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
        hint: 'Agent accepted the call. Liam Hawthorne is live — 41 seconds in. The IVR summary and metadata (order number, task ID, warranty) are visible in the context panel on the right.',
        threads: [activeCall],
        initialSelectedId: 's11-call-1',
        initialView: 'detail',
      },
      {
        id: 'customer-on-hold',
        label: 'Customer placed on hold',
        hint: 'Agent placed Liam on hold to contact the carrier and check the delivery status. The hold timer is running and "Transcription in progress" is shown.',
        threads: [liamOnHold],
        initialSelectedId: 's11-call-1',
        initialView: 'detail',
      },
      {
        id: 'two-calls',
        label: 'Second call — contacting carrier',
        hint: 'Agent has dialled the carrier while Liam waits on hold. Two call cards are now visible: Liam on hold (Resume / Merge / End) and the carrier call active with Mute / Hold controls.',
        threads: [liamOnHold, carrierCall],
        initialSelectedId: 's11-call-2',
        initialView: 'detail',
      },
      {
        id: 'call-resumed',
        label: 'Customer resumed — resolving issue',
        hint: 'Agent confirmed delivery details with the carrier and resumed Liam\'s call. Agent provides an update and arranges re-delivery for the next morning.',
        threads: [resumedCall],
        initialSelectedId: 's11-call-1',
        initialView: 'detail',
      },
    ],
  };
}
