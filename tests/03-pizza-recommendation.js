// TEST 03 - FUNCTIONAL: pizza recommendation module (POST /api/pizza)
import http from 'k6/http';
import { check, group } from 'k6';
import { BASE_URL, JSON_HEADERS } from '../lib/config.js';
import { createUserAndGetToken, authHeaders, DEFAULT_RESTRICTIONS } from '../lib/helpers.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ['rate==1.0'],
    http_req_duration: ['p(95)<1500'],
  },
};

export function setup() {
  const { token } = createUserAndGetToken();
  if (!token) throw new Error('Setup failed: could not obtain auth token. Is QuickPizza running?');
  return { token };
}

const denied = http.expectedStatuses(401, 403);

export default function (data) {
  const url = `${BASE_URL}/api/pizza`;

  group('TC-09 Recommendation with valid restrictions', () => {
    const res = http.post(url, JSON.stringify(DEFAULT_RESTRICTIONS), { headers: authHeaders(data.token) });
    check(res, {
      'status is 200': (r) => r.status === 200,
      'has pizza object': (r) => !!r.json('pizza'),
      'pizza has a name': (r) => !!r.json('pizza.name'),
      'pizza has ingredients': (r) => Array.isArray(r.json('pizza.ingredients')) && r.json('pizza.ingredients').length > 0,
    });
  });

  group('TC-10 Vegetarian restriction is accepted', () => {
    const body = { ...DEFAULT_RESTRICTIONS, mustBeVegetarian: true };
    const res = http.post(url, JSON.stringify(body), { headers: authHeaders(data.token) });
    check(res, {
      'status is 200': (r) => r.status === 200,
      'pizza returned': (r) => !!r.json('pizza'),
    });
  });

  group('TC-11 Custom pizza name is returned', () => {
    const body = { ...DEFAULT_RESTRICTIONS, customName: 'K6 Special' };
    const res = http.post(url, JSON.stringify(body), { headers: authHeaders(data.token) });
    check(res, {
      'status is 200': (r) => r.status === 200,
      'name contains custom name': (r) => String(r.json('pizza.name')).includes('K6 Special'),
    });
  });

  group('TC-12 Request without token is rejected', () => {
    const res = http.post(url, JSON.stringify(DEFAULT_RESTRICTIONS), { headers: JSON_HEADERS, responseCallback: denied });
    check(res, { 'status is 401 or 403': (r) => r.status === 401 || r.status === 403 });
  });

  group('TC-13 Request with invalid token is rejected', () => {
    const res = http.post(url, JSON.stringify(DEFAULT_RESTRICTIONS), { headers: authHeaders('invalid-token-123'), responseCallback: denied });
    check(res, { 'status is 401 or 403': (r) => r.status === 401 || r.status === 403 });
  });

  group('TC-14 Impossible restrictions do not crash the server', () => {
    const body = { ...DEFAULT_RESTRICTIONS, maxCaloriesPerSlice: 1, minNumberOfToppings: 50, maxNumberOfToppings: 50 };
    const res = http.post(url, JSON.stringify(body), { headers: authHeaders(data.token), responseCallback: http.expectedStatuses({ min: 200, max: 499 }) });
    check(res, { 'server responded (no connection error)': (r) => r.status !== 0 });
  });
}
