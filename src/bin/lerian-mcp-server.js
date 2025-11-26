#!/usr/bin/env node

/**
 * Lerian MCP Server - NPX Executable Entry Point
 * 
 * This script enables running the Lerian MCP server via npx:
 * npx @lerianstudio/lerian-mcp-server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if running via npx by looking for npm_config_user_agent
const isNpx = process.env.npm_config_user_agent?.includes('npx');

// Print startup message
console.error('🚀 Starting Lerian MCP Server (Documentation Mode)...');
console.error('📚 Providing documentation, tutorials, and SDK code generation');
console.error('💡 This server does NOT connect to Lerian backend APIs');
console.error('   For live API access, use Lerian SDKs in your application');
console.error('');
if (isNpx) {
  console.error('📦 Running via npx');
}

// Check for existing configuration
function checkConfiguration() {
  const configPaths = [
    join(process.cwd(), 'lerian-mcp-config.json'),
    join(process.cwd(), 'midaz-mcp-config.json'), // backward compatibility
    join(process.env.HOME || '', '.lerian', 'mcp-config.json'),
    join(process.env.HOME || '', '.midaz', 'mcp-config.json') // backward compatibility
  ];

  for (const path of configPaths) {
    if (fs.existsSync(path)) {
      console.error(`📄 Found configuration at: ${path}`);
      return path;
    }
  }

  console.error('ℹ️  No configuration file found. Using default settings.');
  console.error('💡 Run "lerian-mcp-config" or "midaz-mcp-config" to create a configuration file.\n');
  return null;
}

// Main execution
async function main() {
  // Check configuration
  const configPath = checkConfiguration();

  // Determine the path to the actual server file
  const serverPath = join(__dirname, '..', 'index.js');

  // Prepare environment variables
  const env = { ...process.env };

  // If config file exists, pass it as an argument
  const args = process.argv.slice(2);
  if (configPath && !args.includes('--config')) {
    args.push('--config', configPath);
  }

  console.error('📡 Starting MCP server...\n');
  console.error('=' + '='.repeat(79));

  // Spawn the actual server process
  const serverProcess = spawn('node', [serverPath, ...args], {
    stdio: 'inherit',
    env
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.error('\n⏹️  Shutting down Lerian MCP Server...');
    serverProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    serverProcess.kill('SIGTERM');
  });

  serverProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// Run the main function
main().catch((error) => {
  console.error('❌ Failed to start Lerian MCP Server:', error.message);
  process.exit(1);
});