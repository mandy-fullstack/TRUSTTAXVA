# Running TrustTax App

## Quick Start
Run the following command in your terminal:
```bash
pnpm dev
```

## Troubleshooting

### Database Connection Failed
If you see `P1000: Authentication failed`, it means Postgres is not running or credentials are wrong.

**Solution 1: Start Postgres**
Make sure Postgres is running on port 5432 with user `postgres` and password `postgres`.

**Solution 2: Use SQLite (Dev Only)**
If you don't have Postgres, ask the agent to switch to SQLite.

### URLs
- **Web**: http://localhost:5175
- **API**: http://localhost:4000
