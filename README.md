# Lerian MCP Server

**Your AI's gateway to Lerian documentation, guides, and learning resources!**

This MCP server connects Claude, ChatGPT, and other AI assistants to comprehensive documentation for **all 5 Lerian products** (Midaz, Tracer, Flowker, Reporter, and more). Get instant help with integration, best practices, and code generation—all through natural conversation.

> **📚 Documentation-Only Mode:** This server provides documentation and learning resources. It does NOT connect to Lerian backend APIs. For live API access, use [Lerian SDKs](https://docs.lerian.studio/sdks) in your application.

---

## ⚡ 2-Minute Setup

**Step 1:** Choose your AI assistant
**Step 2:** Copy the configuration below
**Step 3:** Restart your AI app
**Step 4:** Ask: *"What can you tell me about Lerian Midaz?"*

### 🖥️ Claude Desktop

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
**Location:** `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npx",
      "args": ["-y", "@lerianstudio/lerian-mcp-server@latest"]
    }
  }
}
```

### 🖥️ Cursor / Windsurf / Continue

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npx",
      "args": ["-y", "@lerianstudio/lerian-mcp-server@latest"]
    }
  }
}
```

### 💬 ChatGPT Desktop

Same configuration in your ChatGPT Desktop MCP settings file.

---

## ✨ What You Get

**ONE powerful tool for ALL 5 Lerian products:**

### 📦 Supported Products
- **Midaz** - Financial ledger system with double-entry accounting
- **Tracer** - Observability and distributed tracing platform
- **Flowker** - Workflow orchestration engine
- **Reporter** - Reporting and analytics platform
- **All** - Cross-product search and comparison

### 🎯 Operations

#### 📚 Documentation (`operation: "docs"`)
Get comprehensive documentation for any product:
```
"Show me Midaz transaction documentation"
"Explain Tracer's observability features"
"How does Flowker workflow orchestration work?"
```

#### 🎓 Learning (`operation: "learn"`)
Interactive tutorials adapted to your experience level:
```
"I'm a beginner, teach me about Midaz"
"Advanced guide to Tracer integration"
"Flowker workflows for intermediate developers"
```

#### 💻 SDK Generation (`operation: "sdk"`)
Production-ready code in 3 languages:
```
"Generate Go code for Midaz transaction creation"
"TypeScript SDK example for Reporter analytics"
"JavaScript code for Flowker workflow execution"
```

#### 🔍 Search (`operation: "search"`)
Find anything across all products:
```
"Search all products for authentication docs"
"Find transaction examples across Lerian"
```

---

## 🚀 Example Conversations

### Getting Started
**You:** *"What can you tell me about Lerian Midaz?"*
**AI:** *Uses `lerian` tool with product="midaz", operation="docs"*
→ Gets comprehensive Midaz documentation, explains core concepts

### Learning Path
**You:** *"I'm new to Tracer, how do I get started?"*
**AI:** *Uses `lerian` tool with product="tracer", operation="learn", topic="getting-started"*
→ Provides beginner-friendly tutorial with step-by-step guidance

### Code Generation
**You:** *"Show me Go code for creating a Midaz ledger"*
**AI:** *Uses `lerian` tool with product="midaz", operation="sdk", language="go"*
→ Generates production-ready Go code with comments and best practices

### Cross-Product Search
**You:** *"How do the different Lerian products handle authentication?"*
**AI:** *Uses `lerian` tool with product="all", operation="search", topic="authentication"*
→ Searches across all products, provides comparison

---

## 🎯 The ONE Tool

The entire MCP server is built around a single, intelligent tool:

```
Tool: lerian

Parameters:
  product    - midaz | tracer | flowker | reporter | all
  operation  - docs | learn | sdk | search
  topic      - What you want to know about (optional)
  language   - go | typescript | javascript (for SDK operation)
  useCase    - Specific use case (optional, for SDK)

