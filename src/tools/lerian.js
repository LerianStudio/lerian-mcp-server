/**
 * Unified Lerian Tool - Single tool for all Lerian products
 * Consolidates documentation, learning, and SDK generation across all products
 * Products: midaz, tracer, flowker, reporter, (+ more to be added)
 */

import { z } from "zod";
import { wrapToolHandler, validateArgs } from "../util/mcp-helpers.js";
import { createLogger } from "../util/mcp-logging.js";

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

// Product configurations
const PRODUCTS = {
  midaz: {
    name: 'Midaz',
    description: 'Financial ledger system with double-entry accounting',
    docsPath: '/midaz',
    categories: ['transactions', 'ledgers', 'accounts', 'portfolios', 'organizations'],
    sdkLanguages: ['go', 'typescript', 'javascript']
  },
  tracer: {
    name: 'Tracer',
    description: 'Observability and tracing platform',
    docsPath: '/tracer',
    categories: ['tracing', 'monitoring', 'spans', 'logs'],
    sdkLanguages: ['go', 'typescript', 'javascript']
  },
  flowker: {
    name: 'Flowker',
    description: 'Workflow orchestration engine',
    docsPath: '/flowker',
    categories: ['workflows', 'tasks', 'scheduling', 'automation'],
    sdkLanguages: ['go', 'typescript', 'javascript']
  },
  reporter: {
    name: 'Reporter',
    description: 'Reporting and analytics platform',
    docsPath: '/reporter',
    categories: ['reports', 'analytics', 'dashboards', 'metrics'],
    sdkLanguages: ['go', 'typescript', 'javascript']
  }
};

/**
 * Register unified Lerian tool
 */
export const registerLerianTool = (server) => {
  server.tool(
    "lerian",
    "Unified tool for ALL Lerian products (midaz, tracer, flowker, reporter). Access documentation, learning resources, and SDK code generation for any product. Use product='all' to search across all products. Operations: 'docs' (documentation), 'learn' (tutorials), 'sdk' (code generation), 'search' (cross-product search).",
    {
      product: z.enum(['midaz', 'tracer', 'flowker', 'reporter', 'all'])
        .describe("Target Lerian product (REQUIRED). 'midaz': financial ledger, 'tracer': observability, 'flowker': workflows, 'reporter': analytics, 'all': search across all products."),

      operation: z.enum(['docs', 'learn', 'sdk', 'search'])
        .describe("Operation type (REQUIRED). 'docs': get documentation, 'learn': interactive tutorials and learning paths, 'sdk': generate SDK code, 'search': search documentation and examples."),

      // Common parameters
      topic: z.string().optional()
        .describe("Topic or subject matter, 5-200 characters (REQUIRED for: docs, learn, search). Examples: 'getting-started', 'authentication', 'transactions', 'error-handling', 'workflows'. Be specific about what you want to learn or find."),

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
        product: z.enum(['midaz', 'tracer', 'flowker', 'reporter', 'all']),
        operation: z.enum(['docs', 'learn', 'sdk', 'search']),
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
        if (product !== 'all' && !PRODUCTS[product]) {
          throw new Error(`Unknown product: ${product}. Available: ${Object.keys(PRODUCTS).join(', ')}`);
        }

        // Route by operation
        switch (operation) {
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
    })
  );

  logger.info('✅ Unified Lerian tool registered (docs + learn + sdk for all products)');
};

// ======================
// Operation Handlers
// ======================

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
      const productConfig = PRODUCTS[product];
      resources = await getAvailableResources();
      // Filter by product path
      resources = resources.filter(r =>
        r.path?.includes(productConfig.docsPath) ||
        r.url?.includes(productConfig.docsPath) ||
        r.category === product
      );
    }

    // Search within product resources
    const searchResults = resources.filter(r => {
      const searchText = `${r.title} ${r.description} ${r.name} ${r.path}`.toLowerCase();
      return searchText.includes(topic.toLowerCase());
    });

    if (searchResults.length === 0) {
      return {
        product: product === 'all' ? 'all products' : PRODUCTS[product].name,
        topic,
        found: false,
        message: `No documentation found for topic: ${topic}`,
        suggestions: product !== 'all'
          ? [`Try searching in product categories: ${PRODUCTS[product].categories.join(', ')}`]
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
      product: product === 'all' ? 'all products' : PRODUCTS[product].name,
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
      ? { name: 'All Lerian Products', categories: Object.values(PRODUCTS).flatMap(p => p.categories) }
      : PRODUCTS[product];

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

    const productConfig = PRODUCTS[product];

    // Verify SDK language is supported for this product
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
    // Search across all resources or product-specific
    let searchResults;

    if (product === 'all') {
      searchResults = await searchResources(query);
    } else {
      const allResources = await getAvailableResources();
      const productConfig = PRODUCTS[product];

      // Filter by product first, then search
      const productResources = allResources.filter(r =>
        r.path?.includes(productConfig.docsPath) ||
        r.url?.includes(productConfig.docsPath) ||
        r.category === product
      );

      // Simple keyword search within product resources
      searchResults = productResources.filter(r => {
        const searchText = `${r.title} ${r.description} ${r.name} ${r.path}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
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
      product: product === 'all' ? 'all products' : PRODUCTS[product].name,
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
  const productName = product === 'all' ? 'Lerian Products' : PRODUCTS[product].name;

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
      `Introduction to ${product === 'all' ? 'Lerian ecosystem' : PRODUCTS[product].name}`,
      'Basic API concepts'
    ];
  }

  if (experienceLevel === 'intermediate') {
    return [
      ...common,
      `Working knowledge of ${product === 'all' ? 'Lerian products' : PRODUCTS[product].name}`,
      'Experience with REST APIs'
    ];
  }

  return [
    ...common,
    `Advanced understanding of ${product === 'all' ? 'Lerian architecture' : PRODUCTS[product].name}`,
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
      content: `Detailed content for step ${i} of ${topic}`,
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
      code: `// Example code for ${topic}\n// This would contain actual implementation`
    },
    {
      title: `Practical ${topic} use case`,
      description: `Real-world application of ${topic}`,
      code: `// Production-ready example\n// This would contain actual implementation`
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
  const productConfig = PRODUCTS[product];

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
\t"log"
\t"os"

\t${comment}Import ${productConfig.name} SDK
\tclient "github.com/LerianStudio/${product}-sdk-golang"
\t"github.com/LerianStudio/${product}-sdk-golang/pkg/config"
)

func main() {
\t${includeComments ? `// Initialize ${productConfig.name} client` : ''}
\tcfg, err := config.NewConfig(
\t\tconfig.WithAPIKey(os.Getenv("${product.toUpperCase()}_API_KEY")),
\t)
\tif err != nil {
\t\tlog.Fatalf("Failed to create config: %v", err)
\t}

\tc, err := client.New(
\t\tclient.WithConfig(cfg),
\t)
\tif err != nil {
\t\tlog.Fatalf("Failed to create client: %v", err)
\t}
\tdefer c.Shutdown(context.Background())

\t${includeComments ? `// Implement ${useCase}` : ''}
\tctx := context.Background()
\t${comment}Your implementation here

\tlog.Println("${productConfig.name} client initialized successfully")
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
\t\t${comment}Your implementation here

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
