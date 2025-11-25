import { z } from "zod";
import api from "../util/api.js";
import config from "../config.js";
import {
    createPaginatedResponse,
    wrapToolHandler,
    validateArgs,
    logToolInvocation,
    createErrorResponse,
    ErrorCodes
} from "../util/mcp-helpers.js";

// Sample data for when real API is not available
const sampleTransactions = [
    {
        id: "00000000-0000-0000-0000-000000000001",
        description: "Monthly Salary",
        template: "deposit",
        status: {
            code: "COMPLETED",
            description: "Transaction completed successfully"
        },
        amount: 5000,
        amountScale: 2,
        assetCode: "USD",
        metadata: {},
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
    },
    {
        id: "00000000-0000-0000-0000-000000000002",
        description: "Rent Payment",
        template: "transfer",
        status: {
            code: "COMPLETED",
            description: "Transaction completed successfully"
        },
        amount: 1200,
        amountScale: 2,
        assetCode: "USD",
        metadata: {},
        createdAt: "2023-01-05T00:00:00Z",
        updatedAt: "2023-01-05T00:00:00Z",
    },
];

const sampleTransactionDetails = {
    id: "00000000-0000-0000-0000-000000000001",
    description: "Monthly Salary",
    template: "deposit",
    status: {
        code: "COMPLETED",
        description: "Transaction completed successfully",
    },
    amount: 5000,
    amountScale: 2,
    assetCode: "USD",
    chartOfAccountsGroupName: "Income",
    metadata: {},
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    operations: [
        {
            id: "11111111-1111-1111-1111-111111111111",
            description: "Income deposit",
            type: "credit",
            accountId: "22222222-2222-2222-2222-222222222222",
            accountAlias: "@savings",
            assetCode: "USD",
            amount: {
                value: 5000,
                scale: 2,
                asset: "USD",
            },
            status: {
                code: "COMPLETED",
                description: "Operation completed successfully"
            },
            metadata: {},
            createdAt: "2023-01-01T00:00:00Z",
            updatedAt: "2023-01-01T00:00:00Z",
        }
    ],
};

const sampleOperations = [
    {
        id: "11111111-1111-1111-1111-111111111111",
        description: "Income deposit",
        type: "credit",
        accountId: "22222222-2222-2222-2222-222222222222",
        accountAlias: "@savings",
        assetCode: "USD",
        amount: {
            value: 5000,
            scale: 2,
            asset: "USD",
        },
        status: {
            code: "COMPLETED",
            description: "Operation completed successfully"
        },
        metadata: {},
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-01T00:00:00Z",
    }
];

const sampleOperationDetails = {
    id: "11111111-1111-1111-1111-111111111111",
    transaction_id: "00000000-0000-0000-0000-000000000001",
    description: "Income deposit",
    type: "credit",
    accountId: "22222222-2222-2222-2222-222222222222",
    accountAlias: "@savings",
    assetCode: "USD",
    amount: {
        value: 5000,
        scale: 2,
        asset: "USD",
    },
    balance: {
        available: 3000,
        onHold: 0,
        scale: 2,
    },
    balanceAfter: {
        available: 8000,
        onHold: 0,
        scale: 2,
    },
    status: {
        code: "COMPLETED",
        description: "Operation completed successfully",
    },
    metadata: {},
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
};

/**
 * Register transaction-related tools with the MCP server
 * @param {import("@modelcontextprotocol/sdk/server/mcp.js").McpServer} server MCP server instance
 */
