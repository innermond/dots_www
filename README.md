# dots_www

Frontend web application for **dots.volt.com** — an internal back-office tool for tracking companies and their stock/inventory depletion. Built with [SolidJS](https://www.solidjs.com/) and served through an nginx Docker container.

## What it does

DOTS manages, per **company**:

- **Entry types** — a catalog of goods/materials, each with a code, description, and unit of measure.
- **Deeds** — source documents (e.g. delivery/receipt notes) that generate stock movements. *(Only stubbed in the UI so far — not yet wired into routing.)*
- **Entries** — the resulting quantity movements recorded against an entry type.
- **Depletion** — reporting on initial vs. drained quantity per entry type, so stock loss/consumption can be tracked over time.

Authenticated users land on a dashboard shell (app bar + nav drawer) with a company picker, and can browse/search/paginate entry types and companies, add/edit/delete records through modal forms, and see per-company statistics and depletion charts.

## Project structure

```
.
├── docker-compose.yml       # dots_www service definition
├── Dockerfile                # nginx image, copies files/ into the container root
├── LICENSE                    # MIT
├── files/                     # files baked into the nginx image
│   └── etc/
│       ├── nginx/nginx.conf         # base nginx config
│       ├── nginx/conf.d/site.conf   # vhost config for www.dots.volt.com
│       └── ssl/certs/               # TLS certs/keys for the site
└── www/                       # SolidJS application source
    ├── src/
    │   ├── App.tsx                  # router + theme + toaster + global loading overlay
    │   ├── index.tsx                 # app entry point
    │   ├── theme.ts, theme-option.ts,
    │   │   palette.ts, typography.ts  # SUID (MUI-for-Solid) theme, Ant Design palette
    │   ├── api/                       # typed API calls (company, entry-type)
    │   ├── lib/
    │   │   ├── api/                    # fetch wrapper: auth, camelCase mapping, ApiError
    │   │   ├── form/                    # Validable<T> state + composable validators
    │   │   ├── app.ts                    # global app store (page title, current company)
    │   │   ├── toast.tsx                  # solid-toast helpers
    │   │   └── customevent.ts(x)           # typed custom DOM events (list refresh, etc.)
    │   ├── contexts/                  # ActionFormContext, DialogContext (form/dialog state)
    │   ├── components/
    │   │   ├── ActionBar.tsx, ActionButton.tsx,
    │   │   │   ActionForm.tsx, AlertDialog.tsx    # generic CRUD dialog/form engine
    │   │   ├── filter/                              # column visibility + search/sort filter popovers
    │   │   ├── MainCard.tsx, Loading.tsx, Progress.tsx,
    │   │   │   Skeleton.tsx, ErrorMessage.tsx, ...   # shared UI pieces
    │   └── pages/
    │       ├── routes.tsx              # route table + auth guard (token in sessionStorage)
    │       ├── login/                   # LoginForm
    │       ├── dashboard/                # Dashboard shell, nav items, StatisticsCard
    │       ├── company/                  # Company list + CompanyDetails (stats, depletion)
    │       ├── entry-types/               # Entry type list + add/edit/detail CRUD
    │       ├── deed/                       # DeedNew (stub, not yet routed)
    │       └── 404.tsx
    ├── public/                  # static assets served as-is
    ├── dist/                    # production build output (generated)
    └── distant/                  # build output copied here for deployment (generated)
```

## Tech stack

- [SolidJS](https://www.solidjs.com/) + [@solidjs/router](https://github.com/solidjs/solid-router)
- [SUID](https://suid.io/) (Material UI components for Solid), themed with [@ant-design/colors](https://github.com/ant-design/ant-design-colors)
- [solid-toast](https://github.com/wobsoriano/solid-toast) for notifications
- [Vite](https://vitejs.dev/) for dev server and bundling, with `@` → `src/` and `@icons` → SUID icons path aliases
- TypeScript
- nginx for serving the built static site, in Docker

## Prerequisites

- Node.js and a package manager (npm or pnpm — both `package-lock.json` and `pnpm-lock.yaml` are present)
- Docker + Docker Compose, for building/running the served container
- An external Docker network named `dots_proxy_net` (referenced by `docker-compose.yml`)

## Development

```bash
cd www
npm install       # or pnpm install
npm run dev       # starts the Vite dev server on http://localhost:3000
```

`www/.env` declares `VITE_API_URL=api.dots.volt.com/v1`, but the API base URL is currently hardcoded in `src/lib/api/api.ts` (`http://api.dots.volt.com/v1`) rather than read from this env var — update the source if you need to point at a different backend.

Auth token is stored in `sessionStorage['dots.tok']` after a successful `/login` call; the router guard in `src/pages/routes.tsx` redirects to `/login` when it's missing or the API returns 401.

### Available scripts (from `www/`)

| Script          | Description                                                        |
| --------------- | -------------------------------------------------------------------- |
| `npm run dev`    | Start the Vite dev server                                            |
| `npm run build`  | Type-check and build for production into `dist/`                      |
| `npm run serve`  | Preview the production build locally                                   |
| `npm run clean`  | Remove build output in `dist/`                                          |
| `npm run dist`   | Clean, build, and copy the output into `distant/` (deployment dir)       |

## Deployment

The `distant/` folder (produced by `npm run dist`) is mounted into the nginx container as the served web root:

```bash
cd www
npm run dist
cd ..
docker compose up -d --build
```

The `dots_www` service:

- Builds an nginx image from `Dockerfile`, using the config and TLS certs under `files/`.
- Serves `www/distant` at `/var/www/html/public`.
- Is exposed via `VIRTUAL_HOST=www.dots.volt.com` (`VIRTUAL_PORT=8080` / `VIRTUAL_PORT_SSL=8443`) — no host ports are published directly, so it's expected to sit behind a reverse proxy on the `dots_proxy_net` external Docker network.
- Talks to a backend API expected at `api.dots.volt.com` (mapped via `extra_hosts` for local/dev use).

## Notes

- `src/pages/deed/DeedNew.tsx` is a stub and not yet wired into `routes.tsx` — deed/entry CRUD is still to be built out.
- `src/contexts/DialogContext.tsx` looks like an earlier, more manual predecessor to `ActionFormContext.tsx`/`ActionForm.tsx`; the two overlap in responsibility.
- TLS certificates under `files/etc/ssl/certs/` are for local/dev use; do not treat them as production secrets.
