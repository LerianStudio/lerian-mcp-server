export const jurisdictionsSchema = {
  resource: 'jurisdictions',
  component: 'reference-data',
  description: 'Public jurisdiction profile discovery for regulatory loan behavior.',
  actions: {
    list: {
      method: 'GET',
      path: '/api/v1/jurisdictions',
      description: 'List jurisdiction profiles compiled into the running Underwriter service.'
    },
    get: {
      method: 'GET',
      path: '/api/v1/jurisdictions/:code',
      description: 'Get a single jurisdiction profile by ISO-style code.',
      pathParams: {
        code: { type: 'string', required: true, description: 'Jurisdiction code such as BR or XX.' }
      }
    }
  }
};
