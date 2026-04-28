/**
 * Unified Lerian Tool - Single tool for all Lerian products
 * Consolidates documentation, learning, and SDK generation across all products
 * Products: midaz, fetcher, reporter, matcher, tracer, underwriter, flowker
 */

import { z } from "zod";
import { wrapToolHandler, validateArgs } from "../util/mcp-helpers.js";
import { registerMcpTool, TOOL_ANNOTATIONS } from "../util/mcp-registration.js";
import { createLogger } from "../util/mcp-logging.js";
import { PRODUCT_IDS, getProductConfig, listProducts, isResourceForProduct } from "../catalog/product-registry.js";
import { getRuntimeSurface } from '../runtime/surface-registry.js';

// Import all existing utilities
import {
  getAvailableResources,
  searchResources,
  getResourcesByCategory
} from "../util/docs-manifest.js";
import { fetchDocumentation } from "../util/docs-fetcher.js";
import {
  extractBestPractices,
  extractArchitectureOverview,
  formatBestPractices,
  generateSDKDocumentation
} from "../util/docs-helpers.js";
import {
  generateContextualExamples,
  generateWorkflowDocumentation
} from "../util/docs-examples.js";

const logger = createLogger('lerian');

const OPERATIONS = ['discover', 'docs', 'learn', 'sdk', 'search'];

/**
 * Register unified Lerian tool
 */
