import { routeAndExecute as executeMatcherAction } from '../products/matcher/router.js';
import { routeAndExecute as executeFetcherAction } from '../products/fetcher/router.js';
import { routeAndExecute as executeMidazAction } from '../api/router.js';

export const matcherFetcherMidazWorkflow = {
  id: 'matcher-to-fetcher-to-midaz',
  name: 'Matcher -> Fetcher -> Midaz',
  description: 'Cross-product workflow for configuring reconciliation contexts in Matcher, using Matcher discovery over Fetcher connections/extractions, and inspecting Midaz ledger-side data for the matching side.',
  overview: [
    'Matcher already fronts Fetcher through its discovery endpoints, so you can manage the Fetcher bridge from Matcher instead of stitching the services manually.',
    'This workflow is useful when you want to reconcile an external datasource against Midaz ledger data and need a guided setup path.',
    'The live slice covers configuration and bridge readiness, not the full matching/exception lifecycle yet.'
  ],
  prerequisites: [
    'Matcher, Fetcher, and Midaz endpoints must all be reachable from this MCP runtime.',
    'MATCHER_AUTH_TOKEN should be configured for Matcher protected endpoints.',
    'If you want to inspect a Fetcher job directly, FETCHER auth/context must also be configured or supplied in step input.',
    'Midaz steps assume you know or can discover the target organizationId and ledgerId.'
  ],
  stepOrder: [
    'create-matcher-context',
    'refresh-matcher-discovery',
    'get-matcher-discovery-status',
    'list-matcher-discovery-connections',
    'get-matcher-discovery-connection',
    'get-matcher-discovery-schema',
    'start-matcher-discovery-extraction',
    'poll-matcher-discovery-extraction',
    'get-fetcher-job',
    'list-midaz-organizations',
    'list-midaz-ledgers',
    'list-midaz-transactions',
    'create-matcher-fetcher-source',
    'create-matcher-ledger-source',
    'create-matcher-field-map'
  ],
  steps: {
    'create-matcher-context': {
      description: 'Create the reconciliation context that will own both the Fetcher-backed source and the Midaz ledger-side source.',
      requiredInput: ['context']
    },
    'refresh-matcher-discovery': {
      description: 'Force Matcher to sync its discovery view from Fetcher before selecting a connection.',
      requiredInput: []
    },
    'get-matcher-discovery-status': {
      description: 'Check whether Matcher currently sees Fetcher as healthy and how many connections are available.',
      requiredInput: []
    },
    'list-matcher-discovery-connections': {
      description: 'List Fetcher-backed connections visible to Matcher discovery.',
      requiredInput: []
    },
    'get-matcher-discovery-connection': {
      description: 'Inspect one discovered connection by ID.',
      requiredInput: ['connectionId']
    },
    'get-matcher-discovery-schema': {
      description: 'Inspect the schema Matcher sees for a discovered Fetcher connection.',
      requiredInput: ['connectionId']
    },
    'start-matcher-discovery-extraction': {
      description: 'Start a discovery extraction through Matcher, which submits the request to Fetcher.',
      requiredInput: ['connectionId', 'extractionRequest']
    },
    'poll-matcher-discovery-extraction': {
      description: 'Poll the bridge extraction until it advances state.',
      requiredInput: ['extractionId']
    },
    'get-fetcher-job': {
      description: 'Fetch the underlying Fetcher job directly once you know the Fetcher job ID from Matcher discovery.',
      requiredInput: ['organizationId', 'fetcherJobId']
    },
    'list-midaz-organizations': {
      description: 'List Midaz organizations to identify the ledger domain you want Matcher to reconcile against.',
      requiredInput: []
    },
    'list-midaz-ledgers': {
      description: 'List ledgers for a specific Midaz organization.',
      requiredInput: ['organizationId']
    },
    'list-midaz-transactions': {
      description: 'Inspect ledger-side Midaz transactions for the target organization and ledger.',
      requiredInput: ['organizationId', 'ledgerId']
    },
    'create-matcher-fetcher-source': {
      description: 'Create a Matcher source of type FETCHER inside the reconciliation context.',
      requiredInput: ['contextId', 'source']
    },
    'create-matcher-ledger-source': {
      description: 'Create a Matcher source of type LEDGER inside the reconciliation context.',
      requiredInput: ['contextId', 'source']
    },
    'create-matcher-field-map': {
      description: 'Create the field map for a Matcher source so extracted data can be normalized into the reconciliation model.',
      requiredInput: ['contextId', 'mapping']
    }
  }
};