export const registerTransactionTools = (server) => {
    // List transactions tool
    server.tool(
        "list-transactions",
        "List transactions in a ledger with optional pagination",
        {
            organization_id: z.string().uuid().describe("Organization ID in UUID format"),
            ledger_id: z.string().uuid().describe("Ledger ID in UUID format"),
            account_id: z.string().uuid().optional().describe("Filter by account ID"),
            cursor: z.string().optional().describe("Pagination cursor for next page"),
            limit: z.number().optional().default(10).describe("Number of items to return (max 100)"),
            start_date: z.string().optional().describe("Filter by creation date (YYYY-MM-DD)"),
            end_date: z.string().optional().describe("Filter by creation date (YYYY-MM-DD)"),
            sort_order: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
            metadata: z.string().optional().describe("JSON string to filter transactions by metadata fields"),
        },
        wrapToolHandler(async (args, extra) => {
            logToolInvocation("list-transactions", args, extra);
            const validatedArgs = validateArgs(args, z.object({
                organization_id: z.string().uuid(),
                ledger_id: z.string().uuid(),
                account_id: z.string().uuid().optional(),
                cursor: z.string().optional(),
                limit: z.number().min(1).max(100).optional().default(10),
                start_date: z.string().optional(),
                end_date: z.string().optional(),
                sort_order: z.enum(["asc", "desc"]).optional(),
                metadata: z.string().optional()
            }));

            // Fail-closed: refuse to return stub data
            if (config.useStubs) {
                throw createErrorResponse(
                    ErrorCodes.RESOURCE_UNAVAILABLE,
                    'Financial data unavailable: Server is running in stub mode. Connect to real backend services to access financial data.'
                );
            }

            try {
                const response = await api.transactions.list(validatedArgs.organization_id, validatedArgs.ledger_id, {
                    account_id: validatedArgs.account_id,
                    limit: validatedArgs.limit,
                    start_date: validatedArgs.start_date,
                    end_date: validatedArgs.end_date,
                    sort_order: validatedArgs.sort_order,
                    cursor: validatedArgs.cursor,
                    metadata: validatedArgs.metadata
                });
                if (!response || !response.items) {
                    throw new Error('Backend service returned empty response');
                }

                const metadata = {
                    isStub: false,
                    dataSource: 'api',
                    timestamp: new Date().toISOString()
                };

                return createPaginatedResponse(response.items, validatedArgs, metadata);
            } catch (error) {
                // Fail-closed: refuse to return stub data
                throw createErrorResponse(
                    ErrorCodes.RESOURCE_UNAVAILABLE,
                    `Financial data unavailable: ${error.message}. Backend service may be down.`
                );
            }
        })
    );

    // Get transaction by ID tool
    server.tool(
        "get-transaction",
        "Get transaction details by ID",
        {
            organization_id: z.string().uuid().describe("Organization ID in UUID format"),
            ledger_id: z.string().uuid().describe("Ledger ID in UUID format"),
            id: z.string().uuid().describe("Transaction ID in UUID format"),
        },
        wrapToolHandler(async (args, extra) => {
            logToolInvocation("get-transaction", args, extra);
            const { organization_id, ledger_id, id } = validateArgs(args, z.object({
                organization_id: z.string().uuid(),
                ledger_id: z.string().uuid(),
                id: z.string().uuid()
            }));

            // Fail-closed: refuse to return stub data
            if (config.useStubs) {
                throw createErrorResponse(
                    ErrorCodes.RESOURCE_UNAVAILABLE,
                    'Financial data unavailable: Server is running in stub mode. Connect to real backend services to access financial data.'
                );
            }

            try {
                const response = await api.transactions.get(organization_id, ledger_id, id);
                if (!response) {
                    throw new Error('Backend service returned empty response');
                }

                return {
                    ...response,
                    organization_id,
                    ledger_id
                };
            } catch (error) {
                // Fail-closed: refuse to return stub data
                throw createErrorResponse(
                    ErrorCodes.RESOURCE_UNAVAILABLE,
                    `Financial data unavailable: ${error.message}. Backend service may be down.`
                );
            }
        })
    );

    // List operations for an account tool
    server.tool(
        "list-operations",
        "List operations for an account with optional pagination",
        {
            organization_id: z.string().uuid().describe("Organization ID in UUID format"),
            ledger_id: z.string().uuid().describe("Ledger ID in UUID format"),
            account_id: z.string().uuid().describe("Account ID in UUID format"),
            cursor: z.string().optional().describe("Pagination cursor for next page"),
            limit: z.number().optional().default(10).describe("Number of items to return (max 100)"),
        },
        wrapToolHandler(async (args, extra) => {
            logToolInvocation("list-operations", args, extra);
            const validatedArgs = validateArgs(args, z.object({
                organization_id: z.string().uuid(),
                ledger_id: z.string().uuid(),
                account_id: z.string().uuid(),
                cursor: z.string().optional(),
                limit: z.number().min(1).max(100).optional().default(10)
            }));

            // Fail-closed: refuse to return stub data
            if (config.useStubs) {
                throw createErrorResponse(
                    ErrorCodes.RESOURCE_UNAVAILABLE,
                    'Financial data unavailable: Server is running in stub mode. Connect to real backend services to access financial data.'
                );
            }

            try {
                const response = await api.operations.list(
                    validatedArgs.organization_id,
                    validatedArgs.ledger_id,
                    validatedArgs.account_id, {
                        limit: validatedArgs.limit,
                        cursor: validatedArgs.cursor
                    }
                );
                if (!response || !response.items) {
                    throw new Error('Backend service returned empty response');
                }

                const metadata = {
                    isStub: false,
                    dataSource: 'api',
                    timestamp: new Date().toISOString()
                };

                return createPaginatedResponse(response.items, validatedArgs, metadata);
            } catch (error) {
                // Fail-closed: refuse to return stub data
                throw createErrorResponse(
                    ErrorCodes.RESOURCE_UNAVAILABLE,
                    `Financial data unavailable: ${error.message}. Backend service may be down.`
                );
            }
        })
    );

    // Get operation by ID tool
    server.tool(
        "get-operation",
        "Get operation details by ID",
        {
            organization_id: z.string().uuid().describe("Organization ID in UUID format"),
            ledger_id: z.string().uuid().describe("Ledger ID in UUID format"),
            operation_id: z.string().uuid().describe("Operation ID in UUID format"),
            account_id: z.string().uuid().describe("Account ID in UUID format"),
        },
        wrapToolHandler(async (args, extra) => {
            logToolInvocation("get-operation", args, extra);
            const { organization_id, ledger_id, operation_id, account_id } = validateArgs(args, z.object({
                organization_id: z.string().uuid(),
                ledger_id: z.string().uuid(),
                operation_id: z.string().uuid(),
                account_id: z.string().uuid()
            }));

            // Fail-closed: refuse to return stub data
            if (config.useStubs) {
                throw createErrorResponse(
                    ErrorCodes.RESOURCE_UNAVAILABLE,
                    'Financial data unavailable: Server is running in stub mode. Connect to real backend services to access financial data.'
                );
            }

            try {
                const response = await api.operations.get(organization_id, ledger_id, account_id, operation_id);
                if (!response) {
                    throw new Error('Backend service returned empty response');
                }

                return {
                    ...response,
                    organization_id,
                    ledger_id,
                    account_id
                };
            } catch (error) {
                // Fail-closed: refuse to return stub data
                throw createErrorResponse(
                    ErrorCodes.RESOURCE_UNAVAILABLE,
                    `Financial data unavailable: ${error.message}. Backend service may be down.`
                );
            }
        })
    );
}; 