export type { ScenarioFlow, FlowStep } from './types';

import { getDriverNotHomeFlow } from './flows/01-driver-not-home';
import { getRecyclingRequestFlow } from './flows/02-recycling-request';
import { getRetailEscalationFlow } from './flows/03-retail-escalation';

export function getFlows() {
  return [
    getDriverNotHomeFlow(),
    getRecyclingRequestFlow(),
    getRetailEscalationFlow(),
  ];
}

export function getFlow(id: string) {
  return getFlows().find(f => f.id === id) ?? null;
}
