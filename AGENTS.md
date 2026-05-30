# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-25
**Commit:** 7e5bf1a
**Branch:** main

## OVERVIEW

Wedding invitation app ("undangan_pernikahan"). AdonisJS 7 backend + Edge.js templates + Alpine.js frontend + SQLite.

## STRUCTURE

```
pernikahan/
├── app/
│   ├── controllers/   # HTTP handlers (3 main: invitation, admin, admin_auth)
│   ├── middleware/     # auth, guest, silent_auth, container_bindings
│   ├── models/         # Invitation, Story, Gallery, Guest, User (Lucid ORM)
│   ├── validators/     # VineJS schemas
│   └── exceptions/     # Custom 404/500 error pages
├── config/             # 11 AdonisJS config files (auth, database, session, etc.)
├── database/
│   ├── migrations/     # SQLite schema migrations
│   ├── seeders/        # Seed data
│   └── schema.ts       # AUTO-GENERATED — DO NOT EDIT
├── resources/
│   ├── css/app.css     # Global styles
│   ├── js/
│   │   ├── app.js      # Alpine.js bootstrap
│   │   └── themes/     # java_style + image_sequence frontend modules
│   └── views/          # Edge.js templates → see resources/views/AGENTS.md
├── start/
│   ├── routes.ts       # All route definitions
│   ├── kernel.ts       # Middleware registration
│   ├── validator.ts    # VineJS macros
│   └── env.ts          # Env var validation schema
├── bin/                # Entry points (server, console, test)
├── server/             # AUTO-GENERATED — DO NOT EDIT
├── tests/              # Japa test framework (no tests written yet)
├── design/             # Design assets + DESIGN.md style guide
└── public/             # Static assets
```

## WHERE TO LOOK

| Task                       | Location                                                                                                | Notes                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Add route                  | `start/routes.ts`                                                                                       | Lazy-import controllers, apply middleware                    |
| Add controller             | `app/controllers/`                                                                                      | Class-based, use `HttpContext` from `@adonisjs/core/http`    |
| Add model                  | `app/models/`                                                                                           | Extend generated `FooSchema` from `#database/schema`         |
| Add migration              | `database/migrations/`                                                                                  | Timestamped filenames, run `node ace migration:run`          |
| Modify invitation template | `resources/views/components/invitation/{theme}/`                                                        | 2 themes: `java_style` (9 files), `image_sequence` (7 files) |
| Modify admin pages         | `resources/views/pages/admin/` (6 files)                                                                | Edge.js, guarded by `auth` middleware                        |
| Change validation          | `app/validators/`                                                                                       | VineJS schemas                                               |
| Add theme                  | `resources/views/components/invitation/{name}/` + register in `invitation_controller.ts` `VALID_THEMES` |
| Config changes             | `config/`                                                                                               | Heavily commented; read comments before editing              |
| Seed data                  | `database/seeders/`                                                                                     | Run `node ace db:seed`                                       |

## CODE MAP

| Symbol                 | Type       | Location                                     | Role                                                |
| ---------------------- | ---------- | -------------------------------------------- | --------------------------------------------------- |
| `InvitationController` | Controller | `app/controllers/invitation_controller.ts`   | Public wedding pages + RSVP                         |
| `AdminController`      | Controller | `app/controllers/admin_controller.ts`        | Dashboard, edit, stories, gallery, guests           |
| `AdminAuthController`  | Controller | `app/controllers/admin_auth_controller.ts`   | Login/logout                                        |
| `Invitation`           | Model      | `app/models/invitation.ts`                   | Central model; hasMany stories, galleries, guests   |
| `User`                 | Model      | `app/models/user.ts`                         | Auth user with `withAuthFinder` mixin               |
| `VALID_THEMES`         | Const      | `app/controllers/invitation_controller.ts:6` | Theme registry — add new themes here                |
| `middleware`           | Export     | `start/kernel.ts:47`                         | Named middleware (`guest`, `auth`) for route groups |
| `home.edge`            | Template   | `resources/views/pages/home.edge`            | Entry template; dispatches to theme component       |

## CONVENTIONS

- **Path aliases**: `#` prefix (e.g., `#controllers/user_controller`, `#models/user`) — NOT `@/`
- **Lazy controller imports**: `const FooController = () => import('#controllers/foo_controller')` in routes
- **Models extend generated schema**: `class Invitation extends InvitationSchema` (from `#database/schema`)
- **Controllers are classes**: Methods receive `HttpContext` (destructure for `{ params, request, view, response }`)
- **Edge.js templates**: Use `@layouts.main({...})` wrapper, `@if`/`@endif`, `@!` for component includes
- **.edge files NOT formatted**: Prettier skips `*.edge` (`.prettierignore`)
- **Test files**: `*.spec.ts` in `tests/unit/`, `tests/functional/`, `tests/browser/`
- **Config files**: kebab-case filenames (`config/app.ts`, `config/database.ts`)
- **Env vars**: `SCREAMING_SNAKE_CASE` validated in `start/env.ts`

## ANTI-PATTERNS (THIS PROJECT)

- **NEVER edit `server/` files** — auto-generated by AdonisJS
- **NEVER edit `database/schema.ts`** — auto-generated by Lucid ORM
- **NEVER edit `ace.js`** — overridden during build
- **Do NOT use `@/` path alias** — use `#` prefix imports
- **Do NOT format `.edge` files** — excluded from Prettier

## COMMANDS

```bash
npm run dev        # Development with HMR
npm run build      # Production build (tsc + vite)
npm start          # Production server
npm test           # Japa test runner
npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # tsc --noEmit

# AdonisJS CLI (via ace)
node ace migration:run
node ace migration:rollback
node ace db:seed
node ace make:controller Name
node ace make:model Name
node ace make:migration name
```

## NOTES

- **No CI/CD** configured — no GitHub Actions, Dockerfile, or deployment configs
- **No tests written** — Japa configured with 3 suites but only `tests/bootstrap.ts` exists
- **2 invitation themes**: `java_style` (default) and `image_sequence`. Toggle via `?theme=` query param or DB `style` field
- **Theme switching mechanism**: `VALID_THEMES` array in controller + `activeStyle` variable passed to `home.edge` which dispatches to the correct component
- **Hot reload boundaries**: controllers and middleware only (`package.json` `hotHook.boundaries`)
- **Node >= 24.0.0** required
- **SQLite** via `better-sqlite3` — no PostgreSQL/MySQL dependency
- **GSAP** included for animation support in invitation themes
- **Session auth** with cookie driver (memory in tests); `httpOnly: true`, `secure` in production