function firstDefined(result, keys, state = { depth: 0, nodes: 0 }) {
  state.nodes += 1;
  if (state.depth > 5 || state.nodes > 200) {
    return undefined;
  }

  if (!result || typeof result !== 'object') {
    return undefined;
  }

  for (const key of keys) {
    if (result[key] !== undefined && result[key] !== null && result[key] !== '') {
      return result[key];
    }
  }

  for (const value of Object.values(result).slice(0, 50)) {
    if (Array.isArray(value) || (typeof value === 'string' && value.length > 2000)) {
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const nested = firstDefined(value, keys, { depth: state.depth + 1, nodes: state.nodes });
      if (nested !== undefined) {
        return nested;
      }
    }
  }

  return undefined;
}

export function captureMatcherFetcherMidazArtifacts(step, result, input = {}) {
  switch (step) {
    case 'create-matcher-context': {
      const contextId = firstDefined(result, ['contextId', 'id']);
      return contextId ? { contextId } : {};
    }
    case 'get-matcher-discovery-connection':
    case 'get-matcher-discovery-schema': {
      const connectionId = firstDefined(result, ['connectionId', 'id']) || input.connectionId;
      return connectionId ? { connectionId } : {};
    }
    case 'start-matcher-discovery-extraction': {
      const extractionId = firstDefined(result, ['extractionId', 'id']);
      const fetcherJobId = firstDefined(result, ['fetcherJobId', 'jobId', 'jobID']);
      return {
        ...(extractionId ? { extractionId } : {}),
        ...(fetcherJobId ? { fetcherJobId } : {})
      };
    }
    case 'create-matcher-fetcher-source':
    case 'create-matcher-ledger-source': {
      const sourceId = firstDefined(result, ['sourceId', 'id']);
      if (!sourceId) {
        return {};
      }

      return step === 'create-matcher-fetcher-source'
        ? { matcherFetcherSourceId: sourceId }
        : { matcherLedgerSourceId: sourceId };
    }
    default:
      return {};
  }
}

function getStepDefinition(step) {
  return matcherFetcherMidazWorkflow.steps[step] || null;
}

function getValue(input, key) {
  return input && Object.prototype.hasOwnProperty.call(input, key) ? input[key] : undefined;
}

function getMissingRequiredInput(step, input = {}) {
  const stepDef = getStepDefinition(step);
  if (!stepDef) {
    return [];
  }

  const missing = stepDef.requiredInput.filter((field) => {
    const value = getValue(input, field);
    return value === undefined || value === null || value === '';
  });

  if (step === 'create-matcher-field-map' && !getValue(input, 'sourceId') && !getValue(input, 'matcherFetcherSourceId')) {
    missing.push('sourceId or matcherFetcherSourceId');
  }

  return missing;
}

export function describeMatcherFetcherMidazWorkflow() {
  return {
    workflow: matcherFetcherMidazWorkflow.id,
    name: matcherFetcherMidazWorkflow.name,
    description: matcherFetcherMidazWorkflow.description,
    overview: [...matcherFetcherMidazWorkflow.overview],
    prerequisites: [...matcherFetcherMidazWorkflow.prerequisites],
    recommendedPaths: {
      discoveryBridgeSetup: [
        'refresh-matcher-discovery',
        'get-matcher-discovery-status',
        'list-matcher-discovery-connections',
        'get-matcher-discovery-schema',
        'start-matcher-discovery-extraction',
        'poll-matcher-discovery-extraction',
        'get-fetcher-job'
      ],
      ledgerSidePreparation: [
        'list-midaz-organizations',
        'list-midaz-ledgers',
        'list-midaz-transactions'
      ],
      matcherConfiguration: [
        'create-matcher-context',
        'create-matcher-fetcher-source',
        'create-matcher-ledger-source',
        'create-matcher-field-map'
      ]
    },
    steps: matcherFetcherMidazWorkflow.stepOrder.map((stepId) => ({
      step: stepId,
      description: matcherFetcherMidazWorkflow.steps[stepId].description,
      requiredInput: [...matcherFetcherMidazWorkflow.steps[stepId].requiredInput]
    }))
  };
}

export function planMatcherFetcherMidazWorkflow(input = {}) {
  const stepPlans = matcherFetcherMidazWorkflow.stepOrder.map((stepId, index) => {
    const stepDef = matcherFetcherMidazWorkflow.steps[stepId];
    const missingInput = getMissingRequiredInput(stepId, input);

    return {
      order: index + 1,
      step: stepId,
      description: stepDef.description,
      ready: missingInput.length === 0,
      missingInput
    };
  });

  return {
    workflow: matcherFetcherMidazWorkflow.id,
    planMode: 'guided-sequence',
    notes: [
      'Use Matcher discovery steps when you want Matcher to own the bridge to Fetcher.',
      'Use the direct Fetcher tools only when you need deeper inspection of the underlying Fetcher job or connection contracts.',
      'Use Midaz inspection steps to understand the ledger side before creating a LEDGER source or field map in Matcher.'
    ],
    steps: stepPlans
  };
}

