# Smart Classroom Dashboard

Next.js dashboard with a FastAPI backend. **Current phase: backend and frontend software ready for database integration.** Sensor readings, historical charts, alerts, and device states use mock/demo data. The ESP32, sensors, relays, GSM hardware, and PostgreSQL are not connected or implemented.

The dashboard reads current sensor, energy, device, alert, and historical data from the REST API. Device controls update independent mock states (`light_1`, `light_2`, `fan_1`, `fan_2`, and `buzzer`). The backend keeps the mock providers behind an API/service boundary so future data sources can use the same API contracts.

## Run locally

Run the backend and frontend in separate terminals. No physical hardware is needed.

### Terminal 1: FastAPI backend

Requires Python 3.10+.

```powershell
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`. Interactive API docs are at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### Terminal 2: Next.js dashboard

Requires Node.js 20.9+ and pnpm 12.3.4.

```powershell
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). By default, the frontend calls `http://127.0.0.1:8000/api`, so no frontend environment file is needed for the standard local setup. To use a different backend URL, set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`, for example:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

Stop either development server with `Ctrl+C` in its terminal.

## Production build

```powershell
pnpm build
pnpm start
```

The production frontend listens on port 3000 by default. The FastAPI backend must also be running for live API data and controls.

## Project status and checks

- Mock sensor/device/alert providers and mock historical data are served by FastAPI.
- Historical dashboard charts fetch their data from `/api/history/sensors` and `/api/history/energy`.
- Automation runs against mock readings and mock device states.
- Hardware and database integration are future phases; no real device control or readings occur.
- Backend live HTTP checks, CORS, TypeScript check, and frontend production build have been verified. `pytest` has not been run.

See [backend/README.md](backend/README.md) for API endpoints, example payloads, and backend details.
