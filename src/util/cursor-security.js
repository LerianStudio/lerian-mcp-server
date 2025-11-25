import crypto from 'crypto';

const CURSOR_SECRET = process.env.CURSOR_SECRET || crypto.randomBytes(32).toString('hex');

/**
 * Create a cryptographically signed cursor
 * @param {any} data - Data to encode (string, number, or object)
 * @returns {string} - Signed cursor in format: payload.signature
 */
export function createSignedCursor(data) {
  const dataStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
  const payload = Buffer.from(dataStr).toString('base64');
  const hmac = crypto.createHmac('sha256', CURSOR_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verify and decode a signed cursor
 * @param {string} cursor - Signed cursor to verify and decode
 * @returns {any} - Decoded data (parsed JSON object or string)
 * @throws {Error} - If cursor format is invalid or signature doesn't match
 */
export function verifyAndDecodeCursor(cursor) {
  if (!cursor) return null;

  const parts = cursor.split('.');
  if (parts.length !== 2) {
    throw new Error('Invalid cursor format');
  }

  const [payload, signature] = parts;

  const hmac = crypto.createHmac('sha256', CURSOR_SECRET);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
    throw new Error('Invalid cursor signature');
  }

  const decoded = Buffer.from(payload, 'base64').toString('utf8');
  try {
    return JSON.parse(decoded);
  } catch {
    return decoded;
  }
}
