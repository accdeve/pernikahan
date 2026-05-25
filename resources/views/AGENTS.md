# VIEWS — Edge.js Templates

**Parent:** [AGENTS.md](../AGENTS.md)

## OVERVIEW
All Edge.js templates for the wedding invitation app. Two invitation themes + admin panel UI.

## STRUCTURE
```
resources/views/
├── pages/
│   ├── home.edge               # Entry point; dispatches to active theme
│   ├── admin/ (6 files)        # Dashboard, edit, stories, gallery, guests, login
│   ├── auth/ (2 files)         # Login page
│   └── errors/ (2 files)       # Custom 404, 500 error pages
├── components/
│   ├── invitation/
│   │   ├── java_style/ (9)     # Default theme: cover→couple→event→story→gallery→rsvp→closing
│   │   └── image_sequence/ (7) # Alternate theme: cover→couple→event→nav→rsvp→closing
│   ├── layouts/                # Layout wrapper (main.edge with HTML shell + bg music)
│   ├── form/                   # Form, input, textarea, select, checkbox, radio, field
│   └── alert/, avatar, button, link, layout
└── partials/ (2)               # Shared partials (head meta, etc.)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Switch theme | `pages/home.edge` | Dispatches based on `activeStyle` variable |
| Add new theme | `components/invitation/{name}/` + `pages/home.edge` | Copy structure from existing theme |
| Modify wedding sections | `components/invitation/{theme}/` | Each section is a separate .edge file |
| Modify admin pages | `pages/admin/` | Dashboard, manage stories/gallery/guests |
| Change layout wrapper | `components/layouts/main.edge` | HTML shell, bg music, GSAP init |
| Error pages | `pages/errors/` | Custom 404, 500 |
| Form components | `components/form/`, `components/input/`, etc. | Reusable across admin pages |

## CONVENTIONS
- **Dispatch pattern**: `home.edge` is the single entry; it `@if` checks `activeStyle` to include the correct `@!invitation.{theme}()` component
- **Theme components**: Each theme is a directory under `components/invitation/{name}/` with an `index.edge` entry
- **Index.edge in themes**: Wraps all sections in order; individual sections are separate .edge files
- **Edge.js syntax**: `@layouts.main({...})` for layout, `@!component.name({...})` for includes, `@if`/`@endif`
- **Variables**: Passed from controllers via `view.render('pages/home', { invitation, stories, galleries, guests, guestName, activeStyle })`
- **Form components**: Use `{{ field }}`, `{{ label }}` props pattern; admin forms are not client-side rendered

## ANTI-PATTERNS
- **Do NOT add new .edge files without `.edge` extension**
- **Do NOT use `@/` or relative paths** — Edge.js `@!` components resolve to `components/` directory automatically
- **Never hardcode theme names** in new code; always reference `activeStyle` or `VALID_THEMES`

## THEME FILES COMPARISON
| Section | java_style | image_sequence |
|---------|-----------|----------------|
| Cover | ✓ | ✓ |
| Couple | ✓ | ✓ |
| Event | ✓ | ✓ |
| Story | ✓ | — |
| Gallery | ✓ | — |
| Nav | ✓ | ✓ |
| RSVP | ✓ | ✓ |
| Closing | ✓ | ✓ |
| **Total** | 9 files | 7 files |