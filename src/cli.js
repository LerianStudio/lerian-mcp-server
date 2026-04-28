#!/usr/bin/env node

/**
 * Command-line interface for managing the Lerian MCP server
 * Provides interactive configuration setup and management tools
 * 
 * @since 3.0.0 - Rebranded from Midaz to Lerian
 */

import { setupUserConfig, setupLocalConfig } from './util/setup.js';
import { maskSensitiveData } from './util/security-utils.js';
import config from './config.js';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import os from 'os';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Ask a question and get user input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} - User input
 */
function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

/**
 * Print a section header
 * @param {string} title - Section title
 */
function printSection(title) {
    console.log('');
    console.log(`📋 ${title}`);
    console.log('─'.repeat(title.length + 4));
}

/**
 * Display main menu and handle user selection
 */
async function mainMenu() {
    printSection('Lerian MCP Server Configuration');
    console.log('Please select an option:');
    console.log('1. Create local configuration file');
    console.log('2. Create user configuration file');
    console.log('3. Update live API connection settings');
    console.log('4. Show current configuration');
    console.log('0. Exit');

    const choice = await ask('\nEnter your choice (0-4): ');

    switch (choice) {
        case '1':
            await createLocalConfig();
            break;
        case '2':
            await createUserConfig();
            break;
        case '3':
            await updateBackendSettings();
            break;
        case '4':
            showCurrentConfig();
            break;
        case '0':
            console.log('\nExiting...');
            rl.close();
            return;
        default:
            console.log('\nInvalid choice. Please try again.');
    }

    // Return to main menu
    await mainMenu();
}

/**
 * Create a local configuration file
 */
async function createLocalConfig() {
    printSection('Create Local Configuration');

    const configPath = setupLocalConfig();
    console.log(`\nLocal configuration file created at: ${configPath}`);

    const proceed = await ask('\nWould you like to configure the connection settings now? (y/n): ');

    if (proceed.toLowerCase() === 'y') {
        await updateBackendSettings(configPath);
    }
}

/**
 * Create a user configuration file
 */
async function createUserConfig() {
    printSection('Create User Configuration');

    const configPath = setupUserConfig();
    console.log(`\nUser configuration file created at: ${configPath}`);

    const proceed = await ask('\nWould you like to configure the connection settings now? (y/n): ');

    if (proceed.toLowerCase() === 'y') {
        await updateBackendSettings(configPath);
    }
}

function ensureProductConfig(configData) {
    configData.midazApi ||= {};
    configData.fetcherApi ||= {};
    configData.reporterApi ||= {};
    configData.tracerApi ||= {};
    configData.matcherApi ||= {};
    configData.flowkerApi ||= {};
    configData.underwriterApi ||= {};
}

async function askOptionalString(label, currentValue) {
    const value = await ask(`${label} [${currentValue || 'none'}]: `);
    return value || currentValue || '';
}

async function askOptionalNumber(label, currentValue) {
    const value = await ask(`${label} [${currentValue || 30000}]: `);
    return value ? parseInt(value, 10) : (currentValue || 30000);
}

/**
 * Update live product API connection settings.
 * @param {string} configPath - Path to config file (optional)
 */
