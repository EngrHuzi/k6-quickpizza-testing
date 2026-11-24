# Presentation / Report Guide (with screenshot checklist)

## Slide outline
1. **Title** - Testing QuickPizza with Grafana k6 (names, course)
2. **What is k6?** - Open-source load/performance and functional testing tool by Grafana Labs. Tests are written as JavaScript; the engine is written in Go. CLI-based, runs locally or in CI or Grafana Cloud.
3. **How k6 works** - Script (JS) -> k6 engine (Go) -> Virtual Users (VUs) run the `default` function repeatedly -> metrics -> checks + thresholds decide pass/fail. Lifecycle: init -> setup() -> default() -> teardown().
4. **Key concepts** - `options`, `check`, `group`, `thresholds`, `stages`, `tags`.
5. **Installation** - where downloaded (grafana.com docs / GitHub releases), command used, `k6 version`.
6. **Application under test** - QuickPizza on GitHub, how it was cloned/run with Docker.
7. **Module and test design** - table of test cases (below).
8. **Languages used** - JavaScript (test scripts), YAML (docker-compose), JSON (payloads), Go (k6 and QuickPizza internals).
9. **Live demo** - smoke -> functional -> e2e -> load with dashboard.
10. **Results and analysis** - pass/fail, p95, error rate, observations.
11. **Pros/cons of k6** - Pros: scriptable in JS, lightweight, CI-friendly, thresholds, great metrics. Cons: no real browser by default (browser module exists), no GUI recorder in the CLI, JS runtime is not Node (no npm packages by default).
12. **Conclusion**

## Test case table
| ID | Test case | Expected result |
|----|------|-----------------|
| TC-01 | Home page loads | 200, HTML |
| TC-02 | Public catalog endpoints (quotes/names) | 200, valid JSON, <500ms |
| TC-03 | Unknown route | 404/405 |
| TC-04 | Register new user | 201 |
| TC-05 | Login valid credentials | 200 + token |
| TC-06 | Login wrong password | 401 |
| TC-07 | Login unknown user | 401 |
| TC-08 | Register with empty body | 4xx |
| TC-09 | Pizza with valid restrictions | 200, pizza + ingredients |
| TC-10 | Vegetarian restriction | 200 |
| TC-11 | Custom pizza name | name contains custom name |
| TC-12 | No token | 401/403 |
| TC-13 | Invalid token | 401/403 |
| TC-14 | Impossible restrictions | server responds, no crash |
| E2E | Register -> Login -> Pizza -> Rate -> Ratings | all steps pass |
| LOAD | 10 VUs for 70s | p95 < 1.5s, errors < 5% |
| STRESS | up to 100 VUs | errors < 10%, p95 < 3s |

## Screenshot checklist (put one per step in the report)
1. k6 download page / docs install page
2. Install command running in terminal
3. `k6 version` output
4. Git clone of this project (and the QuickPizza GitHub page)
5. `docker compose up -d` output and Docker Desktop showing the container
6. Browser at http://localhost:3333 (app running) and clicking "Pizza, Please!"
7. Project folder opened in VS Code (tests/ and lib/)
8. Code of `01-smoke-api.js`, then its run output
9. `02-auth-functional.js` code and output
10. `03-pizza-recommendation.js` code and output
11. `04-e2e-user-journey.js` output
12. Load test with live dashboard (http://localhost:5665) - overview and timings tabs
13. Final summary (checks, thresholds, http_req_duration) of load test
14. Stress test result
15. Saved HTML report in `reports/`
16. (Optional) a deliberately failing test, e.g. change an expected status to 500, to show red failures

## Optional manual API check (curl)
```bash
curl -i http://localhost:3333/api/quotes
curl -i -X POST http://localhost:3333/api/users -H "Content-Type: application/json" -d '{"username":"demo1","password":"Passw0rd!123"}'
curl -i -X POST http://localhost:3333/api/users/token/login -H "Content-Type: application/json" -d '{"username":"demo1","password":"Passw0rd!123"}'
```

## Live-demo order (about 6 minutes)
1. `docker compose up -d` + show the app in the browser
2. `k6 run tests/01-smoke-api.js`
3. `k6 run tests/03-pizza-recommendation.js`
4. `k6 run tests/04-e2e-user-journey.js`
5. Load test with dashboard, explain graphs while it runs
