/**
 * Secret Manager - Automatic generation and persistence of cryptographic secrets
 *
 * Provides seamless MCP server setup by automatically generating and persisting
 * required secrets (CURSOR_SECRET, CACHE_ENCRYPTION_KEY) on first run.
 *
 * Secrets are stored in: ~/.lerian/secrets.json
 * File permissions: 0600 (read/write by owner only)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createLogger } from './mcp-logging.js';

const logger = createLogger('secret-manager');

/**
 * Get or create secrets directory in user's home
 */
function getSecretsDirectory() {
  const secretsDir = path.join(os.homedir(), '.lerian');

  if (!fs.existsSync(secretsDir)) {
    fs.mkdirSync(secretsDir, { recursive: true, mode: 0o700 });
  }

  return secretsDir;
}

/**
 * Get path to secrets file
 */
function getSecretsFilePath() {
  return path.join(getSecretsDirectory(), 'secrets.json');
}

/**
 * Generate a cryptographically strong secret
 */
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Load secrets from persistent storage
 */
function loadSecrets() {
  const secretsPath = getSecretsFilePath();

  if (!fs.existsSync(secretsPath)) {
    return null;
  }

  try {
    const data = fs.readFileSync(secretsPath, 'utf8');
    const secrets = JSON.parse(data);

    // Validate format
    if (!secrets.cursorSecret || !secrets.cacheEncryptionKey) {
      logger.warn('Secrets file has invalid format, will regenerate');
      return null;
    }

    return secrets;
  } catch (error) {
    logger.error('Failed to load secrets file', { error: error.message });
    return null;
  }
}

/**
 * Save secrets to persistent storage
 */
function saveSecrets(secrets) {
  const secretsPath = getSecretsFilePath();

  try {
    const data = JSON.stringify(secrets, null, 2);
    fs.writeFileSync(secretsPath, data, { mode: 0o600 });
    logger.info('Secrets saved to persistent storage', { path: secretsPath });
    return true;
  } catch (error) {
    logger.error('Failed to save secrets', { error: error.message });
    return false;
  }
}

/**
 * Get or generate CURSOR_SECRET
 *
 * Priority:
 * 1. Environment variable CURSOR_SECRET
 * 2. Persisted secret from ~/.lerian/secrets.json
 * 3. Generate new secret and persist
 */
export function getCursorSecret() {
  // Priority 1: Environment variable
  if (process.env.CURSOR_SECRET) {
    logger.info('Using CURSOR_SECRET from environment variable');
    return process.env.CURSOR_SECRET;
  }

  // Priority 2: Load from persistent storage
  const stored = loadSecrets();
  if (stored && stored.cursorSecret) {
    logger.info('Using CURSOR_SECRET from persistent storage');
    return stored.cursorSecret;
  }

  // Priority 3: Generate and persist
  logger.info('Generating new CURSOR_SECRET (first run)');
  const newSecret = generateSecret();

  const secrets = {
    cursorSecret: newSecret,
    cacheEncryptionKey: stored?.cacheEncryptionKey || generateSecret(),
    createdAt: new Date().toISOString(),
    version: '1.0'
  };

  if (saveSecrets(secrets)) {
    console.error('✅ Generated CURSOR_SECRET and saved to ~/.lerian/secrets.json');
    console.error('   Pagination cursors will persist across restarts');
    console.error('   To use custom secret, set CURSOR_SECRET environment variable');
  } else {
    console.error('⚠️  Generated CURSOR_SECRET but failed to persist');
    console.error('   Pagination will break on restart');
    console.error('   Please set CURSOR_SECRET environment variable manually');
  }

  return newSecret;
}

/**
 * Get or generate CACHE_ENCRYPTION_KEY
 *
 * Priority:
 * 1. Environment variable CACHE_ENCRYPTION_KEY
 * 2. Persisted secret from ~/.lerian/secrets.json
 * 3. Generate new secret and persist
 */
export function getCacheEncryptionKey() {
  // Priority 1: Environment variable
  if (process.env.CACHE_ENCRYPTION_KEY) {
    logger.info('Using CACHE_ENCRYPTION_KEY from environment variable');
    return process.env.CACHE_ENCRYPTION_KEY;
  }

  // Priority 2: Load from persistent storage
  const stored = loadSecrets();
  if (stored && stored.cacheEncryptionKey) {
    logger.info('Using CACHE_ENCRYPTION_KEY from persistent storage');
    return stored.cacheEncryptionKey;
  }

  // Priority 3: Generate and persist
  logger.info('Generating new CACHE_ENCRYPTION_KEY (first run)');
  const newKey = generateSecret();

  const secrets = {
    cursorSecret: stored?.cursorSecret || generateSecret(),
    cacheEncryptionKey: newKey,
    createdAt: new Date().toISOString(),
    version: '1.0'
  };

  if (saveSecrets(secrets)) {
    console.error('✅ Generated CACHE_ENCRYPTION_KEY and saved to ~/.lerian/secrets.json');
    console.error('   Cache will persist across restarts');
    console.error('   To use custom key, set CACHE_ENCRYPTION_KEY environment variable');
  } else {
    console.error('⚠️  Generated CACHE_ENCRYPTION_KEY but failed to persist');
    console.error('   Cache will break on restart');
    console.error('   Please set CACHE_ENCRYPTION_KEY environment variable manually');
  }

  return newKey;
}

/**
 * Initialize all required secrets
 * Call this during server startup
 */
export function initializeSecrets() {
  logger.info('Initializing cryptographic secrets');

  const cursorSecret = getCursorSecret();
  const cacheKey = getCacheEncryptionKey();

  // Set environment variables if they weren't already set
  // This ensures other modules can access them via process.env
  if (!process.env.CURSOR_SECRET) {
    process.env.CURSOR_SECRET = cursorSecret;
  }

  if (!process.env.CACHE_ENCRYPTION_KEY) {
    process.env.CACHE_ENCRYPTION_KEY = cacheKey;
  }

  logger.info('Secrets initialized successfully');

  return {
    cursorSecret,
    cacheEncryptionKey: cacheKey,
    source: process.env.CURSOR_SECRET && process.env.CACHE_ENCRYPTION_KEY
      ? 'environment'
      : 'auto-generated'
  };
}

/**
 * Display secrets location and management instructions
 */
export function displaySecretsInfo() {
  const secretsPath = getSecretsFilePath();
  const exists = fs.existsSync(secretsPath);

  if (!exists) {
    return;
  }

  console.error('\n📁 Secrets stored at:', secretsPath);
  console.error('   File permissions: 0600 (owner read/write only)');
  console.error('   To rotate secrets: Delete file and restart server');
  console.error('   To use custom secrets: Set environment variables CURSOR_SECRET and CACHE_ENCRYPTION_KEY\n');
}
