# Lerian MCP Server

Give your AI assistant instant access to Lerian documentation and APIs! This plugin connects Claude, ChatGPT, and other AI assistants to the Lerian financial system, so you can get help with integration, APIs, and troubleshooting directly in your conversations.

> **🔄 Migration Notice:** This package was previously known as `@lerianstudio/midaz-mcp-server`. Both package names work for backward compatibility, but we recommend migrating to the new `@lerianstudio/lerian-mcp-server` package name.

## ⚡ 5-Minute Setup

**Step 1:** Choose your AI assistant
**Step 2:** Copy the configuration below  
**Step 3:** Restart your AI app
**Step 4:** Start asking questions about Lerian!

### 🖥️ Claude Desktop

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npx",
      "args": ["@lerianstudio/lerian-mcp-server@latest"]
    }
  }
}
```

<details>
<summary>🔄 <strong>Backward Compatibility</strong> (click to expand)</summary>

```json
{
  "mcpServers": {
    "midaz": {
      "command": "npx",
      "args": ["@lerianstudio/midaz-mcp-server@latest"]
    }
  }
}
```
*The old package name still works but is deprecated. Please migrate to `@lerianstudio/lerian-mcp-server`.*
</details>

### 🖥️ Claude Code (Command Line)

```bash
# Install once (new package)
npm install -g @lerianstudio/lerian-mcp-server

# Add to Claude Code
claude mcp add lerian "lerian-mcp-server"
```

<details>
<summary>🔄 <strong>Migration from old package</strong> (click to expand)</summary>

```bash
# Remove old package
npm uninstall -g @lerianstudio/midaz-mcp-server

# Install new package
npm install -g @lerianstudio/lerian-mcp-server

# Update Claude Code
claude mcp remove midaz
claude mcp add lerian "lerian-mcp-server"
```
</details>

### 💬 ChatGPT Desktop

Add to your ChatGPT Desktop MCP configuration file:

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npx",
      "args": ["@lerianstudio/lerian-mcp-server@latest"]
    }
  }
}
```

### ⚡ Cursor IDE

**Location:** File → Preferences → Cursor Settings → MCP → Add new global MCP Server

```json
{
  "mcp.servers": {
    "lerian": {
      "command": "npm",
      "args": ["exec", "@lerianstudio/lerian-mcp-server@latest"]
    }
  }
}
```

### 🌊 Windsurf IDE

