import type { QuickResponse } from '../types';

export const mockQuickResponses: QuickResponse[] = [
  // Greetings
  { id: 'qr-1', category: 'Greetings', title: 'Welcome', body: "Thank you for contacting us today! I'm happy to help. Could you please share a few details about your concern so I can assist you as quickly as possible?" },
  { id: 'qr-2', category: 'Greetings', title: 'Returning customer', body: "Welcome back! I can see your account history. How can I assist you today?" },
  { id: 'qr-3', category: 'Greetings', title: 'Transfer greeting', body: "Hi, I'm taking over from my colleague and have reviewed your case. I'm going to do everything I can to get this sorted for you right away." },

  // Orders
  { id: 'qr-4', category: 'Orders', title: 'Checking order status', body: "I'm pulling up your order now — one moment please." },
  { id: 'qr-5', category: 'Orders', title: 'Order delayed', body: "I apologize for the delay with your order. I'm looking into this right now and will have an update for you in just a moment." },
  { id: 'qr-6', category: 'Orders', title: 'Order shipped', body: "Good news — your order has shipped and is on its way. You should receive it within 3–5 business days. I'll send the tracking number to your email." },
  { id: 'qr-7', category: 'Orders', title: 'Order not found', body: "I wasn't able to locate that order number. Could you double-check it and try again? It's usually a 7–9 digit number starting with ORD-." },
  { id: 'qr-8', category: 'Orders', title: 'Order cancelled', body: "Your order has been successfully cancelled. A full refund will be processed within 5–7 business days to your original payment method." },

  // Returns & Refunds
  { id: 'qr-9', category: 'Returns', title: 'Return policy', body: "We offer a 30-day return policy on all items in original condition. I can initiate a prepaid return label for you right now — shall I proceed?" },
  { id: 'qr-10', category: 'Returns', title: 'Refund confirmed', body: "Your refund has been processed and should appear on your original payment method within 5–7 business days. Your bank may take a little longer to reflect the amount." },
  { id: 'qr-11', category: 'Returns', title: 'Exchange offer', body: "I can arrange an exchange for you at no extra cost. Could you confirm the item you received and the size or colour you'd like instead?" },
  { id: 'qr-12', category: 'Returns', title: 'Partial refund', body: "I've applied a partial refund for the affected item. You should see the credit within 5–7 business days. Is there anything else I can help with?" },

  // Account
  { id: 'qr-13', category: 'Account', title: 'Password reset', body: "I'll send a password reset link to the email address on your account now. Please check your inbox — and your spam folder just in case. It should arrive within a few minutes." },
  { id: 'qr-14', category: 'Account', title: 'Account verified', body: "I've verified your account details. Everything looks good on our end. What would you like to do next?" },
  { id: 'qr-15', category: 'Account', title: 'Account locked', body: "Your account was temporarily locked as a security precaution. I've unlocked it now — please try logging in again. If the issue persists, let me know." },
  { id: 'qr-16', category: 'Account', title: 'Update details', body: "I can update your account details for you. For security purposes, could you confirm the email address or phone number currently on your account?" },

  // Empathy
  { id: 'qr-17', category: 'Empathy', title: 'Acknowledge frustration', body: "I completely understand your frustration, and I want you to know that your concern is valid. Let me do everything I can to make this right for you." },
  { id: 'qr-18', category: 'Empathy', title: 'Sincerely apologise', body: "I sincerely apologise for the inconvenience this has caused. This is not the experience we want for our customers, and I'm going to prioritise fixing this for you now." },
  { id: 'qr-19', category: 'Empathy', title: 'Thank for patience', body: "Thank you so much for your patience while I looked into this. I really appreciate it." },

  // Closing
  { id: 'qr-20', category: 'Closing', title: 'Anything else?', body: "I'm glad we could get that sorted! Is there anything else I can help you with today?" },
  { id: 'qr-21', category: 'Closing', title: 'Issue resolved', body: "It looks like we've got that resolved for you. Thank you for getting in touch — don't hesitate to contact us if you need anything in the future." },
  { id: 'qr-22', category: 'Closing', title: 'Follow-up promised', body: "I'll follow up with you within 24 hours once I have more information from our team. Thank you for your patience, and I'll be in touch soon." },
];