async function updateBackendSettings(configPath) {
    printSection('Update Live API Connection Settings');

    // If no config path provided, ask user which config to update
    if (!configPath) {
        console.log('Please select which configuration file to update:');

        // Determine available config files
        const { local, legacyLocal, user, legacyUser } = getConfigPaths();
        let options = [];

        if (fs.existsSync(local)) {
            console.log(`1. Local configuration (${local})`);
            options.push(local);
        }

        if (fs.existsSync(user)) {
            console.log(`${options.length + 1}. User configuration (${user})`);
            options.push(user);
        }

        if (fs.existsSync(legacyLocal)) {
            console.log(`${options.length + 1}. Legacy local configuration (${legacyLocal})`);
            options.push(legacyLocal);
        }

        if (fs.existsSync(legacyUser)) {
            console.log(`${options.length + 1}. Legacy user configuration (${legacyUser})`);
            options.push(legacyUser);
        }

        if (options.length === 0) {
            console.log('No configuration files found. Please create one first.');
            return;
        }

        const choice = await ask(`\nEnter your choice (1-${options.length}): `);
        const index = parseInt(choice) - 1;

        if (index < 0 || index >= options.length) {
            console.log('Invalid choice. Please try again.');
            return;
        }

        configPath = options[index];
    }

    // Read existing config
    let configData;
    try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        configData = JSON.parse(configContent);
    } catch (error) {
        console.log(`Error reading config file: ${error.message}`);
        return;
    }

    ensureProductConfig(configData);
    console.log('\nEnter live API settings (press Enter to keep current value):');

    console.log('\nMidaz API:');
    configData.midazApi.onboardingUrl = await askOptionalString('Onboarding URL', configData.midazApi.onboardingUrl || 'http://localhost:3000');
    configData.midazApi.transactionUrl = await askOptionalString('Transaction URL', configData.midazApi.transactionUrl || 'http://localhost:3001');
    configData.midazApi.crmUrl = await askOptionalString('CRM URL', configData.midazApi.crmUrl || 'http://localhost:3002');
    configData.midazApi.ledgerUrl = await askOptionalString('Ledger URL', configData.midazApi.ledgerUrl || 'http://localhost:3003');
    configData.midazApi.authToken = await askOptionalString('Auth token', configData.midazApi.authToken || '');
    configData.midazApi.timeout = await askOptionalNumber('Timeout in ms', configData.midazApi.timeout);

    console.log('\nFetcher API:');
    configData.fetcherApi.managerUrl = await askOptionalString('Manager URL', configData.fetcherApi.managerUrl || 'http://localhost:4006');
    configData.fetcherApi.authToken = await askOptionalString('Auth token', configData.fetcherApi.authToken || '');
    configData.fetcherApi.timeout = await askOptionalNumber('Timeout in ms', configData.fetcherApi.timeout);

    console.log('\nReporter API:');
    configData.reporterApi.managerUrl = await askOptionalString('Manager URL', configData.reporterApi.managerUrl || 'http://localhost:4005');
    configData.reporterApi.authToken = await askOptionalString('Auth token', configData.reporterApi.authToken || '');
    configData.reporterApi.timeout = await askOptionalNumber('Timeout in ms', configData.reporterApi.timeout);

    console.log('\nTracer API:');
    configData.tracerApi.baseUrl = await askOptionalString('Base URL', configData.tracerApi.baseUrl || 'http://localhost:4020');
    configData.tracerApi.apiKey = await askOptionalString('API key', configData.tracerApi.apiKey || '');
    configData.tracerApi.timeout = await askOptionalNumber('Timeout in ms', configData.tracerApi.timeout);

    console.log('\nMatcher API:');
    configData.matcherApi.baseUrl = await askOptionalString('Base URL', configData.matcherApi.baseUrl || 'http://localhost:4018');
    configData.matcherApi.authToken = await askOptionalString('Auth token', configData.matcherApi.authToken || '');
    configData.matcherApi.timeout = await askOptionalNumber('Timeout in ms', configData.matcherApi.timeout);

    console.log('\nFlowker API:');
    configData.flowkerApi.baseUrl = await askOptionalString('Base URL', configData.flowkerApi.baseUrl || 'http://localhost:4021');
    configData.flowkerApi.authToken = await askOptionalString('Auth token', configData.flowkerApi.authToken || '');
    configData.flowkerApi.apiKey = await askOptionalString('API key', configData.flowkerApi.apiKey || '');
    configData.flowkerApi.timeout = await askOptionalNumber('Timeout in ms', configData.flowkerApi.timeout);

    console.log('\nUnderwriter API:');
    configData.underwriterApi.baseUrl = await askOptionalString('Base URL', configData.underwriterApi.baseUrl || 'http://localhost:8080');
    configData.underwriterApi.authToken = await askOptionalString('Auth token', configData.underwriterApi.authToken || '');
    configData.underwriterApi.timeout = await askOptionalNumber('Timeout in ms', configData.underwriterApi.timeout);

    configData.logLevel = await askOptionalString('Log Level', configData.logLevel || 'info');

    // Save config
    try {
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
        console.log(`\nConfiguration updated successfully at: ${configPath}`);
    } catch (error) {
        console.log(`Error writing config file: ${error.message}`);
    }
}