**Location:** File → Preferences → Windsurf Settings → Manage plugins → View raw config

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npm",
      "args": ["exec", "@lerianstudio/lerian-mcp-server@latest"]
    }
  }
}
```

### 🔄 Continue IDE

**Location:** `~/.continue/config.yaml` (MacOS / Linux) or `%USERPROFILE%\.continue\config.yaml` (Windows)

```json
{
  "mcpServers": {
    "lerian": {
      "command": "npm",
      "args": ["exec", "@lerianstudio/lerian-mcp-server@latest"]
    }
  }
}
```

## ✨ What You Get

Once connected, you can ask your AI assistant:

- 📚 **"Explain how Lerian accounts work"**
- 🔧 **"Show me how to create a transaction"**
- 🏗️ **"What's the difference between onboarding and transaction APIs?"**
- 💡 **"Generate Go code for creating an organization"**
- 🐛 **"Help me debug this Lerian integration error"**
- 📊 **"What data models does Lerian use?"**

## 🧙‍♂️ Enhanced Workflow Prompts

**NEW!** Interactive wizards and troubleshooting assistants:

### Basic Workflows
- 🎯 **`create-transaction-wizard`** - Step-by-step transaction creation
- 🔍 **`debug-my-balance`** - Balance troubleshooting with context
- 🏗️ **`setup-my-org`** - Organization setup wizard
- 📊 **`explain-my-data`** - Smart data analysis and insights
- 🚀 **`help-me-start`** - Quick start guide
- 🔧 **`help-with-api`** - API-specific guidance
- 📚 **`help-me-learn`** - Personalized learning paths

### Advanced Intelligence (NEW!)
- 📄 **`check-file-balances`** - Multi-format file analysis (CSV/TXT/JSON) with smart UUID extraction
- 💰 **`check-external-balance`** - External account balance checking by asset (USD, EUR, BTC, etc.)
- 🔍 **`discover-lerian-hierarchy`** - Explore complete org → ledger → asset → account chains
- 🛠️ **`show-all-tools`** - Complete catalog of all tools, operations, and parameters

**Enhanced Features:**
- **File Format Support:** Automatic detection of CSV, TXT, and JSON files
- **Smart UUID Extraction:** Intelligent parsing with optional LLM confirmation for TXT files
- **External Balance Monitoring:** Check system-level asset balances and liquidity
- **Business Intelligence:** Asset distribution analysis and treasury management insights

**Usage:** *"Use check-file-balances to analyze my accounts.txt file"* or *"Use check-external-balance to see USD liquidity"*

## 🆘 Need Help?

### Not Working?

1. **Restart your AI app** after adding the configuration
2. **Check the file location** - make sure you edited the right config file
3. **Try the basic test**: Ask your AI "Can you access Lerian documentation?"

### Still Having Issues?

- **Claude Desktop Users**: Verify MCP is enabled in your Claude Desktop version
- **All Users**: Make sure you have Node.js installed on your computer
- **Get Support**: [GitHub Issues](https://github.com/lerianstudio/lerian-mcp-server/issues)

### 🔄 Migration Help

**Migrating from Midaz MCP Server?**
- Both `@lerianstudio/midaz-mcp-server` and `@lerianstudio/lerian-mcp-server` work identically
- All environment variables work with both `MIDAZ_*` and `LERIAN_*` prefixes
- Configuration files work in both `.midaz` and `.lerian` directories
- Commands `midaz-mcp-server` and `lerian-mcp-server` are equivalent

**Recommended Migration Steps:**
1. Update your MCP configuration to use `@lerianstudio/lerian-mcp-server`
2. Restart your AI assistant
3. Optionally update environment variables from `MIDAZ_*` to `LERIAN_*`
4. Optionally move config files from `.midaz/` to `.lerian/` directories

## 🔒 Safe & Secure

- ✅ Read-only access (can't modify your data)
- ✅ No API keys required for basic usage
- ✅ All data stays on your computer
- ✅ Source available (ELv2) and auditable

## ⚙️ Configuration

### Environment Variables

Configure the server behavior with these optional environment variables:

**Logging Configuration:**
- `ERROR_LOGGING=true` - Enable error logging to files (default: disabled)
- `PERFORMANCE_TRACKING=true` - Enable performance tracking logs (default: disabled)
- `AUDIT_LOGGING=true` - Enable security audit logging (default: disabled)

**Note:** All logging is **disabled by default** to prevent log file growth. Enable only if needed for debugging or monitoring.

**Example Claude Desktop configuration with logging:**
```json
{
  "mcpServers": {
    "lerian": {
      "command": "npx",
      "args": ["@lerianstudio/lerian-mcp-server@latest"],
      "env": {
        "ERROR_LOGGING": "true",
        "PERFORMANCE_TRACKING": "true"
      }
    }
  }
}
```

**Log Management:**
- Log files are stored in `./logs/` directory
- Automatic rotation when files exceed 10MB
- Old logs are cleaned up after 7 days
- Manual cleanup: delete the `logs/` directory

## 🛠️ Development & Contributing

### **Quick Start for Developers**
```bash
# Setup and run locally
make setup                    # Initial project setup
make dev                      # Start development server

# Before committing (matches CI/CD exactly)
make ci-all                   # Run complete CI pipeline locally
```

### **Available Commands**
- **`make ci-all`** - Run complete CI/CD pipeline locally (recommended before commits)
- **`make docs-serve`** - Generate and serve documentation locally
- **`make typecheck`** - TypeScript type checking
- **`make audit`** - Security vulnerability scan

### **Documentation**
- 📊 [System Architecture Diagrams](diagrams/README.md) - Visual system documentation

---

**Ready to get started?** Copy the configuration for your AI assistant above and restart the app! 🚀
