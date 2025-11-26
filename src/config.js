/**
 * Configuration management for the Lerian MCP server
 * Handles environment variables, config files, and default settings
 * DOCUMENTATION-ONLY MODE: Backend API configuration removed
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Default configuration for the Lerian MCP server
 * Documentation and learning resources only
 */
const defaultConfig = {
    server: {
        name: 'lerian-mcp-server',
        version: '4.0.0',
        description: 'Lerian MCP Server - Documentation and Learning Resources'
    },
    docsUrl: 'https://docs.lerian.studio', // Base URL for online documentation
    logLevel: 'info', // Default log level
    detailedLogs: false, // Detailed logging (disabled by default)
    consoleLogs: false, // Console logging (disabled by default)
};

// Config file locations to try (in order of preference)
const configLocations = [
    // Current working directory
    path.join(process.cwd(), 'midaz-mcp-config.json'),

    // User's home directory
    path.join(os.homedir(), '.midaz', 'mcp-config.json'),

    // User's config directory (platform specific)
    path.join(os.homedir(), '.config', 'midaz', 'mcp-config.json'),

    // Global config (platform specific)
    ...(process.platform === 'win32'
        ? [path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Midaz', 'mcp-config.json')]
        : ['/etc/midaz/mcp-config.json']),
];

/**
 * Parse command line arguments
 * @returns {Object} Config values from command line arguments
 */
function parseCommandLineArgs() {
    const args = process.argv.slice(2);
    const parsedArgs = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        // Handle --key=value format
        if (arg.startsWith('--') && arg.includes('=')) {
            const [key, value] = arg.substring(2).split('=');
            parsedArgs[key] = value;
            continue;
        }

        // Handle --key value format
        if (arg.startsWith('--') && i + 1 < args.length && !args[i + 1].startsWith('--')) {
            const key = arg.substring(2);
            const value = args[i + 1];
            parsedArgs[key] = value;
            i++; // Skip the next arg since we've used it as a value
            continue;
        }

        // Handle --flag format (boolean flags)
        if (arg.startsWith('--')) {
            const key = arg.substring(2);
            parsedArgs[key] = true;
        }
    }

    // Transform parsed arguments into config structure
    const configFromArgs = {};

    if (parsedArgs['log-level']) {
        configFromArgs.logLevel = parsedArgs['log-level'];
    }

    if (parsedArgs['detailed-logs'] !== undefined) {
        configFromArgs.detailedLogs = parsedArgs['detailed-logs'] === 'true' || parsedArgs['detailed-logs'] === true;
    }

    if (parsedArgs['console-logs'] !== undefined) {
        configFromArgs.consoleLogs = parsedArgs['console-logs'] === 'true' || parsedArgs['console-logs'] === true;
    }

    if (parsedArgs['config-file']) {
        // This doesn't directly affect the config object,
        // but will be used to load configuration from a specific file
        configFromArgs._configFile = parsedArgs['config-file'];
    }

    return configFromArgs;
}


/**
 * Load configuration from the first available config file
 * or return default config if no config file is found
 */
async function loadConfig() {
    let loadedConfig = null;
    let configSource = 'default';

    // Parse command line arguments first (highest priority)
    const argsConfig = parseCommandLineArgs();

    // If a specific config file is provided via command line, try to load it
    if (argsConfig._configFile) {
        try {
            // Validate config path to prevent path traversal attacks
            validateConfigPath(argsConfig._configFile);

            if (fs.existsSync(argsConfig._configFile)) {
                const fileContent = fs.readFileSync(argsConfig._configFile, 'utf8');
                const fileConfig = JSON.parse(fileContent);

                loadedConfig = {
                    ...defaultConfig,
                    ...fileConfig,
                    ...argsConfig, // Command line args override file config
                    _source: argsConfig._configFile,
                };

                configSource = argsConfig._configFile;

                // Remove the internal _configFile property
                delete loadedConfig._configFile;
                return loadedConfig;
            }
        } catch (err) {
            // Error loading config file (silent for MCP protocol)
        }
    }

    // Try to load from environment variables next
    const envConfig = {
        ...(process.env.LERIAN_LOG_LEVEL && { logLevel: process.env.LERIAN_LOG_LEVEL }),
        ...(process.env.LERIAN_DETAILED_LOGS !== undefined && { detailedLogs: process.env.LERIAN_DETAILED_LOGS === 'true' }),
        ...(process.env.LERIAN_CONSOLE_LOGS !== undefined && { consoleLogs: process.env.LERIAN_CONSOLE_LOGS === 'true' }),
        // Backward compatibility with MIDAZ_ prefix
        ...(process.env.MIDAZ_LOG_LEVEL && { logLevel: process.env.MIDAZ_LOG_LEVEL }),
    };

    // Only use environment config if at least one value is set
    const hasEnvConfig = Object.keys(envConfig).length > 0;

    if (hasEnvConfig) {
        loadedConfig = {
            ...defaultConfig,
            ...envConfig,
            ...argsConfig, // Command line args override environment variables
            _source: 'environment',
        };
        configSource = 'environment';
    }

    // If no config from env vars or a specific file, try to load from config files
    if (!loadedConfig) {
        for (const configPath of configLocations) {
            try {
                if (fs.existsSync(configPath)) {
                    const fileContent = fs.readFileSync(configPath, 'utf8');
                    const fileConfig = JSON.parse(fileContent);

                    loadedConfig = {
                        ...defaultConfig,
                        ...fileConfig,
                        ...argsConfig, // Command line args override file config
                        _source: configPath,
                    };

                    configSource = configPath;
                    break;
                }
            } catch (err) {
                // Continue to next config location on error
                // Error loading config from path (silent for MCP protocol)
            }
        }
    }

    // Fall back to default config if nothing was loaded
    if (!loadedConfig) {
        loadedConfig = {
            ...defaultConfig,
            ...argsConfig, // Apply any command line args over defaults
            _source: 'default',
        };
    }

    // Remove the internal _configFile property if it exists
    if (loadedConfig._configFile) {
        delete loadedConfig._configFile;
    }

    return loadedConfig;
}

// Export the loadConfig function and a promise for the loaded config
export const configPromise = loadConfig();
export { loadConfig };

// For backward compatibility, export a default that will be resolved
/**
 * Validate config file path to prevent path traversal attacks
 */
function validateConfigPath(configPath) {
    if (!configPath || typeof configPath !== 'string') {
        return true;
    }

    // Sanitize input to prevent path traversal
    const sanitizedPath = configPath.replace(/\.\./g, '').replace(/\/\//g, '/');
    const resolvedPath = path.resolve(sanitizedPath);
    const allowedDirs = [process.cwd(), '/etc/lerian', '/etc/midaz']; // backward compatibility
    const isAllowed = allowedDirs.some(dir => resolvedPath.startsWith(path.resolve(dir)));

    if (!isAllowed) {
        throw new Error(`Config path not allowed: ${configPath}`);
    }

    return true;
}

export default await configPromise; 