# Contributing to Best Cars Dealership Platform

Thank you for your interest in contributing to **AutoSphere — Best Cars Dealership Platform**! This document outlines the contribution workflow, coding standards, and guidelines for submitting changes.

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Branching Strategy](#branching-strategy)
3. [Commit Convention](#commit-convention)
4. [Pull Request Process](#pull-request-process)
5. [Code Standards](#code-standards)
6. [Testing Requirements](#testing-requirements)
7. [Architecture Overview](#architecture-overview)

---

## Development Setup

### Prerequisites
- Docker Desktop 4.x+
- Docker Compose V2
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local Django dev)

### Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/AbhishekPattnaik124/xrwvm-fullstack_developer_capstone.git
cd xrwvm-fullstack_developer_capstone/server

# 2. Copy and configure environment
cp .env.example djangoapp/.env
# Edit djangoapp/.env with your values

# 3. Launch all services
docker compose --profile dev up --build
```

App is live at **http://localhost** (via Nginx gateway).

---

## Branching Strategy

We use **trunk-based development** with short-lived feature branches:

| Branch Pattern | Purpose |
|---|---|
| `main` | Production-ready code. Protected. |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `chore/<name>` | Dependency updates, refactors |
| `docs/<name>` | Documentation changes |

**Never push directly to `main`.** Always open a Pull Request.

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Formatting only
- `refactor` — Code restructure without feature change
- `test` — Tests added/modified
- `chore` — Tooling, dependencies

**Examples:**
```
feat(booking): add cancellation endpoint
fix(sentiment): handle empty review texts in batch analysis
docs(api): update Swagger descriptions for /api/v1/leaderboard
chore(deps): upgrade Django to 4.2.9
```

---

## Pull Request Process

1. **Fork** the repository and create a feature branch.
2. **Implement** your changes with appropriate tests.
3. **Run** the full test suite locally:
   ```bash
   cd server
   python manage.py test           # Django unit tests
   cd frontend && npm test         # React component tests
   docker compose config --quiet   # Validate compose file
   ```
4. **Open a PR** with:
   - A clear title following commit convention
   - Description of what changed and why
   - Screenshots/recordings for UI changes
   - Reference to any related issue: `Closes #123`
5. **Request review** from at least one maintainer.
6. All CI checks must pass before merge.

---

## Code Standards

### Python / Django
- Follow **PEP 8** style
- Use type hints for all function signatures
- No bare `except` clauses — always catch specific exceptions
- Remove all `print()` statements — use `logger.debug/info/warning/error()`
- Docstrings required for all views, models, and utility functions

### JavaScript / Node.js
- Use `const`/`let` only — no `var`
- Async/await over raw Promise chains
- Structured JSON logging: `console.log(JSON.stringify({...}))`
- All routes must have a try/catch error handler
- Input validation on all POST endpoints

### React / Frontend
- Functional components only — no class components (except ErrorBoundary)
- All routes must be lazy-loaded via `React.lazy()`
- No inline styles — use CSS custom properties from `tokens.css`
- Unique `id` attributes on all interactive elements

---

## Testing Requirements

| Layer | Framework | Minimum Coverage |
|---|---|---|
| Django views | `pytest-django` | 80% |
| Django models | `pytest-django` | 100% |
| Node.js APIs | `jest` + `supertest` | 70% |
| React components | `jest` + `@testing-library/react` | 60% |

---

## Architecture Overview

```
User → Nginx Gateway (80)
         ├── Django Hub (8000)        — Python/Django, REST API, JWT auth
         ├── Dealer API (3030)        — Node.js/Express, MongoDB, Socket.IO
         ├── Inventory API (3050)     — Node.js/Express, MongoDB, NL search
         ├── Sentiment Service (5050) — Flask, distilbert + VADER
         ├── Booking Service (3060)   — Node.js/Express, MongoDB
         ├── Notification Svc (3080)  — Node.js, Socket.IO, Redis pub/sub
         ├── Audit Service (3090)     — Node.js, MongoDB, Redis subscriber
         └── Recommend Service (3070) — Flask, TF-IDF + Ridge Regression
```

All services communicate internally via the `bestcars-net` Docker network.

---

## Questions?

Open a [GitHub Discussion](https://github.com/AbhishekPattnaik124/xrwvm-fullstack_developer_capstone/discussions) or ping the maintainers in the issue tracker.
