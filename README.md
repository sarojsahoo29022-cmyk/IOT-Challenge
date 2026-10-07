# Smart Classroom IoT Dashboard

A Next.js dashboard for monitoring a smart classroom. The current interface uses sample sensor readings and simulated device and GSM security events; it does not require a hardware connection to run locally.

## Requirements

- Node.js 20.9 or later
- pnpm 12.3.4 (the version specified by this project)

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The development server reloads when you edit the source files. Stop it with `Ctrl+C`.

## Production build

```bash
pnpm build
pnpm start
```

The production server also listens on port 3000 by default. Set the `PORT` environment variable to use a different port.

## Project scripts

- `pnpm dev` — run the local development server
- `pnpm build` — create a production build
- `pnpm start` — serve the production build

No environment variables are required for the current demo.
