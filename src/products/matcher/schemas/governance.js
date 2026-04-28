const requestIdHeader = {
  'X-Request-Id': { required: false, description: 'Optional request ID for tracing.' }
};

export const governanceSchema = {
  resource: 'governance',
  component: 'governance',
  description: 'Matcher governance APIs for actor mappings, audit logs, and archive access.',
  actions: {
    getActorMapping: {
      method: 'GET',
      path: '/v1/governance/actor-mappings/:actorId',
      description: 'Get the governance actor mapping for a specific actor ID.',
      requestHeaders: requestIdHeader,
      pathParams: {
        actorId: { type: 'string', required: true, description: 'Actor identifier.' }
      }
    },
    upsertActorMapping: {
      method: 'PUT',
      path: '/v1/governance/actor-mappings/:actorId',
      description: 'Create or update the PII mapping for an actor ID.',
      requestHeaders: requestIdHeader,
      pathParams: {
        actorId: { type: 'string', required: true, description: 'Actor identifier.' }
      },
      input: {
        displayName: { type: 'string', required: false, description: 'Human-readable display name.' },
        email: { type: 'string', required: false, description: 'Actor email address.' }
      }
    },
    deleteActorMapping: {
      method: 'DELETE',
      path: '/v1/governance/actor-mappings/:actorId',
      description: 'Delete an actor mapping for GDPR-style right-to-erasure compliance.',
      requestHeaders: requestIdHeader,
      pathParams: {
        actorId: { type: 'string', required: true, description: 'Actor identifier.' }
      }
    },
    pseudonymizeActor: {
      method: 'POST',
      path: '/v1/governance/actor-mappings/:actorId/pseudonymize',
      description: 'Pseudonymize an actor mapping while preserving the actor ID link.',
      requestHeaders: requestIdHeader,
      pathParams: {
        actorId: { type: 'string', required: true, description: 'Actor identifier.' }
      }
    },
    listArchives: {
      method: 'GET',
      path: '/v1/governance/archives',
      description: 'List completed audit log archives with offset pagination.',
      requestHeaders: requestIdHeader,
      queryParams: {
        from: { type: 'string', description: 'Start date filter (YYYY-MM-DD or RFC3339).' },
        to: { type: 'string', description: 'End date filter (YYYY-MM-DD or RFC3339).' },
        limit: { type: 'number', description: 'Maximum number of records.' },
        offset: { type: 'number', description: 'Number of records to skip.' }
      }
    },
    downloadArchive: {
      method: 'GET',
      path: '/v1/governance/archives/:id/download',
      description: 'Get a presigned URL for downloading a completed audit archive.',
      requestHeaders: requestIdHeader,
      pathParams: {
        id: { type: 'string', required: true, description: 'Archive UUID.' }
      }
    },
    listAuditLogs: {
      method: 'GET',
      path: '/v1/governance/audit-logs',
      description: 'List audit logs across the tenant with pagination and filters.',
      requestHeaders: requestIdHeader,
      queryParams: {
        actor: { type: 'string', description: 'Actor ID filter.' },
        date_from: { type: 'string', description: 'Start date filter.' },
        date_to: { type: 'string', description: 'End date filter.' },
        action: { type: 'string', description: 'Action filter.' },
        entity_type: { type: 'string', description: 'Entity type filter.' },
        limit: { type: 'number', description: 'Maximum number of records.' },
        cursor: { type: 'string', description: 'Pagination cursor.' }
      }
    },
    getAuditLog: {
      method: 'GET',
      path: '/v1/governance/audit-logs/:id',
      description: 'Get one audit log by ID.',
      requestHeaders: requestIdHeader,
      pathParams: {
        id: { type: 'string', required: true, description: 'Audit log UUID.' }
      }
    },
    listEntityAuditLogs: {
      method: 'GET',
      path: '/v1/governance/entities/:entityType/:entityId/audit-logs',
      description: 'List audit logs for a specific entity.',
      requestHeaders: requestIdHeader,
      pathParams: {
        entityType: { type: 'string', required: true, description: 'Entity type.' },
        entityId: { type: 'string', required: true, description: 'Entity UUID.' }
      },
      queryParams: {
        limit: { type: 'number', description: 'Maximum number of records.' },
        cursor: { type: 'string', description: 'Pagination cursor.' }
      }
    }
  }
};