export const registerLerianTool = (server) => {
  registerMcpTool(
    server,
    "lerian",
    "Unified portfolio tool for Lerian products. Discover supported products and current MCP coverage, access documentation and learning resources, generate SDK examples, and search across the portfolio. Live API execution is available through product-specific tools for Midaz, Fetcher, Reporter, Matcher, Tracer, Flowker, and Underwriter, with cross-product workflow support available via portfolio-workflow.",
    {
      product: z.enum(PRODUCT_IDS)
        .describe("Target Lerian product (REQUIRED). Use 'all' for portfolio-wide discovery and search. Supported products: midaz, reporter, fetcher, matcher, tracer, underwriter, flowker, all."),

      operation: z.enum(OPERATIONS)
        .describe("Operation type (REQUIRED). 'discover': inspect portfolio products and current MCP coverage, 'docs': get documentation, 'learn': interactive tutorials and learning paths, 'sdk': generate SDK code, 'search': search documentation and examples."),

      // Common parameters
      topic: z.string().optional()
        .describe("Topic or subject matter, 5-200 characters (REQUIRED for: docs, learn, search). Examples: 'getting-started', 'authentication', 'transactions', 'templates', 'rules', 'workflows'. Be specific about what you want to learn or find."),

      // SDK-specific parameters
      language: z.enum(['go', 'typescript', 'javascript']).optional()
        .describe("Programming language (REQUIRED for: sdk operation). 'go': backend services, high performance, 'typescript': type-safe development, 'javascript': Node.js and web. Check product.sdkLanguages for available options."),

      useCase: z.string().optional()
        .describe("Specific use case for SDK code generation, 10-200 characters (REQUIRED for: sdk operation). Examples: 'create first transaction', 'setup authentication', 'handle errors', 'build workflow', 'generate report'. Be specific about implementation scenario."),

      // Learning-specific parameters
      experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner')
        .describe("Your experience level with the product (for: learn operation). 'beginner': new to product, 'intermediate': basic understanding, 'advanced': production experience. Affects tutorial depth and complexity."),

      // Documentation-specific parameters
      format: z.enum(['summary', 'detailed', 'examples-only']).default('detailed')
        .describe("Response detail level. 'summary': brief overview (~200 chars), 'detailed': comprehensive with examples, 'examples-only': code samples only. Default: 'detailed'."),

      includeExamples: z.boolean().default(true)
        .describe("Include code examples in documentation responses. Default: true. Set false for text-only documentation."),

      // Search parameters
      maxResults: z.number().min(1).max(50).default(10)
        .describe("Maximum search results to return (for: search operation). Range: 1-50, default: 10. Use lower numbers (1-5) for focused results, higher (10-20) for exploration.")
    },

    wrapToolHandler(async (args, extra) => {
      const {
        product,
        operation,
        topic,
        language,
        useCase,
        experienceLevel = 'beginner',
        format = 'detailed',
        includeExamples = true,
        maxResults = 10
      } = validateArgs(args, z.object({
        product: z.enum(PRODUCT_IDS),
        operation: z.enum(OPERATIONS),
        topic: z.string().optional(),
        language: z.enum(['go', 'typescript', 'javascript']).optional(),
        useCase: z.string().optional(),
        experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
        format: z.enum(['summary', 'detailed', 'examples-only']).default('detailed'),
        includeExamples: z.boolean().default(true),
        maxResults: z.number().min(1).max(50).default(10)
      }));

      logger.info('Processing unified Lerian request', {
        product,
        operation,
        topic,
        language,
        experienceLevel
      });

      try {
        // Validate product-specific requirements
        if (product !== 'all' && !getProductConfig(product)) {
          throw new Error(`Unknown product: ${product}. Available: ${PRODUCT_IDS.join(', ')}`);
        }

        // Route by operation
        switch (operation) {
          case 'discover':
            return await handleDiscover(product);

          case 'docs':
            if (!topic) throw new Error("topic parameter required for docs operation");
            return await handleDocs(product, topic, format, includeExamples);

          case 'learn':
            if (!topic) throw new Error("topic parameter required for learn operation");
            return await handleLearn(product, topic, experienceLevel, format);

          case 'sdk':
            if (!language) throw new Error("language parameter required for sdk operation");
            if (!useCase) throw new Error("useCase parameter required for sdk operation");
            return await handleSDK(product, language, useCase, includeExamples);

          case 'search':
            if (!topic) throw new Error("topic parameter required for search operation");
            return await handleSearch(product, topic, maxResults, format);

          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
      } catch (error) {
        logger.error('Error in unified Lerian tool', {
          product,
          operation,
          error: error.message
        });
        throw error;
      }
    }),
    { annotations: TOOL_ANNOTATIONS.READ_ONLY }
  );

  logger.info('✅ Unified Lerian tool registered (discover + docs + learn + sdk + search for the Lerian portfolio)');
};

// ======================
// Operation Handlers
// ======================

/**
 * Handle portfolio discovery requests
 */
async function handleDiscover(product) {
  const allProducts = listProducts();

  if (product === 'all') {
    const surface = getRuntimeSurface();
    const liveProductNames = surface.liveProducts.map((item) => item.name).join(', ');

    return {
      portfolio: 'Lerian',
      currentRuntimeTools: surface.tools.map((tool) => tool.name),
      lerianOperations: OPERATIONS,
      workflows: surface.workflows,
      products: allProducts.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        repoPath: item.repoPath,
        sdkLanguages: item.sdkLanguages,
        primaryWorkflows: item.primaryWorkflows,
        currentMcpSupport: item.currentMcpSupport,
        targetMcpSupport: item.targetMcpSupport
      })),
      notes: [
        'The current runtime is portfolio-aware and documentation-rich across the full Lerian surface.',
        `Live API access is currently available for ${liveProductNames} via product-specific tools.`,
        'Cross-product workflow support includes fetcher-to-reporter and matcher-to-fetcher-to-midaz in portfolio-workflow, with stateful workflow sessions now available.',
        'The revamp direction now shifts from first adapters to deeper typed control-plane operations and richer cross-product workflows.'
      ],
      recommendedNextSteps: [
        'Use lerian with operation="docs" or "search" for product-level knowledge lookup.',
        'Use lerian with a specific product and operation="discover" for a deeper per-product summary.',
        'Use portfolio-workflow to inspect or execute the fetcher-to-reporter and matcher-to-fetcher-to-midaz cross-product workflows.',
        'Use the matching `*-discover` tool before the matching `*-execute` tool when you need live API access.'
      ]
    };
  }

  const productConfig = getProductConfig(product);

  return {
    id: productConfig.id,
    product: productConfig.name,
    description: productConfig.description,
    repoPath: productConfig.repoPath,
    sdkLanguages: productConfig.sdkLanguages,
    primaryWorkflows: productConfig.primaryWorkflows,
    currentMcpSupport: productConfig.currentMcpSupport,
    targetMcpSupport: productConfig.targetMcpSupport,
    recommendedNextSteps: product === 'midaz'
      ? [
          'Use lerian operation="docs" or "search" for conceptual guidance.',
          'Use midaz-discover to inspect resources, actions, and schemas.',
          'Use midaz-execute only after confirming the resource/action contract via midaz-discover.'
        ]
      : product === 'fetcher'
        ? [
            'Use lerian operation="docs" or "search" for conceptual guidance.',
            'Use fetcher-discover to inspect connections, migration actions, and fetcher job contracts.',
            'Use fetcher-execute only after confirming the required organizationId/productName context via fetcher-discover.'
          ]
      : product === 'reporter'
        ? [
            'Use lerian operation="docs" or "search" for conceptual guidance.',
            'Use reporter-discover to inspect templates, reports, deadlines, data sources, metrics, and operational endpoints.',
            'Use reporter-execute after checking multipart requirements for template upload/update and binary download behavior for reports.'
          ]
      : product === 'tracer'
        ? [
            'Use lerian operation="docs" or "search" for conceptual guidance.',
            'Use tracer-discover to inspect rules, limits, validations, audit-events, and operational endpoints.',
            'Use tracer-execute after checking the validation payload or rule/limit transition contract and ensuring TRACER_API_KEY is configured.'
          ]
      : product === 'matcher'
        ? [
            'Use lerian operation="docs" or "search" for conceptual guidance.',
            'Use matcher-discover to inspect contexts, sources, field maps, discovery-over-Fetcher endpoints, matching, governance, reporting, and system operations.',
            'Use matcher-execute after checking the request contract and ensuring MATCHER_AUTH_TOKEN is configured.',
            'Use portfolio-workflow for the matcher-to-fetcher-to-midaz guided path.'
          ]
      : product === 'flowker'
        ? [
            'Use lerian operation="docs" or "search" for conceptual guidance.',
            'Use flowker-discover to inspect catalog resources, workflow definitions, execution start requirements, provider and executor configuration payloads, observability endpoints, and webhook behavior.',
            'Use flowker-execute after checking auth expectations and providing Idempotency-Key for workflow execution start when required.'
          ]
      : product === 'underwriter'
        ? [
            'Use lerian operation="docs" or "search" for conceptual guidance.',
            'Use underwriter-discover to inspect public jurisdictions, protected loan-product lifecycle actions, schedule preview payloads, and the mounted example endpoints.',
            'Use underwriter-execute after checking bearer-auth requirements for protected routes and the decimal-string contract for schedule preview.'
          ]
      : [
          'Use lerian operation="docs" or "search" to inspect available portfolio knowledge for this product.',
          'Use lerian operation="learn" for guided learning paths and examples.',
          'Use help-me-start or help-with-api to inspect the current runtime tool surface.'
        ]
  };
}