/**
 * Show current configuration
 */
function showCurrentConfig() {
    printSection('Current Configuration');

    console.log('Currently using configuration from:', config._source || 'default');

    console.log('\nMidaz API:');
    console.log(`  Onboarding URL: ${config.midazApi?.onboardingUrl}`);
    console.log(`  Transaction URL: ${config.midazApi?.transactionUrl}`);
    console.log(`  CRM URL: ${config.midazApi?.crmUrl}`);
    console.log(`  Ledger URL: ${config.midazApi?.ledgerUrl}`);
    console.log(`  Auth Token: ${maskSensitiveData(config.midazApi?.authToken || '')}`);
    console.log(`  Timeout: ${config.midazApi?.timeout}ms`);

    console.log('\nFetcher API:');
    console.log(`  Manager URL: ${config.fetcherApi?.managerUrl}`);
    console.log(`  Auth Token: ${maskSensitiveData(config.fetcherApi?.authToken || '')}`);

    console.log('\nReporter API:');
    console.log(`  Manager URL: ${config.reporterApi?.managerUrl}`);
    console.log(`  Auth Token: ${maskSensitiveData(config.reporterApi?.authToken || '')}`);

    console.log('\nTracer API:');
    console.log(`  Base URL: ${config.tracerApi?.baseUrl}`);
    console.log(`  API Key: ${maskSensitiveData(config.tracerApi?.apiKey || '')}`);

    console.log('\nMatcher API:');
    console.log(`  Base URL: ${config.matcherApi?.baseUrl}`);
    console.log(`  Auth Token: ${maskSensitiveData(config.matcherApi?.authToken || '')}`);

    console.log('\nFlowker API:');
    console.log(`  Base URL: ${config.flowkerApi?.baseUrl}`);
    console.log(`  Auth Token: ${maskSensitiveData(config.flowkerApi?.authToken || '')}`);
    console.log(`  API Key: ${maskSensitiveData(config.flowkerApi?.apiKey || '')}`);

    console.log('\nUnderwriter API:');
    console.log(`  Base URL: ${config.underwriterApi?.baseUrl}`);
    console.log(`  Auth Token: ${maskSensitiveData(config.underwriterApi?.authToken || '')}`);

    console.log(`Log Level: ${config.logLevel}`);

    console.log('\nPress Enter to continue...');

    // Wait for user to press Enter
    rl.once('line', () => { });
}

function getConfigPaths() {
    // Primary config paths
    const localConfigPath = path.join(process.cwd(), 'lerian-mcp-config.json');
    const legacyLocalConfigPath = path.join(process.cwd(), 'midaz-mcp-config.json');

    let userConfigPath;
    let legacyUserConfigPath;

    if (process.platform === 'win32') {
        userConfigPath = path.join(os.homedir(), 'AppData', 'Local', 'Lerian', 'mcp-config.json');
        legacyUserConfigPath = path.join(os.homedir(), 'AppData', 'Local', 'Midaz', 'mcp-config.json');
    } else if (process.platform === 'darwin') {
        userConfigPath = path.join(os.homedir(), 'Library', 'Application Support', 'Lerian', 'mcp-config.json');
        legacyUserConfigPath = path.join(os.homedir(), 'Library', 'Application Support', 'Midaz', 'mcp-config.json');
    } else {
        userConfigPath = path.join(os.homedir(), '.config', 'lerian', 'mcp-config.json');
        legacyUserConfigPath = path.join(os.homedir(), '.config', 'midaz', 'mcp-config.json');
    }

    return {
        local: localConfigPath,
        user: userConfigPath,
        legacyLocal: legacyLocalConfigPath,
        legacyUser: legacyUserConfigPath
    };
}

// Start the CLI
mainMenu(); 
