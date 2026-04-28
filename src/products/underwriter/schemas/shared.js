export const underwriterProtectedHeaders = {
  Authorization: {
    required: false,
    description: 'Bearer token for protected Underwriter routes. Configure UNDERWRITER_AUTH_TOKEN; caller-supplied Authorization headers are ignored.'
  }
};