/**
 * Handle documentation requests
 */
async function handleDocs(product, topic, format, includeExamples) {
  try {
    // Get product-specific or all resources
    let resources;
    if (product === 'all') {
      resources = await getAvailableResources();
    } else {
      const productConfig = getProductConfig(product);
      resources = await getAvailableResources();
      resources = resources.filter((resource) => isResourceForProduct(resource, productConfig));
    }

    // Search within product resources
    const searchResults = resources.filter(r => {
      const searchText = `${r.title} ${r.description} ${r.name} ${r.path}`.toLowerCase();
      return searchText.includes(topic.toLowerCase());
    });

    if (searchResults.length === 0) {
      return {
        product: product === 'all' ? 'all products' : getProductConfig(product).name,
        topic,
        found: false,
        message: `No documentation found for topic: ${topic}`,
        suggestions: product !== 'all'
          ? [`Try searching in product categories: ${getProductConfig(product).categories.join(', ')}`]
          : ['Try specifying a specific product instead of "all"']
      };
    }

    // Fetch content for top results
    const topResults = searchResults.slice(0, 5);
    const contentResults = await Promise.all(
      topResults.map(async (resource) => {
        try {
          const content = await fetchDocumentation(resource.path || resource.url);
          return {
            title: resource.title,
            path: resource.path,
            category: resource.category,
            content: formatContent(content, format, includeExamples)
          };
        } catch (error) {
          return {
            title: resource.title,
            path: resource.path,
            category: resource.category,
            error: `Failed to fetch content: ${error.message}`
          };
        }
      })
    );

    return {
      product: product === 'all' ? 'all products' : getProductConfig(product).name,
      topic,
      found: true,
      totalResults: searchResults.length,
      results: contentResults,
      format
    };
  } catch (error) {
    throw new Error(`Failed to get documentation: ${error.message}`);
  }
}

/**
 * Handle learning/tutorial requests
 */