export async function executeMatcherFetcherMidazStep(step, input = {}) {
  const missingInput = getMissingRequiredInput(step, input);
  if (missingInput.length > 0) {
    throw new Error(`Missing required workflow input for step "${step}": ${missingInput.join(', ')}`);
  }

  const matcherHeaders = typeof input.matcherHeaders === 'object' && input.matcherHeaders ? input.matcherHeaders : undefined;
  const fetcherProductName = input.fetcherProductName ? String(input.fetcherProductName) : undefined;
  const mutationOptions = {
    confirmMutation: input.confirmMutation,
    mutationReason: input.mutationReason
  };
  const organizationId = input.workflowOrganizationId || input.organizationId;

  if (input.workflowOrganizationId && input.organizationId && input.workflowOrganizationId !== input.organizationId) {
    throw new Error('workflowOrganizationId must match organizationId when both are provided');
  }

  switch (step) {
    case 'create-matcher-context':
      return executeMatcherAction({
        resource: 'contexts',
        action: 'create',
        body: input.context,
        headers: matcherHeaders,
        ...mutationOptions
      });

    case 'refresh-matcher-discovery':
      return executeMatcherAction({
        resource: 'discovery',
        action: 'refresh',
        headers: matcherHeaders,
        ...mutationOptions
      });

    case 'get-matcher-discovery-status':
      return executeMatcherAction({
        resource: 'discovery',
        action: 'getStatus',
        headers: matcherHeaders
      });

    case 'list-matcher-discovery-connections':
      return executeMatcherAction({
        resource: 'discovery',
        action: 'listConnections',
        headers: matcherHeaders
      });

    case 'get-matcher-discovery-connection':
      return executeMatcherAction({
        resource: 'discovery',
        action: 'getConnection',
        pathParams: { connectionId: String(input.connectionId) },
        headers: matcherHeaders
      });

    case 'get-matcher-discovery-schema':
      return executeMatcherAction({
        resource: 'discovery',
        action: 'getConnectionSchema',
        pathParams: { connectionId: String(input.connectionId) },
        headers: matcherHeaders
      });

    case 'start-matcher-discovery-extraction':
      return executeMatcherAction({
        resource: 'discovery',
        action: 'startExtraction',
        pathParams: { connectionId: String(input.connectionId) },
        body: input.extractionRequest,
        headers: matcherHeaders,
        ...mutationOptions
      });

    case 'poll-matcher-discovery-extraction':
      return executeMatcherAction({
        resource: 'discovery',
        action: 'pollExtraction',
        pathParams: { extractionId: String(input.extractionId) },
        headers: matcherHeaders
      });

    case 'get-fetcher-job':
      return executeFetcherAction({
        resource: 'fetcher-jobs',
        action: 'get',
        organizationId: String(organizationId),
        productName: fetcherProductName,
        pathParams: { id: String(input.fetcherJobId) }
      });

    case 'list-midaz-organizations':
      return executeMidazAction({
        resource: 'organizations',
        action: 'list',
        queryParams: typeof input.midazQueryParams === 'object' && input.midazQueryParams ? input.midazQueryParams : {}
      });

    case 'list-midaz-ledgers':
      return executeMidazAction({
        resource: 'ledgers',
        action: 'list',
        pathParams: { organizationId: String(organizationId) },
        queryParams: typeof input.midazQueryParams === 'object' && input.midazQueryParams ? input.midazQueryParams : {}
      });

    case 'list-midaz-transactions':
      return executeMidazAction({
        resource: 'transactions',
        action: 'list',
        pathParams: {
          organizationId: String(organizationId),
          ledgerId: String(input.ledgerId)
        },
        queryParams: {
          limit: 50,
          ...(typeof input.midazQueryParams === 'object' && input.midazQueryParams ? input.midazQueryParams : {})
        }
      });

    case 'create-matcher-fetcher-source': {
      const source = {
        ...(typeof input.source === 'object' && input.source ? input.source : {}),
        type: 'FETCHER'
      };

      return executeMatcherAction({
        resource: 'sources',
        action: 'create',
        pathParams: { contextId: String(input.contextId) },
        body: source,
        headers: matcherHeaders,
        ...mutationOptions
      });
    }

    case 'create-matcher-ledger-source': {
      const source = {
        ...(typeof input.source === 'object' && input.source ? input.source : {}),
        type: 'LEDGER'
      };

      return executeMatcherAction({
        resource: 'sources',
        action: 'create',
        pathParams: { contextId: String(input.contextId) },
        body: source,
        headers: matcherHeaders,
        ...mutationOptions
      });
    }

    case 'create-matcher-field-map':
      return executeMatcherAction({
        resource: 'field-maps',
        action: 'create',
        pathParams: {
          contextId: String(input.contextId),
          sourceId: String(input.sourceId || input.matcherFetcherSourceId)
        },
        body: { mapping: input.mapping },
        headers: matcherHeaders,
        ...mutationOptions
      });

    default:
      throw new Error(`Unknown workflow step: ${step}`);
  }
}
