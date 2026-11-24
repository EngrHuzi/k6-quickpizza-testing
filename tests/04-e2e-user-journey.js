// TEST 04 - END-TO-END: register -> login -> get pizza -> rate pizza -> read ratings
import http from 'k6/http';
import { check, group } from 'k6';
import { BASE_URL, COMMON_THRESHOLDS } from '../lib/config.js';
import { uniqueUsername, register, login, authHeaders, DEFAULT_RESTRICTIONS } from '../lib/helpers.js';

export const options = {
  vus: 1,
  iterations: 3,
  thresholds: COMMON_THRESHOLDS,
};

export default function () {
  const username = uniqueUsername();
  const password = 'Passw0rd!123';
  let token, pizzaId;

  group('Step 1 - Register', () => {
    check(register(username, password), { 'registered (201)': (r) => r.status === 201 });
  });

  group('Step 2 - Login', () => {
    const res = login(username, password);
    token = res.json('token');
    check(res, { 'logged in (200)': (r) => r.status === 200, 'token received': () => !!token });
  });

  group('Step 3 - Get a pizza recommendation', () => {
    const res = http.post(`${BASE_URL}/api/pizza`, JSON.stringify(DEFAULT_RESTRICTIONS), { headers: authHeaders(token) });
    pizzaId = res.json('pizza.id');
    check(res, { 'pizza received (200)': (r) => r.status === 200, 'pizza has id': () => pizzaId !== undefined });
  });

  group('Step 4 - Rate the pizza', () => {
    const res = http.post(
      `${BASE_URL}/api/ratings`,
      JSON.stringify({ stars: 5, pizza_id: pizzaId }),
      { headers: authHeaders(token), tags: { name: 'POST /api/ratings' } }
    );
    check(res, { 'rating accepted (200/201)': (r) => r.status === 200 || r.status === 201 });
  });

  group('Step 5 - Read own ratings', () => {
    const res = http.get(`${BASE_URL}/api/ratings`, { headers: authHeaders(token), tags: { name: 'GET /api/ratings' } });
    check(res, { 'ratings list (200)': (r) => r.status === 200 });
  });
}