async function handleLearn(product, topic, experienceLevel, format) {
  try {
    const productInfo = product === 'all'
      ? { name: 'All Lerian Products', categories: listProducts().flatMap((item) => item.categories) }
      : getProductConfig(product);

    // Generate learning path based on topic and experience
    const learningContent = generateLearningContent(product, topic, experienceLevel);

    if (format === 'summary') {
      return {
        product: productInfo.name,
        topic,
        experienceLevel,
        summary: learningContent.summary
      };
    }

    return {
      product: productInfo.name,
      topic,
      experienceLevel,
      title: learningContent.title,
      description: learningContent.description,
      prerequisites: learningContent.prerequisites,
      steps: learningContent.steps,
      examples: learningContent.examples,
      nextSteps: learningContent.nextSteps,
      estimatedTime: learningContent.estimatedTime
    };
  } catch (error) {
    throw new Error(`Failed to generate learning content: ${error.message}`);
  }
}

/**
 * Handle SDK code generation
 */
async function handleSDK(product, language, useCase, includeComments) {
  try {
    if (product === 'all') {
      throw new Error("Cannot generate SDK code for 'all' products. Please specify a specific product.");
    }

    const productConfig = getProductConfig(product);

    // Verify SDK language is supported for this product
    if (productConfig.sdkLanguages.length === 0) {
      throw new Error(
        `${productConfig.name} SDK generation is not available in this MCP surface yet. ` +
        `Use ${product}-discover and ${product}-execute for live API operations.`
      );
    }

    if (!productConfig.sdkLanguages.includes(language)) {
      throw new Error(
        `${language} SDK not available for ${productConfig.name}. ` +
        `Supported languages: ${productConfig.sdkLanguages.join(', ')}`
      );
    }

    // Generate product-specific SDK code
    const sdkCode = generateProductSDKCode(product, language, useCase, includeComments);

    return {
      product: productConfig.name,
      language,
      useCase,
      generated: true,
      code: sdkCode.code,
      title: sdkCode.title,
      description: sdkCode.description,
      dependencies: sdkCode.dependencies,
      setupInstructions: sdkCode.setupInstructions,
      runInstructions: sdkCode.runInstructions,
      bestPractices: sdkCode.bestPractices
    };
  } catch (error) {
    throw new Error(`Failed to generate SDK code: ${error.message}`);
  }
}

/**
 * Handle cross-product search
 */
async function handleSearch(product, query, maxResults, format) {
  try {
    const normalizedQuery = String(query ?? '').toLowerCase();
    // Search across all resources or product-specific
    let searchResults;

    if (product === 'all') {
      searchResults = await searchResources(query);
    } else {
      const allResources = await getAvailableResources();
      const productConfig = getProductConfig(product);

      // Filter by product first, then search
      const productResources = allResources.filter((resource) => isResourceForProduct(resource, productConfig));

      // Simple keyword search within product resources
      searchResults = productResources.filter(r => {
        const searchText = `${r.title} ${r.description} ${r.name} ${r.path}`.toLowerCase();
        return searchText.includes(normalizedQuery);
      });
    }

    // Limit results
    const limitedResults = searchResults.slice(0, maxResults);

    // Format results based on format parameter
    const formattedResults = limitedResults.map(result => {
      if (format === 'summary') {
        return {
          title: result.title,
          path: result.path,
          category: result.category,
          summary: result.description?.substring(0, 200) || 'No description available'
        };
      }
      return {
        title: result.title,
        path: result.path,
        url: result.url,
        category: result.category,
        description: result.description,
        name: result.name
      };
    });

    return {
      product: product === 'all' ? 'all products' : getProductConfig(product).name,
      query,
      totalResults: searchResults.length,
      returnedResults: limitedResults.length,
      results: formattedResults,
      format
    };
  } catch (error) {
    throw new Error(`Failed to search: ${error.message}`);
  }
}

// ======================
// Helper Functions
// ======================

/**
 * Format content based on format preference
 */
function formatContent(content, format, includeExamples) {
  if (format === 'summary') {
    return content.substring(0, 200) + (content.length > 200 ? '...' : '');
  }

  if (format === 'examples-only') {
    // Extract code blocks
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    return {
      examples: codeBlocks.map(block => block.replace(/```[\w]*\n?/g, '').replace(/```$/g, ''))
    };
  }

  if (!includeExamples) {
    // Remove code blocks
    return content.replace(/```[\s\S]*?```/g, '');
  }

  return content;
}

/**
 * Generate learning content for a topic
 */
function generateLearningContent(product, topic, experienceLevel) {
  const productName = product === 'all' ? 'Lerian Products' : getProductConfig(product).name;

  // Base content structure
  const baseContent = {
    title: `Learning ${topic} in ${productName}`,
    description: `Comprehensive guide to ${topic} for ${experienceLevel} users`,
    prerequisites: generatePrerequisites(product, topic, experienceLevel),
    steps: generateLearningSteps(product, topic, experienceLevel),
    examples: generateLearningExamples(product, topic, experienceLevel),
    nextSteps: generateNextSteps(product, topic, experienceLevel),
    estimatedTime: calculateEstimatedTime(experienceLevel),
    summary: `Learn ${topic} in ${productName} with step-by-step guidance for ${experienceLevel} users`
  };

  return baseContent;
}

