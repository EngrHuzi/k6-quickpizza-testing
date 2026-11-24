import http from 'k6/http';
import { BASE_URL, JSON_HEADERS } from './config.js';

export function uniqueUsername() {
  const vu = typeof __VU !== 'undefined' ? __VU : 0;
  const iter = typeof __ITER !== 'undefined' ? __ITER : 0;
  return `user_${Date.now()}_${vu}_${iter}_${Math.floor(Math.random() * 100000)}`;
}

// POST /api/users  -> registers a new user
export function register(username, password) {
  return http.post(
    `${BASE_URL}/api/users`,
    JSON.stringify({ username, password }),
    { headers: JSON_HEADERS, tags: { name: 'POST /api/users' } }
  );
}

// POST /api/users/token/login -> returns { token }
export function login(username, password) {
  return http.post(
    `${BASE_URL}/api/users/token/login`,
    JSON.stringify({ username, password }),
    { headers: JSON_HEADERS, tags: { name: 'POST /api/users/token/login' } }
  );
}

// Registers + logs in a fresh user and returns the auth token
export function createUserAndGetToken() {
  const username = uniqueUsername();
  const password = 'Passw0rd!123';
  register(username, password);
  const res = login(username, password);
  let token = null;
  try { token = res.json('token'); } catch (e) { /* handled by caller */ }
  return { username, password, token };
}

export function authHeaders(token) {
  return { 'Content-Type': 'application/json', Authorization: `token ${token}` };
}

export const DEFAULT_RESTRICTIONS = {
  maxCaloriesPerSlice: 1000,
  mustBeVegetarian: false,
  excludedIngredients: [],
  excludedTools: [],
  maxNumberOfToppings: 5,
  minNumberOfToppings: 2,
};
