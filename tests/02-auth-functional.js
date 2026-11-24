// TEST 02 - FUNCTIONAL: user registration and login (positive + negative cases)
import http from 'k6/http';
import { check, group } from 'k6';
import { BASE_URL, JSON_HEADERS } from '../lib/config.js';
import { uniqueUsername, register, login } from '../lib/helpers.js';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    checks: ['rate==1.0'], // functional test: every check must pass
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const username = uniqueUsername();
  const password = 'Passw0rd!123';

  group('TC-04 Register a new user', () => {
    const res = register(username, password);
    check(res, { 'registration returns 201': (r) => r.status === 201 });
  });

  group('TC-05 Login with valid credentials', () => {
    const res = login(username, password);
    check(res, {
      'login returns 200': (r) => r.status === 200,
      'response contains a token': (r) => {
        try { const t = r.json('token'); return typeof t === 'string' && t.length > 0; }
        catch (e) { return false; }
      },
    });
  });

  group('TC-06 Login with wrong password is rejected', () => {
    const res = http.post(`${BASE_URL}/api/users/token/login`,
      JSON.stringify({ username, password: 'wrong-password' }),
      { headers: JSON_HEADERS, responseCallback: http.expectedStatuses(400, 401, 403) });
    check(res, { 'status is 401 (unauthorized)': (r) => r.status === 401 });
  });

  group('TC-07 Login with unknown user is rejected', () => {
    const res = http.post(`${BASE_URL}/api/users/token/login`,
      JSON.stringify({ username: 'ghost_user_' + Date.now(), password: 'whatever' }),
      { headers: JSON_HEADERS, responseCallback: http.expectedStatuses(400, 401, 403) });
    check(res, { 'status is 401 (unauthorized)': (r) => r.status === 401 });
  });

  group('TC-08 Register with empty body is rejected', () => {
    const res = http.post(`${BASE_URL}/api/users`, JSON.stringify({}),
      { headers: JSON_HEADERS, responseCallback: http.expectedStatuses({ min: 400, max: 499 }) });
    check(res, { 'status is 4xx': (r) => r.status >= 400 && r.status < 500 });
  });
}
