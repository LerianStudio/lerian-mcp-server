# Midaz MCP Server

A Model Context Protocol (MCP) server that enables AI assistants (like Claude) to understand and interact with the Midaz financial system. Get instant access to Midaz documentation, APIs, and development tools directly in your AI conversations.

## 🚀 Quick Start (Choose One)

### Option 1: One-Command Setup (Recommended)
```bash
git clone https://github.com/lerianstudio/midaz-mcp-server
cd midaz-mcp-server
make setup && make start
```

### Option 2: NPX (No Installation Required)
```bash
npx @lerianstudio/midaz-mcp-server
```

### Option 3: Docker (Isolated Environment)
```bash
git clone https://github.com/lerianstudio/midaz-mcp-server
cd midaz-mcp-server
make docker-build && make docker-run
```

## 🔗 Connect to Claude Desktop

Add this to your Claude Desktop MCP settings:

### For NPX Installation:
```json
{
  "mcpServers": {
    "midaz": {
      "command": "npx",
      "args": ["@lerianstudio/midaz-mcp-server"]
    }
  }
}
```

### For Local Development:
```json
{
  "mcpServers": {
    "midaz": {
      "command": "node",
      "args": ["/path/to/midaz-mcp-server/dist/index.js"]
    }
  }
}
```

### For Docker:
```json
{
  "mcpServers": {
    "midaz": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "lerianstudio/midaz-mcp-server:latest"]
    }
  }
}
```

## ✨ What You Get

Once connected, you can ask Claude about:

- 📚 **Midaz Documentation** - "Explain how Midaz accounts work"
- 🔧 **API Usage** - "Show me how to create a transaction"
- 🏗️ **Architecture** - "What's the difference between onboarding and transaction APIs?"
- 💡 **Examples** - "Generate Go code for creating an organization"
- 🐛 **Troubleshooting** - "Help me debug this Midaz integration"

## 🛠️ Configuration (Optional)

The server works out of the box, but you can customize it:

### Environment Variables

```bash
# Logging level (debug, info, warning, error)
export MIDAZ_LOG_LEVEL=info

# Enable detailed console logs
export MIDAZ_DETAILED_LOGS=true

# Connect to your local Midaz services
export MIDAZ_ONBOARDING_URL=http://localhost:3000
export MIDAZ_TRANSACTION_URL=http://localhost:3001
export MIDAZ_API_KEY=your-api-key
```

### Custom Backend URLs

For custom backend URLs:

```json
{
  "mcpServers": {
    "midaz": {
      "command": "npx",
      "args": [
        "@lerianstudio/midaz-mcp-server",
        "--onboarding-url=http://localhost:3000",
        "--transaction-url=http://localhost:3001"
      ],
      "env": {
        "MIDAZ_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 🆘 Troubleshooting

### Connection Issues

1. Ensure Claude Desktop supports MCP
2. Check MCP server logs for errors
3. Verify the command path in your Claude Desktop settings
4. Try restarting Claude Desktop after configuration changes

### Update Issues

```bash
# Force update to latest version
npx @lerianstudio/midaz-mcp-server@latest

# Clear npm cache if needed
npm cache clean --force
```

### Docker Issues

```bash
# Pull latest image
docker pull lerianstudio/midaz-mcp-server:latest

# Check container status
docker ps

# View container logs
docker logs midaz-mcp-server
```

## 📖 What This Server Provides

- **🔍 Documentation Search** - Access all Midaz docs instantly
- **⚡ API Tools** - Read-only tools for exploring Midaz APIs
- **📊 Data Models** - Complete understanding of Midaz data structures
- **🏗️ Architecture Guides** - How components work together
- **💻 Code Examples** - Ready-to-use code in Go and TypeScript
- **🔧 SDK Support** - Integrated knowledge of both SDKs

## 🔒 Security

- Localhost-only connections
- Read-only API access
- Input validation and sanitization
- No sensitive data exposure
- Audit logging for all operations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/lerianstudio/midaz-mcp-server/issues)
- **Docs**: [Comprehensive Documentation](https://docs.lerian.studio)
- **Quick Demo**: Run `make demo` to see all features

---

**Ready to get started?** Run `make setup` and connect to Claude Desktop in under 2 minutes! 🎉