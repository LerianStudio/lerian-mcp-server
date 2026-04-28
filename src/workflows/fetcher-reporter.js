import { routeAndExecute as executeFetcherAction } from '../products/fetcher/router.js';
import { routeAndExecute as executeReporterAction } from '../products/reporter/router.js';

export const fetcherReporterWorkflow = {
  id: 'fetcher-to-reporter',
  name: 'Fetcher -> Reporter',
  description: 'Cross-product workflow for validating extraction mappings with Fetcher and then generating or inspecting reports in Reporter.',
  overview: [
    'Reporter can run in Fetcher mode, where report generation triggers a Fetcher extraction job behind the scenes.',
    'This workflow supports both preflight extraction testing and end-to-end report generation sequencing.',
    'Use it when you want to verify data source mappings before creating a report, or when you want a guided sequence across both products.'
  ],
  prerequisites: [
    'Fetcher manager and Reporter manager must both be reachable from this MCP runtime.',
    'Fetcher actions usually require organizationId and sometimes productName.',
    'Reporter report creation requires an existing templateId and compatible filters.',
    'If you create templates through reporter-execute, template upload/update uses multipart form data.'
  ],
  stepOrder: [
    'list-reporter-data-sources',
    'get-reporter-data-source',
    'validate-fetcher-schema',
    'create-fetcher-job',
    'create-reporter-report',
    'get-reporter-report',
    'download-reporter-report'
  ],
  steps: {
    'list-reporter-data-sources': {
      description: 'List Reporter-visible data sources and confirm the external datasource IDs you want to use in mappings.',
      requiredInput: []
    },
    'get-reporter-data-source': {
      description: 'Inspect one Reporter datasource and its table/field surface before building mappedFields.',
      requiredInput: ['dataSourceId']
    },
    'validate-fetcher-schema': {
      description: 'Validate mappedFields against Fetcher before generating a report or dispatching an extraction job.',
      requiredInput: ['organizationId', 'mappedFields']
    },
    'create-fetcher-job': {
      description: 'Run a preflight extraction job directly in Fetcher using mappedFields and optional filters.',
      requiredInput: ['organizationId', 'mappedFields']
    },
    'create-reporter-report': {
      description: 'Create a Reporter report. In Fetcher mode, Reporter will create and reconcile a Fetcher extraction job internally.',
      requiredInput: ['templateId', 'filters']
    },
    'get-reporter-report': {
      description: 'Inspect report status and metadata by report ID.',
      requiredInput: ['reportId']
    },
    'download-reporter-report': {
      description: 'Download the generated report artifact by report ID.',
      requiredInput: ['reportId']
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

export function captureFetcherReporterArtifacts(step, result) {
  switch (step) {
    case 'get-reporter-data-source': {
      const dataSourceId = firstDefined(result, ['dataSourceId', 'id']);
      return dataSourceId ? { dataSourceId } : {};
    }
    case 'create-fetcher-job': {
      const fetcherJobId = firstDefined(result, ['jobId', 'jobID', 'id']);
      return fetcherJobId ? { fetcherJobId } : {};
    }
    case 'create-reporter-report': {
      const reportId = firstDefined(result, ['reportId', 'id']);
      return reportId ? { reportId } : {};
    }
    default:
      return {};
  }
}

function getStepDefinition(step) {
  return fetcherReporterWorkflow.steps[step] || null;
}

function getValue(input, key) {
  return input && Object.prototype.hasOwnProperty.call(input, key) ? input[key] : undefined;
}

function getMissingRequiredInput(step, input = {}) {
  const stepDef = getStepDefinition(step);
  if (!stepDef) {
    return [];
  }

  return stepDef.requiredInput.filter((field) => {
    const value = getValue(input, field);
    return value === undefined || value === null || value === '';
  });
}

export function describeFetcherReporterWorkflow() {
  return {
    workflow: fetcherReporterWorkflow.id,
    name: fetcherReporterWorkflow.name,
    description: fetcherReporterWorkflow.description,
    overview: [...fetcherReporterWorkflow.overview],
    prerequisites: [...fetcherReporterWorkflow.prerequisites],
    recommendedPaths: {
      preflightExtraction: [
        'list-reporter-data-sources',
        'get-reporter-data-source',
        'validate-fetcher-schema',
        'create-fetcher-job'
      ],
      endToEndReportGeneration: [
        'list-reporter-data-sources',
        'get-reporter-data-source',
        'validate-fetcher-schema',
        'create-reporter-report',
        'get-reporter-report',
        'download-reporter-report'
      ]
    },
    steps: fetcherReporterWorkflow.stepOrder.map((stepId) => ({
      step: stepId,
      description: fetcherReporterWorkflow.steps[stepId].description,
      requiredInput: [...fetcherReporterWorkflow.steps[stepId].requiredInput]
    }))
  };
}

export function planFetcherReporterWorkflow(input = {}) {
  const stepPlans = fetcherReporterWorkflow.stepOrder.map((stepId, index) => {
    const stepDef = fetcherReporterWorkflow.steps[stepId];
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
    workflow: fetcherReporterWorkflow.id,
    planMode: 'guided-sequence',
    notes: [
      'Use create-fetcher-job when you want to test extraction directly in Fetcher.',
      'Use create-reporter-report when you want Reporter to own the end-to-end report lifecycle and trigger Fetcher internally in Fetcher mode.'
    ],
    steps: stepPlans
  };
}

export async function executeFetcherReporterStep(step, input = {}) {
  const missingInput = getMissingRequiredInput(step, input);
  if (missingInput.length > 0) {
    throw new Error(`Missing required workflow input for step "${step}": ${missingInput.join(', ')}`);
  }

  const mutationOptions = {
    confirmMutation: input.confirmMutation,
    mutationReason: input.mutationReason
  };

  switch (step) {
    case 'list-reporter-data-sources':
      return executeReporterAction({
        resource: 'data-sources',
        action: 'list'
      });

    case 'get-reporter-data-source':
      return executeReporterAction({
        resource: 'data-sources',
        action: 'get',
        pathParams: {
          dataSourceId: String(input.dataSourceId)
        }
      });

    case 'validate-fetcher-schema':
      return executeFetcherAction({
        resource: 'connections',
        action: 'validateSchema',
        organizationId: String(input.organizationId),
        body: {
          mappedFields: input.mappedFields
        },
        ...mutationOptions
      });

    case 'create-fetcher-job': {
      const metadata = {
        source: 'reporter-workflow',
        ...(typeof input.metadata === 'object' && input.metadata ? input.metadata : {})
      };

      return executeFetcherAction({
        resource: 'fetcher-jobs',
        action: 'create',
        organizationId: String(input.organizationId),
        productName: input.productName ? String(input.productName) : undefined,
        body: {
          dataRequest: {
            mappedFields: input.mappedFields,
            ...(input.filters ? { filters: input.filters } : {})
          },
          metadata
        },
        ...mutationOptions
      });
    }

    case 'create-reporter-report':
      return executeReporterAction({
        resource: 'reports',
        action: 'create',
        body: {
          templateId: String(input.templateId),
          filters: input.filters
        },
        headers: typeof input.headers === 'object' && input.headers ? input.headers : undefined,
        ...mutationOptions
      });

    case 'get-reporter-report':
      return executeReporterAction({
        resource: 'reports',
        action: 'get',
        pathParams: {
          id: String(input.reportId)
        }
      });

    case 'download-reporter-report':
      return executeReporterAction({
        resource: 'reports',
        action: 'download',
        pathParams: {
          id: String(input.reportId)
        }
      });

    default:
      throw new Error(`Unknown workflow step: ${step}`);
  }
}
