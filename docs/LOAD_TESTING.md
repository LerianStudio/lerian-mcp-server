# Load Testing Guide

> Documentation for validating timeout values and performance characteristics under load

## Overview

This document outlines load testing requirements to validate the timeout values configured in the Lerian MCP Server, particularly the fixes applied in LOW-002 (HTTP timeout enforcement).

## Timeout Values to Validate

| Operation | Timeout | Location | Rationale |
|-----------|---------|----------|-----------|
| OAuth Authentication | 10s | `src/tools/midaz-api.js:259` | Auth should be fast; 10s allows network latency |
| Financial API Calls | 30s | `src/tools/midaz-api.js:305` | Complex queries may take time; 30s prevents indefinite hangs |
| Documentation Fetch | 10s | `src/util/docs-manifest.js:245` | External content; fail fast if unavailable |
| Service Auto-detect | 2s | `src/config.js:185,206` | Quick health check; fast fail for startup |
| Graceful Shutdown | 30s | `src/index.ts:267` | Allow in-flight requests to complete |

## Test Scenarios

### 1. OAuth Token Request Performance

**Objective:** Verify 10-second timeout is sufficient for P95/P99 authentication requests under load.

**Test Setup:**
```bash
# Use Apache Bench or k6 for load testing
npm install -g k6

# Create test script
cat > test/load/oauth-load.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 concurrent users
    { duration: '1m', target: 50 },    // Sustain 50 concurrent users
    { duration: '30s', target: 100 },  // Peak at 100 concurrent users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // P95 should be < 10s
    http_req_failed: ['rate<0.01'],     // Error rate < 1%
  },
};

export default function () {
  const res = http.post('http://localhost:3000/oauth/token', {
    grant_type: 'client_credentials',
    client_id: 'test-client',
    client_secret: 'test-secret',
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 10s': (r) => r.timings.duration < 10000,
  });

  sleep(1);
}
EOF
```

**Run Test:**
```bash
k6 run test/load/oauth-load.js
```

**Success Criteria:**
- ✅ P95 latency < 10 seconds
- ✅ P99 latency < 10 seconds
- ✅ Error rate < 1%
- ✅ No timeout errors under normal load

**If tests fail:** Increase timeout or optimize backend authentication service.

---

### 2. Financial API Call Performance

**Objective:** Verify 30-second timeout is sufficient for complex financial queries.

**Test Scenarios:**

#### A. Simple List Queries
```javascript
// Test: list-organizations, list-ledgers, list-accounts
// Expected: P95 < 5s, P99 < 10s
// Timeout: 30s (provides 3x margin)
```

#### B. Complex Balance Queries
```javascript
// Test: get-balance with aggregation across multiple accounts
// Expected: P95 < 15s, P99 < 25s
// Timeout: 30s (provides 1.2-2x margin)
```

#### C. Transaction History Queries
```javascript
// Test: list-transactions with date ranges, pagination
// Expected: P95 < 20s, P99 < 28s
// Timeout: 30s (tight but acceptable)
```

**Load Test Script:**
```bash
cat > test/load/api-load.js << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  scenarios: {
    list_operations: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
    },
    complex_queries: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 20 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    'http_req_duration{operation:list}': ['p(95)<5000', 'p(99)<10000'],
    'http_req_duration{operation:get}': ['p(95)<15000', 'p(99)<25000'],
    'http_req_duration{operation:complex}': ['p(95)<20000', 'p(99)<28000'],
  },
};

export default function () {
  // Test various financial operations
  const operations = [
    { name: 'list-organizations', type: 'list' },
    { name: 'get-balance', type: 'complex' },
    { name: 'list-transactions', type: 'complex' },
  ];

  operations.forEach(op => {
    const res = http.get(`http://localhost:3000/${op.name}`, {
      tags: { operation: op.type },
    });

    check(res, {
      [`${op.name} status 200`]: (r) => r.status === 200,
      [`${op.name} response time OK`]: (r) => r.timings.duration < 30000,
    });
  });
}
EOF
```

**Run Test:**
```bash
k6 run test/load/api-load.js
```

**Success Criteria:**
- ✅ List operations: P95 < 5s, P99 < 10s
- ✅ Get operations: P95 < 15s, P99 < 25s
- ✅ Complex queries: P95 < 20s, P99 < 28s
- ✅ All operations complete within 30s timeout
- ✅ Error rate < 0.1% under normal load

**If tests fail:**
- Investigate slow queries (missing indexes, N+1 queries)
- Consider increasing timeout to P99 + 5s margin
- Optimize backend service performance

---

### 3. Graceful Shutdown Under Load

**Objective:** Verify server completes in-flight requests during shutdown.

**Test Setup:**
```bash
# Terminal 1: Start load test
k6 run --duration 5m test/load/api-load.js &

# Terminal 2: Wait 2 minutes, then send shutdown signal
sleep 120
pkill -SIGTERM -f "lerian-mcp-server"

