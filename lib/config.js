// Shared configuration. Override the target with:  k6 run -e BASE_URL=http://localhost:3333 tests/xx.js
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3333';

export const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Reusable pass/fail criteria (k6 "thresholds")
export const COMMON_THRESHOLDS = {
  http_req_failed: ['rate<0.05'],     // less than 5% failed requests
  http_req_duration: ['p(95)<1000'],  // 95% of requests under 1s
  checks: ['rate>0.95'],              // more than 95% of checks pass
};
