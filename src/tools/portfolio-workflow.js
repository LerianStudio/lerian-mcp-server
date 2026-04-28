import { z } from 'zod';
import { WORKFLOW_IDS, listWorkflows, getWorkflow } from '../workflows/index.js';
import { createToolResponse, createErrorResponse, wrapToolHandler, ErrorCodes } from '../util/mcp-helpers.js';
import { registerMcpTool, TOOL_ANNOTATIONS } from '../util/mcp-registration.js';
import { createWorkflowSession, getWorkflowSession, getWorkflowSessionContext, listWorkflowSessions, mergeWorkflowSessionInput, previewWorkflowSessionInput, recordWorkflowStep } from '../workflows/session-store.js';
import { classifyWorkflowExecutionError } from './execution-error.js';

const workflowInputSchema = {
  intent: z.enum(['list-workflows', 'describe-workflow', 'plan', 'create-session', 'get-session', 'list-sessions', 'execute-step', 'execute-next']).describe(
    'List workflows, describe a workflow, generate a readiness plan, create or inspect a workflow session, or execute a specific workflow step.'
  ),
  workflow: z.enum(WORKFLOW_IDS).optional().describe('Cross-product workflow identifier.'),
  sessionId: z.string().optional().describe('Workflow session identifier for stateful planning and execution.'),
  sessionToken: z.string().optional().describe('Opaque session token returned by create-session. Required for get-session, execute-step, and execute-next.'),
  scopeId: z.string().optional().describe('Required owner/client scope for stateful session operations. Use a stable caller, tenant, or operator identifier.'),
  step: z.string().optional().describe('Workflow step to execute when intent="execute-step".'),
  limit: z.number().optional().describe('Maximum session summaries to return for intent="list-sessions".'),
  input: z.record(z.string(), z.any()).optional().describe('Workflow-specific input payload used for planning or execution.')
};

function requireSessionScope(scopeId) {
  if (!scopeId) {
    return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'scopeId is required for workflow session operations');
  }

  return null;
}

function requireSessionTokenInput(sessionToken) {
  if (!sessionToken) {
    return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'sessionToken is required for this workflow session operation');
  }

  return null;
}

function rejectWorkflowMismatch(workflow, session) {
  if (workflow && workflow !== session.workflowId) {
    return createErrorResponse(ErrorCodes.INVALID_PARAMS, `workflow "${workflow}" does not match session workflow "${session.workflowId}"`);
  }

  return null;
}

function validateStep(definition, step) {
  if (!definition.steps?.[step]) {
    const available = Object.keys(definition.steps || {}).join(', ');
    return createErrorResponse(ErrorCodes.INVALID_PARAMS, `Unknown workflow step "${step}". Available steps: ${available}`);
  }

  return null;
}

function workflowErrorResponse(error, context) {
  const classified = classifyWorkflowExecutionError(error, ErrorCodes);
  return createErrorResponse(classified.code, classified.message, {
    ...context,
    ...(classified.data ? { detail: classified.data } : {})
  });
}

