import type { DirectoryEntry, QueueEntry } from '../types';

export const mockQueues: QueueEntry[] = [
  {
    id: 'q-billing',
    name: 'Billing Support',
    short: 'Billing',
    icon: '💳',
    available: true,
    workingHours: 'Mon – Fri  8:00 am – 8:00 pm',
    handles: [
      'Invoice queries',
      'Payment failures',
      'Refund disputes',
      'Account billing changes',
      'Subscription management',
    ],
    doesNotHandle: [
      'Technical support',
      'Delivery enquiries',
      'Returns & exchanges',
    ],
  },
  {
    id: 'q-tech',
    name: 'Technical Support',
    short: 'Technical',
    icon: '🔧',
    available: true,
    workingHours: 'Mon – Sun  7:00 am – 11:00 pm',
    handles: [
      'Software issues & troubleshooting',
      'Device setup & configuration',
      'App & firmware problems',
      'Warranty claims',
    ],
    doesNotHandle: [
      'Billing disputes',
      'Returns & exchanges',
      'General order enquiries',
    ],
  },
  {
    id: 'q-returns',
    name: 'Returns & Refunds',
    short: 'Returns',
    icon: '↩️',
    available: false,
    workingHours: 'Mon – Fri  9:00 am – 5:30 pm',
    handles: [
      'Return requests',
      'Exchange processing',
      'Refund status updates',
      'Damaged or incorrect goods',
    ],
    doesNotHandle: [
      'Billing queries',
      'Technical support',
      'Delivery tracking',
    ],
  },
  {
    id: 'q-general',
    name: 'General Enquiries',
    short: 'General',
    icon: '💬',
    available: true,
    workingHours: 'Mon – Sun  8:00 am – 9:00 pm',
    handles: [
      'Product information',
      'Order status',
      'Store locations',
      'Promotions & offers',
    ],
    doesNotHandle: [
      'Billing disputes',
      'Technical faults',
      'Returns & exchanges',
    ],
  },
];

export const mockDirectory: DirectoryEntry[] = [
  { id: 'd1', name: 'Sam Okafor', role: 'Delivery Agent', department: 'Logistics', extension: '2341', available: true, initials: 'SO' },
  { id: 'd2', name: 'Lisa Chen', role: 'Team Manager', department: 'Support', extension: '2100', available: true, initials: 'LC' },
  { id: 'd3', name: 'Marcus Webb', role: 'Senior Agent', department: 'Support', extension: '2215', available: false, initials: 'MW' },
  { id: 'd4', name: 'Priya Nair', role: 'Billing Specialist', department: 'Finance', extension: '2340', available: true, initials: 'PN' },
  { id: 'd5', name: 'Tom Gallagher', role: 'Delivery Supervisor', department: 'Logistics', extension: '2355', available: true, initials: 'TG' },
  { id: 'd6', name: 'Rachel Moss', role: 'Returns Specialist', department: 'Operations', extension: '2280', available: false, initials: 'RM' },
  { id: 'd7', name: 'Dan Yusuf', role: 'Tech Support', department: 'IT', extension: '2400', available: true, initials: 'DY' },
  { id: 'd8', name: 'Ana Reyes', role: 'Senior Agent', department: 'Support', extension: '2220', available: true, initials: 'AR' },
  { id: 'd9', name: 'James Park', role: 'Escalations Lead', department: 'Support', extension: '2190', available: true, initials: 'JP' },
  { id: 'd10', name: 'Nina Osei', role: 'Quality Analyst', department: 'QA', extension: '2450', available: false, initials: 'NO' },
];
