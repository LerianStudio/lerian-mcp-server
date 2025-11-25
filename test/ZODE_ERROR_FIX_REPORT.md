# Zod Error Fix Report

## Problem Identified

The MCP server was failing to start with the error:
```
Cannot read properties of null (reading '_zod')
```

## Root Cause

The error was caused by incorrect usage of the MCP SDK's `prompt()` API. The codebase was calling:

```javascript
// INCORRECT
server.prompt(name, description, z.object({...}), callback)
```

However, the correct MCP SDK signature expects a **raw Zod shape object** (not a `z.object()` wrapper):

```javascript
// CORRECT - for prompts with arguments
server.prompt(name, description, {arg: z.string(), ...}, callback)

// CORRECT - for prompts without arguments
server.prompt(name, description, callback)
```

## Type Definition from MCP SDK

From `@modelcontextprotocol/sdk/dist/esm/server/mcp.d.ts`:

```typescript
// Correct signature
prompt<Args extends PromptArgsRawShape>(
  name: string,
  description: string,
  argsSchema: Args,  // <-- Raw shape, not z.object()
  cb: PromptCallback<Args>
): RegisteredPrompt;

// Where PromptArgsRawShape = Record<string, AnySchema>
```

## Files Fixed

All prompt registration files were updated:

1. **`/Users/fredamaral/repos/lerianstudio/lerian-mcp-server/src/prompts/tool-discovery.js`**
   - Fixed 2 zero-argument prompts: removed `z.object({})` (now 3-param calls)
   - Fixed 1 prompt with arguments: changed `z.object({...})` to `{...}`

2. **`/Users/fredamaral/repos/lerianstudio/lerian-mcp-server/src/prompts/midaz-workflows.js`**
   - Fixed 4 prompts with arguments: changed `z.object({...})` to `{...}`

3. **`/Users/fredamaral/repos/lerianstudio/lerian-mcp-server/src/prompts/advanced-workflows.js`**
   - Fixed 4 prompts with arguments: changed `z.object({...})` to `{...}`

## Test Results

### Minimal Test Case (`/Users/fredamaral/repos/lerianstudio/lerian-mcp-server/test/test-prompt-schemas.js`)

Created comprehensive test demonstrating:

```javascript
// ✅ CORRECT patterns that work:
server.prompt('name', 'desc', async () => {...})  // Zero args
server.prompt('name', 'desc', {}, async () => {...})  // Empty args
server.prompt('name', 'desc', {arg: z.string()}, async () => {...})  // With args

// ❌ WRONG pattern that fails:
server.prompt('name', 'desc', z.object({...}), async () => {...})  // Causes Zod error
```

### Full Test Suite

```bash
$ npm test
✅ Build successful
✅ Server starts without errors
✅ Basic server test passed
```

## Summary

- **Total prompts fixed**: 11 (3 in tool-discovery.js + 4 in midaz-workflows.js + 4 in advanced-workflows.js)
- **Pattern changed**: `z.object({...})` → `{...}` for argument schemas
- **Pattern changed**: `z.object({})` → removed (3-param call) for zero-argument prompts
- **Test status**: All tests passing
- **Server status**: Starts successfully without Zod errors
