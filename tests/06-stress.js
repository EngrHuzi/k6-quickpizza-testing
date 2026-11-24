// TEST 06 - STRESS / SPIKE: push beyond normal load to find the breaking point
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../lib/config.js';
import { createUserAndGetToken, authHeaders, DEFAULT_RESTRICTIONS } from '../lib/helpers.js';

export const options = {
  stages: [
    { duration: '15s', target: 20 },
    { duration: '20s', target: 50 },
    { duration: '20s', target: 100 }, // spike
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<3000'],
  },
};

export function setup() {
  const { token } = createUserAndGetToken();
  if (!token) throw new Error('Setup failed: no token. Is QuickPizza running?');
  return { token };
}

export default function (data) {
  const res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(DEFAULT_RESTRICTIONS), {
    headers: authHeaders(data.token),
    tags: { name: 'POST /api/pizza' },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.5);
}
