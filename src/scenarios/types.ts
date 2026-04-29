import type { Thread } from '../types';

export interface FlowStep {
  id: string;
  label: string;
  hint?: string;
  annotation?: string;           // out-of-band action shown as a callout in the nav panel
  threads: Thread[];
  initialSelectedId?: string;    // pre-select a thread when this step loads
  initialView?: 'list' | 'detail';
  initialWrapUpActive?: boolean; // trigger wrap-up state when this step loads
  initialWrapUpContext?: { participantName?: string; issueTag?: string };
}

export interface ScenarioFlow {
  id: string;          // kebab-case, e.g. 'driver-not-home'
  index: number;       // 1-based display number
  title: string;
  subtitle: string;
  tags: string[];
  description: string;
  steps: FlowStep[];
}
