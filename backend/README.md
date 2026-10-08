# Smart Classroom backend

FastAPI backend for the existing Next.js classroom dashboard. **CURRENT: all readings, device states, and security events are demo/in-memory values. No ESP32, relay, GSM module, or database is connected.** Restarting the server resets them.

## Install and run

Requires Python 3.10+.

```powershell
cd backend
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

API base URL: `http://127.0.0.1:8000`; Swagger: `http://127.0.0.1:8000/docs`; ReDoc: `/redoc`; health: `/health`.

`CORS_ORIGINS` is a comma-separated allowlist. By default it allows the two usual local Next.js origins on port 3000. Set `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api` in the frontend `.env.local` when connecting the dashboard.

## Endpoints

All API routes use `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sensors` | Current temperature, humidity, motion, occupancy, light level (demo). |
| POST | `/sensors` | Simulated ingestion for validating the future ESP32 JSON contract; not required by the UI. |
| GET | `/energy` | Demo INA219-like voltage/current, calculated power, consumed/saved energy. |
| GET | `/devices` | Simulated independent light_1, light_2, fan_1, fan_2, and buzzer states. |
| POST | `/devices/control` | Change one simulated device state by device ID. |
| GET | `/history/sensors` | Mock historical temperature, humidity, light level, and power samples. |
| GET | `/history/energy` | Mock historical power, energy consumed, and energy saved samples. |
| GET | `/alerts` | Recent simulated security events. |
| POST | `/alerts/simulate` | Create a demo PIR security alert and buzzer event. |
| POST | `/alerts/{alert_id}/acknowledge` | Acknowledge a known alert. |
| POST | `/automation/evaluate` | Run the demo automation rules against current mock values. Optional query: `restricted_hours=true/false`. |

### Example requests and responses

`GET /api/sensors`

```json
{"temperature":26.4,"humidity":61,"motion":true,"occupancy":true,"light_level":420}
```

`GET /api/energy`

```json
{"voltage":9.02,"current":0.84,"power":7.58,"energy_consumed":0.68,"energy_saved":0.76}
```

Power is computed as voltage × current and rounded to two decimal places. All fields are demo data, not measurements.

`POST /api/devices/control`

```json
{"device_id":"fan_1","action":"ON"}
```

`device_id` accepts `light_1`, `light_2`, `fan_1`, `fan_2`, or `buzzer`; `action` accepts `ON`, `OFF`, or `AUTO` (AUTO is rejected for buzzer). Invalid enum values and extra fields return validation errors. The response identifies only the changed mock device:

```json
{"device_id":"fan_1","status":"ON","mode":"MANUAL"}
```

`GET /api/devices`

```json
{"light_1":{"status":"ON","mode":"AUTO"},"light_2":{"status":"OFF","mode":"AUTO"},"fan_1":{"status":"ON","mode":"AUTO"},"fan_2":{"status":"OFF","mode":"MANUAL"},"buzzer":{"status":"OFF","mode":"MANUAL"}}
```

`GET /api/history/sensors` returns an array such as `{"time":"10:30","temperature":25.8,"humidity":59,"light_level":390,"power":6.1}`. `GET /api/history/energy` returns an array such as `{"label":"06 AM","power":1.2,"energy_consumed":1.2,"energy_saved":0.4}`. Both responses are mock historical data served by the provider layer; the dashboard charts obtain them through these APIs.

`GET /api/alerts` returns an array. An event includes `id`, `type`, `message`, `severity`, UTC `timestamp`, and `acknowledged`, plus compatibility fields consumed by the current Security page. Alert simulation does not send SMS; GSM status shown in the existing UI remains explicitly client-side simulation.

`POST /api/automation/evaluate?restricted_hours=true` runs occupancy based appliance settings, temperature based fan behavior, and restricted-hours/darkness alert logic. It returns the updated simulated device states.

Demo rule thresholds: an occupied room with temperature at least 28 °C can turn an AUTO fan on; an occupied room below 300 lux can turn an AUTO light on; an empty room turns AUTO fan/light off. Motion creates a simulated security event during restricted hours (default 6 PM–7 AM) or below 150 lux. These are prototype thresholds, not hardware safety controls.

`POST /api/sensors` example future payload:

```json
{"temperature":27.1,"humidity":64,"motion":false,"light_level":510,"voltage":8.97,"current":0.72}
```

This currently updates only in-memory demo readings and energy voltage/current. Occupancy is derived from motion in this simulated endpoint. Out-of-range values, missing fields, and unexpected keys are rejected.

## Data flow and integration

The route layer depends on `ClassroomProvider` in `app/mock/provider.py`, rather than embedding values in endpoints. `MockClassroomProvider` is the current implementation. Future sensor, device, and history implementations can replace it behind these stable response schemas. Device control currently modifies only independent mock state; no physical device is controlled.

Automation rules live separately under `app/services/automation.py`. They describe occupancy, comfort, and restricted-hours/night-security logic for the prototype; they do not energize physical loads. Use only an appropriately supervised low-voltage prototype during hardware work.

### Later phases

- **PostgreSQL:** add persistence/repository implementation behind provider/service interfaces, migrations, and configuration. Preserve response schemas so UI contracts stay stable.
- **Real ESP32:** replace simulated ingestion/provider behavior with authenticated device ingestion and command delivery; validate device identity and distinguish requested command from confirmed actuator state. Do not expose device control to untrusted networks.
- **Not implemented now:** PostgreSQL/ORM, authentication/authorization, SMS/GSM delivery, real relay switching, hardware transport, historical telemetry persistence, or production deployment configuration.

## Structure

```text
backend/
  app/
    api/routes/classroom.py  REST endpoints
    core/config.py           environment configuration and CORS origins
    mock/provider.py         in-memory demo provider and provider contract
    schemas/classroom.py     request/response validation models
    services/automation.py   separate demo automation rules
    main.py                  FastAPI application
  requirements.txt
  .env.example
```
