import { fetcherReporterWorkflow, describeFetcherReporterWorkflow, planFetcherReporterWorkflow, executeFetcherReporterStep, captureFetcherReporterArtifacts } from './fetcher-reporter.js';
import { matcherFetcherMidazWorkflow, describeMatcherFetcherMidazWorkflow, planMatcherFetcherMidazWorkflow, executeMatcherFetcherMidazStep, captureMatcherFetcherMidazArtifacts } from './matcher-fetcher-midaz.js';

const workflows = {
  [fetcherReporterWorkflow.id]: {
    definition: fetcherReporterWorkflow,
    describe: describeFetcherReporterWorkflow,
    plan: planFetcherReporterWorkflow,
    executeStep: executeFetcherReporterStep,
    captureArtifacts: captureFetcherReporterArtifacts
  },
  [matcherFetcherMidazWorkflow.id]: {
    definition: matcherFetcherMidazWorkflow,
    describe: describeMatcherFetcherMidazWorkflow,
    plan: planMatcherFetcherMidazWorkflow,
    executeStep: executeMatcherFetcherMidazStep,
    captureArtifacts: captureMatcherFetcherMidazArtifacts
  }
};

export const WORKFLOW_IDS = Object.keys(workflows);

export function listWorkflows() {
  return Object.values(workflows).map((workflow) => ({
    id: workflow.definition.id,
    name: workflow.definition.name,
    description: workflow.definition.description,
    stepCount: workflow.definition.stepOrder.length
  }));
}

export function getWorkflow(workflowId) {
  return workflows[workflowId] || null;
}