Example:
{
  "product": "midaz",
  "operation": "learn",
  "topic": "transactions"
}
```

**Why ONE tool?**
- 🎯 Simple to discover and use
- 🔄 Consistent experience across all products
- 🚀 Easy for AI to understand
- 📦 Minimal context usage
- ⚡ Fast and efficient

---

## 💡 Key Features

### ✅ Zero Configuration
- Auto-generates required secrets on first run
- Stores in `~/.lerian/secrets.json` (secure, persistent)
- Works immediately with `npx` - no manual setup

### ✅ All Products, One Interface
- Unified access to Midaz, Tracer, Flowker, Reporter
- Cross-product search and comparison
- Consistent documentation format

### ✅ Smart Documentation
- Auto-loads from `docs.lerian.studio/llms.txt`
- Always up-to-date with latest docs
- Rich formatting optimized for AI understanding

### ✅ Multi-Language SDK
- Go (backend services)
- TypeScript (type-safe web)
- JavaScript (Node.js/browser)
- Production-ready code with best practices

### ✅ Experience-Based Learning
- Beginner-friendly tutorials
- Intermediate deep-dives
- Advanced patterns and architecture
- Role-specific guidance (developer/admin/business)

---

## 🔒 Safe & Secure

- ✅ **No API access** - Documentation only, can't execute operations
- ✅ **All local** - Documentation cached on your machine
- ✅ **Zero vulnerabilities** - Comprehensive security audit completed
- ✅ **Auto-secret generation** - Cryptographic keys auto-managed
- ✅ **Open source** - Fully auditable code

---

## 📖 Documentation

### Quick Links
- 📚 [Full Documentation](https://docs.lerian.studio)
- 🎓 [Learning Paths](https://docs.lerian.studio/learn)
- 💻 [SDK Reference](https://docs.lerian.studio/sdks)
- 🐛 [Troubleshooting](https://docs.lerian.studio/troubleshooting)

### For Developers
- 🔧 [Makefile Commands](Makefile) - `make help` for all commands
- 🧪 [Testing Guide](test/README.md)
- 📊 [Architecture](CLAUDE.md)
- 🔐 [Security](SECURITY_REMEDIATION_SUMMARY.md)

---

## 🛠️ Advanced Usage

### Custom Documentation URL

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npx",
      "args": ["-y", "@lerianstudio/lerian-mcp-server@latest"],
      "env": {
        "LERIAN_DOCS_URL": "https://your-custom-docs.example.com"
      }
    }
  }
}
```

### Enable Logging

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npx",
      "args": ["-y", "@lerianstudio/lerian-mcp-server@latest"],
      "env": {
        "ERROR_LOGGING": "true",
        "PERFORMANCE_TRACKING": "true",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

Logs are stored in `./logs/` directory.

---

## 🆘 Troubleshooting

### Server Not Starting?

1. **Check Node.js version:** Requires Node.js 18+
   ```bash
   node --version  # Should show v18 or higher
   ```

2. **Test manually:**
   ```bash
   npx -y @lerianstudio/lerian-mcp-server
   ```

3. **Check secrets:**
   ```bash
   ls -la ~/.lerian/secrets.json
   ```

### Tool Not Responding?

1. **Restart your AI assistant** after changing configuration
2. **Verify MCP is enabled** in your AI assistant's settings
3. **Check logs** (if enabled): `./logs/error.log`

### Getting Help

- 🐛 [GitHub Issues](https://github.com/lerianstudio/lerian-mcp-server/issues)
- 💬 [Lerian Community](https://community.lerian.studio)
- 📖 [Documentation](https://docs.lerian.studio/mcp)

---

## 📦 Package Information

**npm Package:** `@lerianstudio/lerian-mcp-server`
**Version:** 4.0.0 (Documentation-Only Mode)
**License:** Apache-2.0
**Repository:** [GitHub](https://github.com/lerianstudio/lerian-mcp-server)

### Migration from v3.x

Version 4.0.0 is a **major breaking change** that removes all API connectivity.

**What's Removed:**
- ❌ All 18 financial API tools
- ❌ Backend service connectivity
- ❌ Live data queries

**What You Gain:**
- ✅ Focused documentation experience
- ✅ 5 products in ONE tool
- ✅ Faster, simpler, more reliable
- ✅ Zero configuration required

**Need API access?** Use [Lerian SDKs](https://docs.lerian.studio/sdks) directly in your application.

See [MIGRATION-V4.md](MIGRATION-V4.md) for full migration guide.

---

## 🏗️ Architecture

**The Ultimate Simplification:**
- **Tool Count:** 1 (down from 23!)
- **Products:** 5 (midaz, tracer, flowker, reporter, all)
- **Operations:** 4 (docs, learn, sdk, search)
- **Languages:** 3 (Go, TypeScript, JavaScript)
- **Data Source:** docs.lerian.studio/llms.txt (auto-updated)

**Layers:**
1. Infrastructure - Config, logging, security
2. Transport - MCP stdio protocol
3. Protocol - Message handling, cursors
4. Client Adaptation - Response formatting
5. Tool - Single unified lerian tool
6. Business Logic - Documentation workflows

**No API/Integration layer** - Pure documentation MCP ✅

---

## 🌟 Why This MCP?

### For AI Users
- 🎯 **One tool, everything** - No complexity, just ask
- 📚 **Always current** - Auto-updates from official docs
- 🎓 **Learn by doing** - Interactive tutorials
- 💻 **Copy-paste code** - Production-ready examples

### For Developers
- ⚡ **Zero setup** - Just `npx` and go
- 🔒 **Secure by default** - No credentials needed
- 🪶 **Lightweight** - Minimal dependencies
- 🔧 **Just works** - Auto-generates secrets

### For Organizations
- 📖 **Single source of truth** - Official Lerian documentation
- 🚀 **Faster onboarding** - AI-assisted learning
- ✅ **Best practices** - Built into examples
- 🔐 **Safe** - Read-only, can't modify data

---

**Ready to explore Lerian with AI?** Install now and ask your first question! 🚀

```bash
# That's it! Just add to your AI's config and restart
npx -y @lerianstudio/lerian-mcp-server
```
