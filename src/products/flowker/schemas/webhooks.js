import { flowkerAuthHeaders, flowkerOptionalIdempotencyHeader } from './shared.js';

const webhookPathParam = {
  path: {
    type: 'string',
    required: true,
    description: 'Webhook path. Nested segments are supported, for example "payments/kyc/callback".'
  }
};

const webhookHeaders = {
  ...flowkerAuthHeaders,
  ...flowkerOptionalIdempotencyHeader,
  'X-Webhook-Token': {
    required: false,
    description: 'Per-webhook verification token when the workflow webhook is configured to require one.'
  }
};

export const webhooksSchema = {
  resource: 'webhooks',
  component: 'webhook',
  description: 'Dynamic webhook ingress for triggering workflows through registered Flowker webhook paths.',
  actions: {
    get: {
      method: 'GET',
      path: '/v1/webhooks/:path',
      rawPathParams: ['path'],
      description: 'Trigger a webhook using GET. Runtime supports nested webhook paths.',
      requestHeaders: webhookHeaders,
      pathParams: webhookPathParam
    },
    post: {
      method: 'POST',
      path: '/v1/webhooks/:path',
      rawPathParams: ['path'],
      description: 'Trigger a webhook using POST. Runtime supports nested webhook paths and optional JSON body payloads.',
      requestHeaders: webhookHeaders,
      pathParams: webhookPathParam,
      bodyType: 'freeform-json',
      input: {
        '<any>': {
          type: 'object',
          required: false,
          description: 'Arbitrary webhook JSON payload. Pass fields directly as flowker-execute.body.'
        }
      }
    },
    put: {
      method: 'PUT',
      path: '/v1/webhooks/:path',
      rawPathParams: ['path'],
      description: 'Trigger a webhook using PUT. Runtime supports nested webhook paths and optional JSON body payloads.',
      requestHeaders: webhookHeaders,
      pathParams: webhookPathParam,
      bodyType: 'freeform-json',
      input: {
        '<any>': {
          type: 'object',
          required: false,
          description: 'Arbitrary webhook JSON payload. Pass fields directly as flowker-execute.body.'
        }
      }
    },
    patch: {
      method: 'PATCH',
      path: '/v1/webhooks/:path',
      rawPathParams: ['path'],
      description: 'Trigger a webhook using PATCH. Runtime supports nested webhook paths and optional JSON body payloads.',
      requestHeaders: webhookHeaders,
      pathParams: webhookPathParam,
      bodyType: 'freeform-json',
      input: {
        '<any>': {
          type: 'object',
          required: false,
          description: 'Arbitrary webhook JSON payload. Pass fields directly as flowker-execute.body.'
        }
      }
    },
    delete: {
      method: 'DELETE',
      path: '/v1/webhooks/:path',
      rawPathParams: ['path'],
      description: 'Trigger a webhook using DELETE. Runtime supports nested webhook paths.',
      requestHeaders: webhookHeaders,
      pathParams: webhookPathParam
    },
    head: {
      method: 'HEAD',
      path: '/v1/webhooks/:path',
      rawPathParams: ['path'],
      description: 'Trigger a webhook using HEAD. Runtime supports nested webhook paths.',
      requestHeaders: webhookHeaders,
      pathParams: webhookPathParam
    },
    options: {
      method: 'OPTIONS',
      path: '/v1/webhooks/:path',
      rawPathParams: ['path'],
      description: 'Trigger a webhook using OPTIONS. Runtime supports nested webhook paths.',
      requestHeaders: webhookHeaders,
      pathParams: webhookPathParam
    }
  }
};
