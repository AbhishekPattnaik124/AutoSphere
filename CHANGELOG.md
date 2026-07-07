# Changelog

All notable changes to the **AutoSphere — Best Cars Dealership Platform** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [2.1.0] — 2026-07-04 — God-Tier Polish Release

### Fixed
- `views.py` — Removed 2 debug `print()` statements; replaced with structured `logger.debug()` calls
- `restapis.py` — Removed duplicate `load_dotenv()` call (was called twice on import)
- `populate.py` — Fixed incorrect car types: Mercedes A-Class, C-Class, E-Class are now correctly typed as `SEDAN` instead of `SUV`
- `App.js` — Fixed 10 page components that existed in `/pages/` but were **not routed** (CarComparison, DealerLeaderboard, LiveInventory, AuditLogs, ApiKeys, AppointmentBooking, Notifications, InventoryHealth, SeedControl)
- `djangoproj/urls.py` — Replaced 12 individual SPA route entries with a single regex catch-all, ensuring all current and future React routes work without manual addition
- `database/app.js` — Fixed seeding logic that wiped all data on every container restart; now checks if data exists before seeding

### Added
- `ErrorBoundary.jsx` — New React class component that catches all rendering errors and shows a premium error UI instead of a blank screen
- `carsInventory/app.js` — Added `/cars/market-trends` aggregate endpoint (used by Django dashboard-stats view)
- `models.py` — Added 5 new car types: COUPE, HATCHBACK, TRUCK, MINIVAN, CONVERTIBLE
- `models.py` — Added `country_of_origin` and `founded_year` fields to `CarMake` model
- `models.py` — Updated year validator from 2015–2023 to 2015–2026
- `api_urls.py` — Added all missing versioned endpoints: leaderboard, book, user-bookings, system-health, dashboard-stats, summarize
- `CONTRIBUTING.md` — Created contributor guide (was referenced in README but missing)
- `CHANGELOG.md` — This file
- All microservices — Upgraded `/health` endpoints to return structured data matching Django health aggregator format

### Changed
- `views.py` — `get_leaderboard` now uses batch sentiment analysis (1 API call per dealer) instead of 1 call per review — significant performance improvement
- `views.py` — `get_system_health` now monitors all 8 services (added notification, audit, recommend services)
- `restapis.py` — `analyze_batch()` now returns neutral fallback for all items on error instead of empty list
- `admin.py` — Switched to `@admin.register` decorator, changed `StackedInline` → `TabularInline`, `extra=5` → `extra=1`, added `search_fields` and `list_filter`
- `settings.py` — CORS is now locked to explicit origins in production mode; `JsonFormatter` is wired into the logging config
- `populate.py` — Completely rewritten: 7 brands, 35 models, proper car types, distinct brand descriptions, year 2024
- `index.js` — Added `React.StrictMode` wrapper for better development-time error detection

---

## [2.0.0] — Initial Enterprise Release

### Added
- Enterprise-grade microservices architecture (7 services)
- AI sentiment analysis via distilbert-base-uncased-finetuned-sst-2-english
- Real-time Socket.IO review broadcasting
- Circuit breaker (CLOSED → OPEN → HALF-OPEN) in Django Hub
- Redis caching (dealer list + sentiment results)
- JWT authentication (15min access + 7day refresh + httpOnly cookies)
- RBAC decorators (Guest / Customer / DealerAdmin)
- OpenAPI / Swagger UI at `/api/docs/`
- Nginx API gateway with rate limiting + CSP headers + trace IDs
- Docker Compose orchestration for all 8 services
- Kubernetes `deployment.yaml`
- 20+ React pages with lazy loading + code splitting
- Design system with CSS custom properties and glassmorphism
- Health dashboard polling all services
- Dealer leaderboard with composite Trust Score algorithm
- AI recommendations (TF-IDF cosine similarity)
- Price predictor (Ridge Regression)
- Appointment booking microservice
- Real-time notification service (Redis pub/sub + Socket.IO + email)
- Centralized audit logging service
- VIN decoder (NHTSA vPIC API)
- Natural language car search

---

[2.1.0]: https://github.com/AbhishekPattnaik124/xrwvm-fullstack_developer_capstone/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AbhishekPattnaik124/xrwvm-fullstack_developer_capstone/releases/tag/v2.0.0
