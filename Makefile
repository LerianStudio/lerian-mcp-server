# Midaz MCP Server - Makefile
# Automates setup, configuration, and running of the MCP server

.PHONY: help setup build start dev docker-build docker-run docker-exec docker-logs docker-stop docker-clean test lint clean install demo validate

# Default target
help:
	@echo "🚀 Midaz MCP Server - Available Commands"
	@echo "========================================"
	@echo ""
	@echo "📋 Setup & Configuration:"
	@echo "  setup           Setup project (copy config files, install deps)"
	@echo "  install         Install npm dependencies"
	@echo "  config          Copy configuration files (.env, JSON config)"
	@echo ""
	@echo "🔨 Development:"
	@echo "  build           Build TypeScript to JavaScript"
	@echo "  start           Start MCP server (production mode)"
	@echo "  dev             Start MCP server (development mode)"
	@echo "  test            Run all tests"
	@echo "  test-logging    Test logging functionality"
	@echo "  lint            Run ESLint"
	@echo "  lint-fix        Run ESLint with auto-fix"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  docker-build    Build Docker image"
	@echo "  docker-run      Run MCP server in Docker (stub mode)"
	@echo "  docker-live     Run MCP server in Docker (live mode)"
	@echo "  docker-exec     Execute MCP server for Claude Desktop"
	@echo "  docker-logs     Show Docker container logs"
	@echo "  docker-bridge   Start socat bridge for Claude Desktop"
	@echo "  docker-stop     Stop Docker container"
	@echo "  docker-clean    Clean Docker resources"
	@echo ""
	@echo "🧹 Maintenance:"
	@echo "  clean           Clean build artifacts"
	@echo "  clean-all       Clean everything (build + node_modules)"
	@echo "  demo            Run interactive Makefile demo"
	@echo "  validate        Validate that setup process works"
	@echo ""
	@echo "🔧 Environment Variables:"
	@echo "  MIDAZ_LOG_LEVEL=debug|info|warning|error"
	@echo "  MIDAZ_CONSOLE_LOGS=true|false"
	@echo "  MIDAZ_DETAILED_LOGS=true|false"
	@echo ""
	@echo "📖 Examples:"
	@echo "  make setup                    # Initial project setup"
	@echo "  make dev                      # Start development server"
	@echo "  MIDAZ_LOG_LEVEL=debug make start  # Start with debug logging"
	@echo "  make docker-build docker-run      # Run in Docker"

# Setup project from scratch
setup: config install build
	@echo "✅ Project setup complete!"
	@echo "📝 Next steps:"
	@echo "   1. Edit .env with your configuration"
	@echo "   2. Edit midaz-mcp-config.json if needed"
	@echo "   3. Run 'make start' to start the server"

# Copy configuration files
config:
	@echo "📁 Setting up configuration files..."
	@if [ ! -f .env ]; then \
		cp .env.example .env && \
		echo "✅ Created .env from .env.example"; \
	else \
		echo "ℹ️  .env already exists, skipping"; \
	fi
	@if [ ! -f midaz-mcp-config.json ]; then \
		cp midaz-mcp-config.json.example midaz-mcp-config.json && \
		echo "✅ Created midaz-mcp-config.json from example"; \
	else \
		echo "ℹ️  midaz-mcp-config.json already exists, skipping"; \
	fi

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install

# Build TypeScript
build:
	@echo "🔨 Building TypeScript..."
	npm run build

# Start server (production)
start: build
	@echo "🚀 Starting MCP server..."
	npm run start

# Start server (development)
dev:
	@echo "🔧 Starting MCP server in development mode..."
	npm run dev

# Run tests
test:
	@echo "🧪 Running tests..."
	npm run test

# Test logging functionality
test-logging:
	@echo "🔍 Testing logging functionality..."
	node scripts/test-logging.js

# Lint code
lint:
	@echo "🔍 Running ESLint..."
	npm run lint

# Lint with auto-fix
lint-fix:
	@echo "🔧 Running ESLint with auto-fix..."
	npm run lint:fix

# Docker commands
docker-build:
	@echo "🐳 Building Docker image..."
	./scripts/docker-mcp.sh build

docker-run:
	@echo "🐳 Running MCP server in Docker (stub mode)..."
	./scripts/docker-mcp.sh run --stub

docker-live:
	@echo "🐳 Running MCP server in Docker (live mode)..."
	./scripts/docker-mcp.sh run --live

docker-exec:
	@echo "🐳 Executing MCP server for Claude Desktop..."
	./scripts/docker-mcp.sh exec

docker-logs:
	@echo "📋 Showing Docker container logs..."
	./scripts/docker-mcp.sh logs

docker-bridge:
	@echo "🌉 Starting socat bridge for Claude Desktop..."
	@echo "📝 Configure Claude Desktop with: socat STDIO TCP:localhost:3330"
	./scripts/docker-mcp.sh bridge

docker-stop:
	@echo "🛑 Stopping Docker container..."
	./scripts/docker-mcp.sh stop

docker-clean:
	@echo "🧹 Cleaning Docker resources..."
	./scripts/docker-mcp.sh clean

# Maintenance
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist
	rm -rf logs/*.log 2>/dev/null || true

clean-all: clean
	@echo "🧹 Cleaning everything..."
	rm -rf node_modules
	rm -rf .env 2>/dev/null || true
	rm -rf midaz-mcp-config.json 2>/dev/null || true

# Development shortcuts with different log levels
dev-debug:
	@echo "🔍 Starting development server with debug logging..."
	MIDAZ_LOG_LEVEL=debug MIDAZ_DETAILED_LOGS=true npm run dev

dev-quiet:
	@echo "🔇 Starting development server with minimal logging..."
	MIDAZ_LOG_LEVEL=error MIDAZ_CONSOLE_LOGS=true npm run dev

# Production shortcuts
start-debug:
	@echo "🔍 Starting production server with debug logging..."
	MIDAZ_LOG_LEVEL=debug MIDAZ_DETAILED_LOGS=true npm run start

start-quiet:
	@echo "🔇 Starting production server with minimal logging..."
	MIDAZ_LOG_LEVEL=error npm run start

# Quick development cycle
quick: lint-fix build test
	@echo "✅ Quick development cycle complete!"

# Full CI/CD cycle
ci: clean install lint build test
	@echo "✅ CI/CD cycle complete!"

# Demo Makefile capabilities
demo:
	@echo "🎯 Running Makefile demo..."
	./scripts/demo-makefile.sh

# Validate setup process
validate:
	@echo "🧪 Validating setup process..."
	./scripts/validate-setup.sh