# Monitor shutdown logs
tail -f logs/server.log
```

**Metrics to Collect:**
- How many requests were in-flight during shutdown?
- How long did shutdown take? (should be < 30s)
- Were any requests terminated mid-flight?
- Did all responses complete successfully?

**Success Criteria:**
- ✅ All in-flight requests complete successfully
- ✅ Shutdown completes within 30 seconds
- ✅ No client receives incomplete/corrupted responses
- ✅ Metrics flushed before exit

**If tests fail:**
- Check if `server.close()` actually waits for requests
- Consider increasing shutdown timeout
- Add request draining mechanism

---

### 4. Cursor Signature Performance

**Objective:** Verify HMAC signing doesn't significantly impact pagination performance.

**Test Setup:**
```javascript
// Measure cursor creation overhead
const iterations = 10000;
console.time('cursor-creation');
for (let i = 0; i < iterations; i++) {
  createSignedCursor({ offset: i, timestamp: Date.now() });
}
console.timeEnd('cursor-creation');
// Expected: < 500ms for 10k cursors (< 0.05ms per cursor)

// Measure cursor verification overhead
console.time('cursor-verification');
for (let i = 0; i < iterations; i++) {
  const cursor = createSignedCursor({ offset: i });
  verifyAndDecodeCursor(cursor);
}
console.timeEnd('cursor-verification');
// Expected: < 1000ms for 10k cursors (< 0.1ms per cursor)
```

**Success Criteria:**
- ✅ Cursor creation: < 0.1ms per cursor
- ✅ Cursor verification: < 0.2ms per cursor
- ✅ No noticeable pagination slowdown

---

## Performance Benchmarking Tools

### Recommended Tools

1. **k6** - Modern load testing (recommended)
   ```bash
   npm install -g k6
   k6 run test/load/scenario.js
   ```

2. **Apache Bench** - Simple HTTP benchmarking
   ```bash
   ab -n 10000 -c 100 http://localhost:3000/api/organizations
   ```

3. **Artillery** - Scenario-based load testing
   ```bash
   npm install -g artillery
   artillery run test/load/scenario.yml
   ```

4. **autocannon** - Node.js HTTP benchmarking
   ```bash
   npm install -g autocannon
   autocannon -c 100 -d 60 http://localhost:3000/api/ledgers
   ```

### Monitoring During Tests

**Required Metrics:**
- Request latency (P50, P95, P99)
- Error rate (%)
- Throughput (requests/second)
- CPU utilization (%)
- Memory usage (MB)
- Active connections
- Timeout occurrences

**Tools:**
```bash
# Monitor system resources
htop

# Monitor Node.js process
node --inspect src/index.ts

# Monitor MCP server metrics
# Use the lerian-performance-metrics MCP tool during test
```

---

## Load Testing Checklist

**Before Testing:**
- [ ] Set up realistic backend services (or mocks)
- [ ] Configure production-like environment variables
- [ ] Set CURSOR_SECRET and CACHE_ENCRYPTION_KEY
- [ ] Enable performance monitoring: `PERFORMANCE_TRACKING=true`
- [ ] Ensure sufficient disk space for logs
- [ ] Document baseline performance (no load)

**During Testing:**
- [ ] Monitor error rates in real-time
- [ ] Watch for timeout occurrences
- [ ] Check memory for leaks
- [ ] Verify cursor tampering is rejected
- [ ] Test graceful shutdown during peak load
- [ ] Validate fail-closed policy under backend failures

**After Testing:**
- [ ] Analyze P95/P99 latency vs timeout values
- [ ] Review error logs for patterns
- [ ] Check metrics flush worked correctly
- [ ] Verify no resource leaks (memory, connections, file descriptors)
- [ ] Document findings and adjust timeouts if needed

---

## Expected Results

### Normal Load (< 100 concurrent users)

| Operation | P50 | P95 | P99 | Timeout Margin |
|-----------|-----|-----|-----|----------------|
| OAuth Auth | 100ms | 500ms | 2s | 5x (10s timeout) |
| List Resources | 50ms | 200ms | 1s | 30x (30s timeout) |
| Get Resource | 80ms | 300ms | 1.5s | 20x (30s timeout) |
| Complex Queries | 500ms | 5s | 15s | 2x (30s timeout) |

### High Load (100-500 concurrent users)

| Operation | P50 | P95 | P99 | Timeout Margin |
|-----------|-----|-----|-----|----------------|
| OAuth Auth | 200ms | 2s | 5s | 2x (10s timeout) |
| List Resources | 100ms | 1s | 5s | 6x (30s timeout) |
| Get Resource | 150ms | 2s | 8s | 3.75x (30s timeout) |
| Complex Queries | 1s | 15s | 25s | 1.2x (30s timeout) |

**Warning:** If P99 > 80% of timeout, consider:
- Increasing timeout value
- Optimizing query performance
- Adding caching layer
- Database indexing

---

## Continuous Performance Testing

### CI/CD Integration

Add to `.github/workflows/performance.yml`:
```yaml
name: Performance Tests

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Monday

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Start backend services
        run: docker-compose up -d

      - name: Run load tests
        run: k6 run test/load/api-load.js

      - name: Check performance thresholds
        run: |
          if [ $? -ne 0 ]; then
            echo "Performance degradation detected"
            exit 1
          fi
```

---

## Next Steps

1. **Baseline Testing:** Run load tests against current implementation to establish baseline
2. **Timeout Validation:** Confirm all P99 latencies are below timeout values with margin
3. **Stress Testing:** Test beyond expected load to find breaking points
4. **Soak Testing:** Run for 24+ hours to detect memory leaks
5. **Chaos Testing:** Test graceful shutdown during various failure modes

---

## References

- [k6 Documentation](https://k6.io/docs/)
- [Load Testing Best Practices](https://k6.io/docs/test-types/load-testing/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [MCP Protocol Performance](https://modelcontextprotocol.io/docs/concepts/performance)