async function handleWorkflow(args = {}) {
  args = args || {};
  const { intent, workflow, sessionId, sessionToken, scopeId, step, limit, input = {} } = args;

  switch (intent) {
    case 'list-workflows':
      return createToolResponse({ workflows: listWorkflows() });

    case 'describe-workflow': {
      if (!workflow) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'workflow parameter is required for describe-workflow intent');
      }

      const definition = getWorkflow(workflow);
      if (!definition) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow: ${workflow}`);
      }

      return createToolResponse(definition.describe());
    }

    case 'plan': {
      let workflowId = workflow;
      let mergedInput = input;

      if (sessionId) {
        const scopeError = requireSessionScope(scopeId);
        if (scopeError) {
          return scopeError;
        }

        const tokenError = requireSessionTokenInput(sessionToken);
        if (tokenError) {
          return tokenError;
        }

        const session = getWorkflowSession(sessionId, { scopeId, sessionToken });
        if (!session) {
          return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow session: ${sessionId}`);
        }

        const mismatchError = rejectWorkflowMismatch(workflow, session);
        if (mismatchError) {
          return mismatchError;
        }

        workflowId = session.workflowId;
        try {
          const previewInput = previewWorkflowSessionInput(sessionId, input, { scopeId, sessionToken });
          if (!previewInput) {
            return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow session: ${sessionId}`);
          }
          mergedInput = previewInput;
        } catch (error) {
          return workflowErrorResponse(error, { workflow: workflowId, sessionId, step });
        }
      }

      if (!workflowId) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'workflow parameter is required for plan intent when sessionId is not provided');
      }

      const definition = getWorkflow(workflowId);
      if (!definition) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow: ${workflowId}`);
      }

      return createToolResponse({
        ...(definition.plan(mergedInput)),
        ...(sessionId ? { sessionId } : {})
      });
    }

    case 'create-session': {
      if (!workflow) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'workflow parameter is required for create-session intent');
      }

      const definition = getWorkflow(workflow);
      if (!definition) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow: ${workflow}`);
      }

      const scopeError = requireSessionScope(scopeId);
      if (scopeError) {
        return scopeError;
      }

      const session = createWorkflowSession(workflow, input, { scopeId });
      return createToolResponse({
        session,
        plan: definition.plan(input)
      }, { allowSecretKeys: ['sessionToken'] });
    }

    case 'get-session': {
      if (!sessionId) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'sessionId parameter is required for get-session intent');
      }

      const scopeError = requireSessionScope(scopeId);
      if (scopeError) {
        return scopeError;
      }

      const tokenError = requireSessionTokenInput(sessionToken);
      if (tokenError) {
        return tokenError;
      }

      const session = getWorkflowSession(sessionId, { scopeId, sessionToken });
      if (!session) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow session: ${sessionId}`);
      }

      const definition = getWorkflow(session.workflowId);
      const sessionContext = getWorkflowSessionContext(sessionId, { scopeId, sessionToken }) || {};
      return createToolResponse({
        session,
        ...(definition ? { plan: definition.plan(sessionContext) } : {})
      });
    }

    case 'list-sessions': {
      const scopeError = requireSessionScope(scopeId);
      if (scopeError) {
        return scopeError;
      }

      const tokenError = requireSessionTokenInput(sessionToken);
      if (tokenError) {
        return tokenError;
      }

      return createToolResponse({
        sessions: listWorkflowSessions(workflow || null, { scopeId, sessionToken, limit })
      });
    }

    case 'execute-step': {
      if ((!workflow && !sessionId) || !step) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'step and either workflow or sessionId are required for execute-step intent');
      }

      let workflowId = workflow;
      let mergedInput = input;
      let session = null;

      if (sessionId) {
        const scopeError = requireSessionScope(scopeId);
        if (scopeError) {
          return scopeError;
        }

        const tokenError = requireSessionTokenInput(sessionToken);
        if (tokenError) {
          return tokenError;
        }

        session = getWorkflowSession(sessionId, { scopeId, sessionToken });
        if (!session) {
          return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow session: ${sessionId}`);
        }

        const mismatchError = rejectWorkflowMismatch(workflow, session);
        if (mismatchError) {
          return mismatchError;
        }

        workflowId = session.workflowId;
        try {
          const previewInput = previewWorkflowSessionInput(sessionId, input, { scopeId, sessionToken });
          if (!previewInput) {
            return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow session: ${sessionId}`);
          }
          mergedInput = previewInput;
        } catch (error) {
          return workflowErrorResponse(error, { workflow: workflowId, sessionId, step });
        }
      }

      const definition = getWorkflow(workflowId);
      if (!definition) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow: ${workflowId}`);
      }

      const stepError = validateStep(definition, step);
      if (stepError) {
        return stepError;
      }

      try {
        const result = await definition.executeStep(step, mergedInput);
        const artifacts = definition.captureArtifacts ? definition.captureArtifacts(step, result, mergedInput) : {};

        if (sessionId) {
          const updatedSession = recordWorkflowStep(sessionId, { step, input, result, artifacts }, { scopeId, sessionToken });
          return createToolResponse({ workflow: workflowId, sessionId, step, result, artifacts, session: updatedSession });
        }

        return createToolResponse({ workflow: workflowId, step, result, artifacts });
      } catch (error) {
        return workflowErrorResponse(error, { workflow: workflowId, sessionId, step });
      }
    }

    case 'execute-next': {
      if (!sessionId) {
        return createErrorResponse(ErrorCodes.INVALID_PARAMS, 'sessionId parameter is required for execute-next intent');
      }

      const scopeError = requireSessionScope(scopeId);
      if (scopeError) {
        return scopeError;
      }

      const tokenError = requireSessionTokenInput(sessionToken);
      if (tokenError) {
        return tokenError;
      }

      const session = getWorkflowSession(sessionId, { scopeId, sessionToken });
      if (!session) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow session: ${sessionId}`);
      }

      const definition = getWorkflow(session.workflowId);
      if (!definition) {
        return createErrorResponse(ErrorCodes.RESOURCE_NOT_FOUND, `Unknown workflow: ${session.workflowId}`);
      }

      try {
        mergeWorkflowSessionInput(sessionId, input, { scopeId, sessionToken });
      } catch (error) {
        return workflowErrorResponse(error, { workflow: session.workflowId, sessionId });
      }
      const refreshedSession = getWorkflowSession(sessionId, { scopeId, sessionToken });
      const refreshedContext = getWorkflowSessionContext(sessionId, { scopeId, sessionToken }) || {};
      const planned = definition.plan(refreshedContext);
      const nextStep = planned.steps.find((stepPlan) => !refreshedSession.completedSteps.includes(stepPlan.step));

      if (!nextStep) {
        return createToolResponse({
          sessionId,
          workflow: session.workflowId,
          status: 'completed',
          session: refreshedSession
        });
      }

      if (!nextStep.ready) {
        return createToolResponse({
          sessionId,
          workflow: session.workflowId,
          status: 'blocked',
          nextStep,
          session: refreshedSession
        });
      }

      try {
        const result = await definition.executeStep(nextStep.step, refreshedContext);
        const artifacts = definition.captureArtifacts ? definition.captureArtifacts(nextStep.step, result, refreshedContext) : {};
        const updatedSession = recordWorkflowStep(sessionId, { step: nextStep.step, input, result, artifacts }, { scopeId, sessionToken });

        return createToolResponse({
          sessionId,
          workflow: session.workflowId,
          status: 'executed',
          step: nextStep.step,
          result,
          artifacts,
          session: updatedSession
        });
      } catch (error) {
        return workflowErrorResponse(error, { workflow: session.workflowId, sessionId, step: nextStep.step });
      }
    }

    default:
      return createErrorResponse(ErrorCodes.INVALID_PARAMS, `Unknown intent: ${intent}`);
    }
}

export function registerPortfolioWorkflowTool(server) {
  registerMcpTool(
    server,
    'portfolio-workflow',
    'Cross-product workflow tool for orchestrating guided steps across Lerian products. Supports workflow discovery, readiness planning, stateful workflow sessions, step execution, and execute-next progression. Implemented workflows include fetcher-to-reporter and matcher-to-fetcher-to-midaz.',
    workflowInputSchema,
    wrapToolHandler(handleWorkflow),
    { annotations: TOOL_ANNOTATIONS.LIVE_API }
  );
}
