export type { ScenarioFlow, FlowStep } from './types';

import { getDeliveryIssueCallFlow } from './flows/11-delivery-issue-call';
import { getDeliveryIssueConfirmFlow } from './flows/12-delivery-issue-call-confirm';

export function getFlows() {
  return [
    getDeliveryIssueCallFlow(),
    getDeliveryIssueConfirmFlow(),
  ];
}

export function getFlow(id: string) {
  return getFlows().find(f => f.id === id) ?? null;
}
