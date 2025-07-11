# [2.32.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.31.0...v2.32.0) (2025-06-13)

# [2.31.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.30.0...v2.31.0) (2025-06-13)


### Bug Fixes

* add missing GitHub Actions permissions for PR comments - Add pull-requests: write and issues: write permissions to security.yml and check-branch.yml workflows - Fixes 'Resource not accessible by integration' error (HTTP 403) - Allows GitHub Actions to comment on PRs and add labels - Resolves CI/CD pipeline permission issues ([c874ee7](https://github.com/lerianstudio/lerian-mcp-server/commit/c874ee710800a002fe07103cf0d1ccfaea937f67))
* add missing package-lock.json for CI/CD dependency caching ([c7c676b](https://github.com/lerianstudio/lerian-mcp-server/commit/c7c676b72f30004c0cfddbd4a79323437ee7e987))
* add organization authentication to dual-publish workflow ([8647046](https://github.com/lerianstudio/lerian-mcp-server/commit/8647046ac8c089ef062236f5f46a42e8322a5edf))
* resolve code review issues from Kodus AI bot - Fix recursive call bug in calculateHealthScore() method - Implement actual average response time calculation - Add totalDuration and totalOperations tracking - Remove mutual recursion between calculateHealthScore and getMetrics - Addresses critical runtime error and maintainability issues ([80e1a8e](https://github.com/lerianstudio/lerian-mcp-server/commit/80e1a8e694d0ddeef48b562f8bbd6950f1d771db))
* resolve npm package.json warnings for bin paths and repository URL ([e01947a](https://github.com/lerianstudio/lerian-mcp-server/commit/e01947ab0f31ecbd286e9b1400e6c2ea7b29843d))
* resolve sitemap operation error and prompts registration issues - Fix sitemap operation by properly fetching resources before calling generateSitemap() - Fix prompts registration by implementing fallback prompt list handler - Add comprehensive test suite for all tools and prompts (90% success rate) - Create dual NPM publish workflow and script for backward compatibility - Fix GitHub Actions workflow context access issues - Add npm run publish:dual command for manual dual publishing ([7d25166](https://github.com/lerianstudio/lerian-mcp-server/commit/7d2516692ac4e8f35c3557e4b95abdde8adb6b4c))
* update .env.example for local Docker development setup ([e07efb7](https://github.com/lerianstudio/lerian-mcp-server/commit/e07efb7fefce27c7eede88bc6f83fced3ed7e6da))
* update dual-publish workflow to use NODE_AUTH_TOKEN for NPM authentication ([4a4a26d](https://github.com/lerianstudio/lerian-mcp-server/commit/4a4a26d6de10233ff911604aa2679994e1ee5c9c))
* update local Docker container configuration for development ([aafcae5](https://github.com/lerianstudio/lerian-mcp-server/commit/aafcae5c724f84622e794b2f920e12185d304276))


### Features

* add comprehensive error monitoring and performance tracking - Enhanced error monitoring with severity levels and context tracking - Real-time performance monitoring with operation timing - Health scoring system (0-100) based on errors and performance - 3 new monitoring tools: health-status, error-metrics, performance-metrics - Version 2.27.0 ([5bda9f5](https://github.com/lerianstudio/lerian-mcp-server/commit/5bda9f5f05eeebc4a16b9e4ab46f20fb12a99844))
* update repository name and change license to Apache v2.0 ([d751db7](https://github.com/lerianstudio/lerian-mcp-server/commit/d751db79ee76599d676e2a9fe3297625464e8edd))

# [2.30.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.29.0...v2.30.0) (2025-06-09)

# [2.29.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.28.0...v2.29.0) (2025-06-06)


### Features

* update repository name and change license to Apache v2.0 ([#35](https://github.com/lerianstudio/lerian-mcp-server/issues/35)) ([c97d92f](https://github.com/lerianstudio/lerian-mcp-server/commit/c97d92f27c913c592b20dad1b52c462197f4903b))

# [2.28.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.27.0...v2.28.0) (2025-06-05)

# [2.27.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.26.0...v2.27.0) (2025-06-05)


### Features

* Enhanced Error Monitoring and Performance Tracking v2.27.0 ([#31](https://github.com/lerianstudio/lerian-mcp-server/issues/31)) ([bb4f080](https://github.com/lerianstudio/lerian-mcp-server/commit/bb4f08030cb18ed3f7f01816961fb83ca386be7d))

# [2.26.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.25.0...v2.26.0) (2025-06-05)

# [2.25.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.24.0...v2.25.0) (2025-06-05)

# [2.24.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.23.0...v2.24.0) (2025-06-05)


### Features

* implement comprehensive security framework - Add comprehensive .env.example with all security variables - Create automated security audit script with vulnerability scanning - Add dependency update automation with security focus - Implement GitHub Actions security workflow with TruffleHog - Add security utilities with AES-256-GCM encryption - Create security reports and monitoring system - Add npm scripts for security operations - Update .gitignore for security reports - Improve security patterns to reduce false positives SECURITY: Establishes enterprise-grade security monitoring and automation ([3c0c3b3](https://github.com/lerianstudio/lerian-mcp-server/commit/3c0c3b33f7fa57c8cc849d4ea2ff3af6ae8da2c2))

# [2.23.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.22.0...v2.23.0) (2025-06-05)

# [2.22.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.21.0...v2.22.0) (2025-06-05)

# [2.21.0](https://github.com/lerianstudio/lerian-mcp-server/compare/v2.20.0...v2.21.0) (2025-06-05)


### Features

* migrate to Lerian company branding with Midaz product support - BREAKING CHANGE: Package name changed to @lerianstudio/lerian-mcp-server - Company-level: Lerian branding (package, repo, binary) - Product-level: Midaz branding (tools, APIs, env vars) - Full backward compatibility maintained - Multi-product architecture ready ([dca222b](https://github.com/lerianstudio/lerian-mcp-server/commit/dca222b3220559787cbc96fb3f8b5c5fcc2be7d4))

# [2.20.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.19.0...v2.20.0) (2025-06-05)


### Bug Fixes

* **server:** resolve race condition with Cursor 1.0 - Move client detection after server.connect() to avoid method interception race - Fixes 'No server info found' errors in Cursor 1.0 ([8e99521](https://github.com/lerianstudio/midaz-mcp-server/commit/8e99521b593156914fa8a92f664ec4c964bc2b14))

# [2.19.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.18.0...v2.19.0) (2025-06-04)


### Bug Fixes

* **prompts:** resolve MCP client prompt visibility and Zod compatibility issues ([c580552](https://github.com/lerianstudio/midaz-mcp-server/commit/c580552293ef2189d7fa22a0d8d655f89830e8e4))

# [2.18.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.17.0...v2.18.0) (2025-06-04)

# [2.17.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.16.0...v2.17.0) (2025-06-04)


### Features

* **docs:** add enhanced workflow prompts and system architecture documentation ([cb5f02c](https://github.com/lerianstudio/midaz-mcp-server/commit/cb5f02c3080abd19f2ddf162c190657150e78663))

# [2.16.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.15.0...v2.16.0) (2025-06-04)


### Features

* **prompts:** implement advanced MCP prompt primitives with multi-format file support ([5ae9f33](https://github.com/lerianstudio/midaz-mcp-server/commit/5ae9f33f2de3c4d58ed5f909613091c29f7c2345))

# [2.15.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.14.0...v2.15.0) (2025-06-03)

# [2.14.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.13.0...v2.14.0) (2025-06-03)


### Features

* **ci:** align local development with CI/CD pipeline ([83c2764](https://github.com/lerianstudio/midaz-mcp-server/commit/83c2764481ebc44b1858eb6802641c0e6dbf391b))

# [2.13.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.12.0...v2.13.0) (2025-06-03)

# [2.12.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.11.0...v2.12.0) (2025-06-03)


### Bug Fixes

* **build:** resolve ESLint parsing error in code generation tool ([d39a761](https://github.com/lerianstudio/midaz-mcp-server/commit/d39a76119812136d555c4a1a6587e89362b6a86a))


### Features

* **docs:** add comprehensive sequence diagrams and documentation target ([e9c8fd9](https://github.com/lerianstudio/midaz-mcp-server/commit/e9c8fd91b88ff3a64ca39f8373be2f5e01be4b84))

# [2.11.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.10.0...v2.11.0) (2025-05-31)


### Bug Fixes

* **ci:** reorganize CI/CD pipeline for reliable releases ([76bf79c](https://github.com/lerianstudio/midaz-mcp-server/commit/76bf79ccb0078d9a1f6b43cff7eb0a45acce9c3f))

# [2.10.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.9.0...v2.10.0) (2025-05-31)


### Bug Fixes

* **ci:** resolve linting errors for enhanced learning system ([f8124dd](https://github.com/lerianstudio/midaz-mcp-server/commit/f8124dd547bbad4fa3448ef672d9c5d7c1904c8f))

# [2.9.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.8.0...v2.9.0) (2025-05-31)


### Features

* **learning:** implement enhanced instructional system with dynamic content ([a8f7f09](https://github.com/lerianstudio/midaz-mcp-server/commit/a8f7f09238a660f60652c74c751346c9e48e124a))

# [2.8.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.7.0...v2.8.0) (2025-05-29)

# [2.7.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.6.0...v2.7.0) (2025-05-29)


### Bug Fixes

* **mcp:** completely resolve stdio protocol interference issues ([53d6656](https://github.com/lerianstudio/midaz-mcp-server/commit/53d665686ec19e11f6ec89aca43bf16d280b7b59))
* **mcp:** completely silence console output for clean stdio protocol ([507c2b0](https://github.com/lerianstudio/midaz-mcp-server/commit/507c2b02b529226332a15f70d4dbcf82ca442815))

# [2.6.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.5.0...v2.6.0) (2025-05-29)


### Bug Fixes

* **mcp:** resolve MCP client connection issues ([d40d2c0](https://github.com/lerianstudio/midaz-mcp-server/commit/d40d2c02dfb26a5cfc0b0f78dd977c69df269c9b))

# [2.5.0](https://github.com/lerianstudio/midaz-mcp-server/compare/v2.4.1...v2.5.0) (2025-05-29)


### Bug Fixes

* **ci:** correct NPM authentication in manual publish workflow ([2dac6c2](https://github.com/lerianstudio/midaz-mcp-server/commit/2dac6c2ecc43d4dbc1c142ef1d7ff6c007c19f20))
* **ci:** prepare v2.4.1 release with fixed semantic-release config ([cecb263](https://github.com/lerianstudio/midaz-mcp-server/commit/cecb2638ff040d80425b024c3e56f2109a12152b))
* **ci:** resolve semantic-release Date prototype errors completely ([26c9dec](https://github.com/lerianstudio/midaz-mcp-server/commit/26c9dec36bec82e5a7b75d860c853c4bcef0e229))
* **deps:** update package-lock.json with compatible semantic-release versions ([8d301c7](https://github.com/lerianstudio/midaz-mcp-server/commit/8d301c7e59e4f42b74975a69b53f310a2a55a90a))


### Features

* **ci:** add manual NPM publish workflow to bypass semantic-release issues ([65a0fbb](https://github.com/lerianstudio/midaz-mcp-server/commit/65a0fbb6a2f6cdce5740a3f9e2d55e7b966a2318))

## 1.0.0 (2025-05-23)


### 🐛 Bug Fixes

* **ci:** correct GitHub App token action parameter names ([74171f2](https://github.com/lerianstudio/midaz-mcp-server/commit/74171f2436094e9986021f4a393885a4a19b0aa5))
* **ci:** import GPG key before git config and use action's git setup ([98fd3e2](https://github.com/lerianstudio/midaz-mcp-server/commit/98fd3e23f3148b8b5d9bba9f1e391eb7edef4183))
* **ci:** remove Alpine variant build from workflow ([9b5d8b1](https://github.com/lerianstudio/midaz-mcp-server/commit/9b5d8b1f1df81d18ccc4707bb9d5af4106acea46))
* **ci:** update workflows to use Lerian Studio standard secrets ([19267c9](https://github.com/lerianstudio/midaz-mcp-server/commit/19267c9243c971621b26ad6a2d029277efbdd92a))
* **ci:** use lowercase repository name for GitHub Container Registry ([b8837c6](https://github.com/lerianstudio/midaz-mcp-server/commit/b8837c641be9cb5fe58a5b06ac58e59646319422))
* **docker:** resolve build issues in GitHub Actions pipeline ([c2d773c](https://github.com/lerianstudio/midaz-mcp-server/commit/c2d773cd30b69e74903039507016e5394df9a73e))
* **docker:** skip prepare script during npm ci to prevent build failures ([731ce5e](https://github.com/lerianstudio/midaz-mcp-server/commit/731ce5ed5979a02786540f14bbbfb1bc65375a74))


### 👷 CI/CD

* add comprehensive CI/CD workflows for consistency with Midaz project ([4033911](https://github.com/lerianstudio/midaz-mcp-server/commit/40339118c170b8746e9462a95010e202737b56ee))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dynamic documentation discovery from llms.txt
- Security enhancements (input validation, audit logging, rate limiting)
- MCP protocol compliance (subscriptions, pagination, content types)
- Docker support with multi-stage builds
- Comprehensive CI/CD pipelines
- Code quality and security scanning
- Automated dependency updates
- Release automation with semantic versioning

### Changed
- Documentation now fetched from docs.lerian.studio instead of local files
- Improved error handling with proper MCP error codes
- Enhanced TypeScript type safety

### Security
- Added input validation with Zod schemas
- Implemented injection attack prevention
- Added audit logging with automatic rotation
- Enforced localhost-only connections
- Secure configuration file handling

## [0.1.0] - 2024-05-22

### Added
- Initial release of Midaz MCP Server
- Educational content and model information
- Read-only API tools for Midaz interaction
- Support for Claude Desktop integration
- Comprehensive documentation resources
- Fallback mode with stub data
- Configuration management system

[Unreleased]: https://github.com/lerianstudio/midaz-mcp-server/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/lerianstudio/midaz-mcp-server/releases/tag/v0.1.0
