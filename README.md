# Project Garden

Project Garden is a personal MVP for tending your software life: projects, ideas, suggestions, and experiments all in one calm little dashboard.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- SQLite via `better-sqlite3`

## Getting started

```bash
npm install
npm run seed
npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` – start the development server
- `npm run build` – build for production
- `npm run start` – run the production server
- `npm run seed` – populate `garden.db` with realistic sample data
- `npm run lint` – run ESLint

## Database

The app stores data in `garden.db` at the project root using `process.cwd()` so it works in both development and production contexts.

Tables created automatically on first run:

- `projects`
- `ideas`
- `suggestions`
- `experiments`

## API routes

- `GET/POST /api/projects`
- `GET/PUT/DELETE /api/projects/[id]`
- `POST /api/projects/[id]/log`
- `GET/POST /api/ideas`
- `GET/PUT/DELETE /api/ideas/[id]`
- `GET/POST /api/suggestions`
- `GET/PUT/DELETE /api/suggestions/[id]`
- `GET/POST /api/experiments`
- `GET/PUT/DELETE /api/experiments/[id]`
- `GET /api/recommendations`

`/api/suggestions` supports `?q=` and `?tag=` filters. `/api/recommendations` returns 3 project recommendations based on interest, priority, and how long it has been since you last worked on something.

## Notes

- This is intentionally a simple MVP with direct SQL queries and no ORM.
- Deleting a project keeps related ideas, suggestions, and experiments by nulling their `project_id` foreign key.
