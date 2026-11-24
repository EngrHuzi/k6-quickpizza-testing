// TEST 01 - SMOKE: are the application and its public catalog endpoints alive?
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { BASE_URL, COMMON_THRESHOLDS } from '../lib/config.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    ...COMMON_THRESHOLDS,
    http_req_failed: ['rate<0.30'], // TC-03 intentionally requests a missing route (404)
  },
};

export default function () {
  group('TC-01 Home page loads', () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'returns HTML': (r) => (r.headers['Content-Type'] || '').includes('text/html'),
      'body is not empty': (r) => r.body && r.body.length > 0,
    });
  });

  group('TC-02 Catalog endpoints respond', () => {
    for (const endpoint of ['quotes', 'names']) {
      const res = http.get(`${BASE_URL}/api/${endpoint}`, { tags: { name: `GET /api/${endpoint}` } });
      check(res, {
        [`${endpoint}: status is 200`]: (r) => r.status === 200,
        [`${endpoint}: valid JSON`]: (r) => {
          try { r.json(); return true; } catch (e) { return false; }
        },
        [`${endpoint}: responds < 500ms`]: (r) => r.timings.duration < 500,
      });
    }
  });

  group('TC-03 Unknown route is handled', () => {
    const res = http.get(`${BASE_URL}/api/does-not-exist`, {
      tags: { name: 'GET unknown' },
      responseCallback: http.expectedStatuses(404, 405),
    });
    check(res, { 'status is 404 or 405': (r) => r.status === 404 || r.status === 405 });
  });

  sleep(1);
}
