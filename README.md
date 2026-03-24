# CosmicSleep - Space Weather & Sleep Tracker

A citizen science dashboard exploring correlations between geomagnetic activity and human sleep patterns. Aggregates real-time space weather data from NOAA SWPC and crowdsourced sleep reports into an interactive visualization platform.

**Live at [sleep.devinbutts.net](https://sleep.devinbutts.net)**

## What It Does

- Syncs live space weather data from [NOAA SWPC](https://services.swpc.noaa.gov/json/) every 5 minutes (Kp index, solar wind, aurora intensity, flare probabilities, 45-day forecasts, solar radio flux)
- Lets visitors anonymously report their sleep quality and hours each day
- Runs Pearson correlation and linear regression analysis between geomagnetic activity and sleep data

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Database | SQLite + Drizzle ORM |
| Charting | Recharts + D3 (aurora heatmap) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Validation | Zod |
| Deployment | Docker Compose + Cloudflare Tunnel |

## NOAA Data Sources

| Endpoint | Data |
|----------|------|
| `planetary_k_index_1m.json` | Kp index (geomagnetic disturbance, 0-9) |
| `45-day-forecast.json` | Ap index + F10.7 solar flux forecasts |
| `ovation_aurora_latest.json` | Aurora intensity by lat/lon |
| `enlil_time_series.json` | Solar wind (density, velocity, magnetic field) |
| `solar_probabilities.json` | Flare probabilities (C/M/X class) |
| `solar-radio-flux.json` | Multi-frequency solar radio observations |