/**
 * Generate prerequisites based on experience level
 */
function generatePrerequisites(product, topic, experienceLevel) {
  const common = [
    'Basic understanding of the problem domain',
    'Development environment setup'
  ];

  if (experienceLevel === 'beginner') {
    return [
      ...common,
      `Introduction to ${product === 'all' ? 'Lerian ecosystem' : getProductConfig(product).name}`,
      'Basic API concepts'
    ];
  }

  if (experienceLevel === 'intermediate') {
    return [
      ...common,
      `Working knowledge of ${product === 'all' ? 'Lerian products' : getProductConfig(product).name}`,
      'Experience with REST APIs'
    ];
  }

  return [
    ...common,
    `Advanced understanding of ${product === 'all' ? 'Lerian architecture' : getProductConfig(product).name}`,
    'Production deployment experience'
  ];
}

/**
 * Generate learning steps
 */
function generateLearningSteps(product, topic, experienceLevel) {
  const stepCount = experienceLevel === 'beginner' ? 5 : experienceLevel === 'intermediate' ? 4 : 3;
  const steps = [];

  for (let i = 1; i <= stepCount; i++) {
    steps.push({
      step: i,
      title: `Step ${i}: ${getStepTitle(product, topic, experienceLevel, i)}`,
      content: `Study the ${topic} contract, identify required inputs, then verify behavior with the relevant discover tool before executing live operations.`,
      duration: `${5 * i} minutes`,
      checkpoint: `You should be able to ${getCheckpoint(product, topic, i)}`
    });
  }

  return steps;
}

/**
 * Get step title based on context
 */
function getStepTitle(product, topic, experienceLevel, stepNumber) {
  const titles = {
    1: `Understanding ${topic} basics`,
    2: `Setting up your environment`,
    3: `Implementing ${topic}`,
    4: `Testing and validation`,
    5: `Deployment and monitoring`
  };
  return titles[stepNumber] || `Working with ${topic}`;
}

/**
 * Get checkpoint description
 */
function getCheckpoint(product, topic, stepNumber) {
  const checkpoints = {
    1: `understand the core concepts of ${topic}`,
    2: `have your development environment ready`,
    3: `implement basic ${topic} functionality`,
    4: `test your implementation thoroughly`,
    5: `deploy and monitor in production`
  };
  return checkpoints[stepNumber] || `complete this step successfully`;
}

/**
 * Generate learning examples
 */
function generateLearningExamples(product, topic, experienceLevel) {
  return [
    {
      title: `Basic ${topic} example`,
      description: `Simple introduction to ${topic}`,
      code: `// Inspect the action contract before executing live operations.\n// Example: call <product>-discover with intent="describe-action" for ${topic}.`
    },
    {
      title: `Practical ${topic} use case`,
      description: `Real-world application of ${topic}`,
      code: `// Production flow: discover contract -> validate inputs -> execute with explicit mutation confirmation when required.`
    }
  ];
}

/**
 * Generate next steps
 */
function generateNextSteps(product, topic, experienceLevel) {
  if (experienceLevel === 'beginner') {
    return [
      'Practice with more examples',
      'Explore related topics',
      'Join the community forums'
    ];
  }

  if (experienceLevel === 'intermediate') {
    return [
      'Implement advanced patterns',
      'Optimize for production',
      'Contribute to documentation'
    ];
  }

  return [
    'Design custom solutions',
    'Mentor other developers',
    'Contribute to the project'
  ];
}

/**
 * Calculate estimated time
 */
function calculateEstimatedTime(experienceLevel) {
  const times = {
    beginner: '30-45 minutes',
    intermediate: '20-30 minutes',
    advanced: '10-15 minutes'
  };
  return times[experienceLevel] || '30 minutes';
}

/**
 * Generate product-specific SDK code
 */
function generateProductSDKCode(product, language, useCase, includeComments) {
  const productConfig = getProductConfig(product);

  // Generate based on product and language
  if (language === 'go') {
    return generateGoSDK(product, productConfig, useCase, includeComments);
  } else if (language === 'typescript' || language === 'javascript') {
    return generateTypeScriptSDK(product, productConfig, useCase, includeComments, language);
  }

  throw new Error(`Unsupported language: ${language}`);
}

