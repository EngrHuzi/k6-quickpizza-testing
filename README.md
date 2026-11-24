# Grafana k6 Testing Project - QuickPizza

Testing project for a software-testing presentation using **Grafana k6**.

- **Application under test:** [QuickPizza](https://github.com/grafana/quickpizza) (open source, Go backend + SvelteKit frontend)
- **Module tested:** User Authentication (`/api/users`, `/api/users/token/login`) + Pizza Recommendation (`/api/pizza`) + Ratings (`/api/ratings`) + public catalog endpoints
- **Tool:** Grafana k6 (open-source load and functional testing tool)
- **Test language:** JavaScript (ES6). k6 itself is written in Go.

## 1. Prerequisites

| Tool | Why | Download |
|------|-----|----------|
| Docker Desktop | Runs QuickPizza locally | https://www.docker.com/products/docker-desktop/ |
| k6 | The testing tool | https://grafana.com/docs/k6/latest/set-up/install-k6/ |
| Git | Clone the repo | https://git-scm.com/downloads |

### Install k6
- **Windows:** `winget install k6 --source winget` (or `choco install k6`)
- **macOS:** `brew install k6`
- **Linux (Debian/Ubuntu):** follow the apt instructions at the link above
- **Docker (no install):** `docker run --rm -i grafana/k6 run - <tests/01-smoke-api.js`

Verify: `k6 version`

## 2. Start the application (QuickPizza)

```bash
docker compose up -d
```
Open http://localhost:3333 - you should see the QuickPizza page. (You can also run it directly with
`docker run --rm -it -p 3333:3333 ghcr.io/grafana/quickpizza-local:latest`.)

Stop it later with `docker compose down`.

## 3. Run the tests

From the project root:

| # | Type | Command | Test cases |
|---|------|---------|-----------|
| 1 | Smoke | `k6 run tests/01-smoke-api.js` | TC-01 to TC-03 |
| 2 | Functional - Auth | `k6 run tests/02-auth-functional.js` | TC-04 to TC-08 |
| 3 | Functional - Pizza | `k6 run tests/03-pizza-recommendation.js` | TC-09 to TC-14 |
| 4 | End-to-end | `k6 run tests/04-e2e-user-journey.js` | Register, Login, Pizza, Rate |
| 5 | Load (70s) | `k6 run tests/05-load.js` | 10 virtual users |
| 6 | Stress (70s) | `k6 run tests/06-stress.js` | up to 100 virtual users |

Run everything functional: `npm run test:all` (needs Node only for the npm shortcut; plain `k6 run` needs no Node).

Different target URL: `k6 run -e BASE_URL=http://localhost:3333 tests/01-smoke-api.js`

### Live HTML dashboard (great for the demo)
k6 v0.49+ has a built-in web dashboard.

macOS/Linux:
```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=reports/load-report.html k6 run tests/05-load.js
```
Windows PowerShell:
```powershell
$env:K6_WEB_DASHBOARD="true"; $env:K6_WEB_DASHBOARD_EXPORT="reports/load-report.html"; k6 run tests/05-load.js
```
Open http://localhost:5665 while the test runs. The HTML report is saved to `reports/`.

JSON output: `k6 run --out json=reports/result.json tests/05-load.js`

## 4. How to read the output
- `checks` - assertions (like test-case pass/fail). Green tick = pass.
- `thresholds` - pass/fail criteria for the whole run (e.g. p95 < 1000ms). k6 exits non-zero if one fails.
- `http_req_duration` - response time; look at avg, p(90), p(95).
- `http_req_failed` - percentage of failed requests.
- `iterations`, `vus` - how many times the script ran and with how many virtual users.

## 5. Project structure
```
k6-quickpizza-testing/
  docker-compose.yml        # runs QuickPizza
  lib/config.js             # BASE_URL, thresholds
  lib/helpers.js            # register/login helpers
  tests/01-smoke-api.js
  tests/02-auth-functional.js
  tests/03-pizza-recommendation.js
  tests/04-e2e-user-journey.js
  tests/05-load.js
  tests/06-stress.js
  docs/PRESENTATION_GUIDE.md
  reports/                  # HTML/JSON results go here
```

## 6. Troubleshooting
- `connection refused` -> QuickPizza is not running; run `docker compose up -d` and check http://localhost:3333.
- `Setup failed: no token` -> app not reachable, or API changed; run the manual curl check in docs/PRESENTATION_GUIDE.md.
- A check fails on an endpoint -> open the QuickPizza repo, check the current API, and adjust the status/field in that script.
- Port 3333 busy -> change the mapping in docker-compose.yml and pass `-e BASE_URL=http://localhost:<port>`.
