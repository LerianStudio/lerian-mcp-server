/**
 * Setup utilities for the Lerian MCP server
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Create a default configuration file
 * @param {string} configPath - Path to create the config file
 */
export function createDefaultConfigFile(configPath) {
    const defaultConfig = {
        server: {
            name: 'lerian-mcp-server',
            version: '3.4.0'
        },
        docsUrl: 'https://docs.lerian.studio',
        midazApi: {
            onboardingUrl: 'http://localhost:3000',
            transactionUrl: 'http://localhost:3001',
            crmUrl: 'http://localhost:3002',
            ledgerUrl: 'http://localhost:3003',
            authToken: '',
            timeout: 30000
        },
        fetcherApi: {
            managerUrl: 'http://localhost:4006',
            authToken: '',
            timeout: 30000
        },
        reporterApi: {
            managerUrl: 'http://localhost:4005',
            authToken: '',
            maxUploadBytes: 10485760,
            maxDownloadBytes: 10485760,
            timeout: 30000
        },
        tracerApi: {
            baseUrl: 'http://localhost:4020',
            apiKey: '',
            timeout: 30000
        },
        matcherApi: {
            baseUrl: 'http://localhost:4018',
            authToken: '',
            maxDownloadBytes: 10485760,
            timeout: 30000
        },
        flowkerApi: {
            baseUrl: 'http://localhost:4021',
            authToken: '',
            apiKey: '',
            timeout: 30000
        },
        underwriterApi: {
            baseUrl: 'http://localhost:8080',
            authToken: '',
            timeout: 30000
        },
        logLevel: 'info'
    };

    // Create directory if it doesn't exist
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Write config file
    fs.writeFileSync(
        configPath,
        JSON.stringify(defaultConfig, null, 2),
        'utf8'
    );

    console.log(`Created default config file at: ${configPath}`);
}

/**
 * Create user config directory and default config file
 */
export function setupUserConfig() {
    let configPath;

    // Determine config path based on platform
    if (process.platform === 'win32') {
        configPath = path.join(os.homedir(), 'AppData', 'Local', 'Lerian', 'mcp-config.json');
    } else if (process.platform === 'darwin') {
        configPath = path.join(os.homedir(), 'Library', 'Application Support', 'Lerian', 'mcp-config.json');
    } else {
        configPath = path.join(os.homedir(), '.config', 'lerian', 'mcp-config.json');
    }

    // Skip if config already exists
    if (fs.existsSync(configPath)) {
        console.log(`Config file already exists at: ${configPath}`);
        return configPath;
    }

    createDefaultConfigFile(configPath);
    return configPath;
}

/**
 * Create a local configuration file in the current directory
 */
export function setupLocalConfig() {
    const configPath = path.join(process.cwd(), 'lerian-mcp-config.json');

    // Skip if config already exists
    if (fs.existsSync(configPath)) {
        console.log(`Local config file already exists at: ${configPath}`);
        return configPath;
    }

    createDefaultConfigFile(configPath);
    return configPath;
}

export default {
    setupUserConfig,
    setupLocalConfig,
    createDefaultConfigFile,
}; 
