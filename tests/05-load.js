// TEST 05 - LOAD: realistic traffic, ramp up -> hold -> ramp down
import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, COMMON_THRESHOLDS } from '../lib/config.js';
import { createUserAndGetToken, authHeaders, DEFAULT_RESTRICTIONS } from '../lib/helpers.js';

export const options = {
  stages: [
    { duration: '20s', target: 10 }, // ramp up
    { duration: '40s', target: 10 }, // steady load
    { duration: '10s', target: 0 },  // ramp down
  ],
  thresholds: {
    ...COMMON_THRESHOLDS,
    'http_req_duration{name:POST /api/pizza}': ['p(95)<1500'],
  },
};

export function setup() {
  const { token } = createUserAndGetToken();
  if (!token) throw new Error('Setup failed: no token. Is QuickPizza running?');
  return { token };
}

export default function (data) {
  const home = http.get(`${BASE_URL}/`, { tags: { name: 'GET /' } });
  check(home, { 'home 200': (r) => r.status === 200 });

  const res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(DEFAULT_RESTRICTIONS), {
    headers: authHeaders(data.token),
    tags: { name: 'POST /api/pizza' },
  });
  check(res, { 'pizza 200': (r) => r.status === 200, 'pizza present': (r) => !!r.json('pizza') });

  sleep(1);
}
