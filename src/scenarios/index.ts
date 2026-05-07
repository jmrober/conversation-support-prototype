export type { ScenarioFlow, FlowStep } from './types';

import { getDriverNotHomeFlow } from './flows/01-driver-not-home';
import { getRecyclingRequestFlow } from './flows/02-recycling-request';
import { getRetailEscalationFlow } from './flows/03-retail-escalation';
import { getBlendedAgentFlow } from './flows/07-blended-agent';
import { getChatOnlyAgentFlow } from './flows/08-chat-only-agent';
import { getChatAndCallAgentFlow } from './flows/09-chat-and-call-agent';
import { getCallOnlyAgentFlow } from './flows/10-call-only-agent';

export function getFlows() {
  return [
    getChatOnlyAgentFlow(),
    getChatAndCallAgentFlow(),
    getCallOnlyAgentFlow(),
    getDriverNotHomeFlow(),
    getRecyclingRequestFlow(),
    getRetailEscalationFlow(),
    getBlendedAgentFlow(),
  ];
}

export function getFlow(id: string) {
  return getFlows().find(f => f.id === id) ?? null;
}