/**
 * Generate Go SDK code
 */
function generateGoSDK(product, productConfig, useCase, includeComments) {
  const comment = includeComments ? '// ' : '';

  return {
    title: `${productConfig.name} Go SDK - ${useCase}`,
    description: `Go implementation for ${useCase} using ${productConfig.name} SDK`,
    code: `package main

import (
\t"context"
\t"fmt"
\t"os"

\t${comment}Import ${productConfig.name} SDK
\tclient "github.com/LerianStudio/${product}-sdk-golang"
\t"github.com/LerianStudio/${product}-sdk-golang/pkg/config"
)

func main() {
\tif err := run(context.Background()); err != nil {
\t\tfmt.Fprintln(os.Stderr, err)
\t\tos.Exit(1)
\t}
}

func run(ctx context.Context) error {
\t${includeComments ? `// Initialize ${productConfig.name} client` : ''}
\tcfg, err := config.NewConfig(
\t\tconfig.WithAPIKey(os.Getenv("${product.toUpperCase()}_API_KEY")),
\t)
\tif err != nil {
\t\treturn err
\t}

\tc, err := client.New(
\t\tclient.WithConfig(cfg),
\t)
\tif err != nil {
\t\treturn err
\t}
\tdefer c.Shutdown(ctx)

\t${includeComments ? `// Implement ${useCase}` : ''}
\t${comment}Call the SDK method that matches the discovered ${productConfig.name} API contract.

\treturn nil
}`,
    dependencies: [
      `github.com/LerianStudio/${product}-sdk-golang`
    ],
    setupInstructions: [
      `Install SDK: go get github.com/LerianStudio/${product}-sdk-golang`,
      `Set environment variable: export ${product.toUpperCase()}_API_KEY="your-api-key"`
    ],
    runInstructions: [
      'Run with: go run main.go'
    ],
    bestPractices: [
      'Always handle errors explicitly',
      'Use context for timeout control',
      'Defer client shutdown for proper cleanup',
      'Store API keys in environment variables'
    ]
  };
}

/**
 * Generate TypeScript/JavaScript SDK code
 */
function generateTypeScriptSDK(product, productConfig, useCase, includeComments, language) {
  const comment = includeComments ? '// ' : '';
  const isTypeScript = language === 'typescript';

  return {
    title: `${productConfig.name} ${isTypeScript ? 'TypeScript' : 'JavaScript'} SDK - ${useCase}`,
    description: `${isTypeScript ? 'TypeScript' : 'JavaScript'} implementation for ${useCase} using ${productConfig.name} SDK`,
    code: `${isTypeScript ? "import { createClient } from '@lerianstudio/" + product + "-sdk';" : "const { createClient } = require('@lerianstudio/" + product + "-sdk');"}
${includeComments ? '// Load environment variables' : ''}
${isTypeScript ? "import * as dotenv from 'dotenv';" : "const dotenv = require('dotenv');"}
dotenv.config();

async function main()${isTypeScript ? ': Promise<void>' : ''} {
\t${includeComments ? `// Initialize ${productConfig.name} client` : ''}
\tconst client = createClient({
\t\tapiKey: process.env.${product.toUpperCase()}_API_KEY${isTypeScript ? '!' : ''},
\t\tenvironment: 'sandbox',
\t\tapiVersion: 'v1'
\t});

\ttry {
\t\t${includeComments ? `// Implement ${useCase}` : ''}
\t\t${comment}Call the SDK method that matches the discovered ${productConfig.name} API contract.

\t\tconsole.log('${productConfig.name} client initialized successfully');
\t} catch (error) {
\t\tconsole.error('Error:', error);
\t} finally {
\t\t${includeComments ? '// Clean up resources' : ''}
\t\tclient.close();
\t}
}

main().catch(console.error);`,
    dependencies: [
      `@lerianstudio/${product}-sdk`,
      'dotenv'
    ],
    setupInstructions: [
      `Install SDK: npm install @lerianstudio/${product}-sdk dotenv`,
      `Create .env file with: ${product.toUpperCase()}_API_KEY=your-api-key`
    ],
    runInstructions: [
      isTypeScript
        ? 'Run with: npx ts-node index.ts'
        : 'Run with: node index.js'
    ],
    bestPractices: [
      'Use environment variables for API keys',
      'Always close the client in finally block',
      'Implement proper error handling',
      'Use TypeScript for type safety in production'
    ]
  };
}
