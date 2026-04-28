export const flowkerAuthHeaders = {
  Authorization: {
    required: false,
    description: 'Bearer token for Flowker when auth is enabled. Configure FLOWKER_AUTH_TOKEN; caller-supplied Authorization headers are ignored.'
  },
  'X-API-Key': {
    required: false,
    description: 'API key fallback/alternative for Flowker. Configure FLOWKER_API_KEY; caller-supplied X-API-Key headers are ignored.'
  }
};

export const flowkerOptionalIdempotencyHeader = {
  'Idempotency-Key': {
    required: false,
    description: 'Optional idempotency key for duplicate-suppression on webhook ingestion.'
  }
};

export const flowkerRequiredIdempotencyHeader = {
  'Idempotency-Key': {
    required: true,
    description: 'Required idempotency key for starting a workflow execution.'
  }
};
