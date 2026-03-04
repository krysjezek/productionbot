# ProductionBot Webflow Export (Vite)

This project is a Webflow-exported static site converted into a Vite-based workflow for local development and production builds.

## Project structure

The original static export layout is preserved. `index.html` stays at the project root and references assets that sit alongside it:

- `index.html` (entry page)
- `401.html`, `404.html`
- `css/`
- `js/`
- `images/`
- `videos/`
- `fonts/`

Vite uses the existing root `index.html` as the entry point.

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — create production build in `dist/`
- `npm run preview` — preview the production build locally

## Setup

```bash
npm install
```

## Local development

```bash
npm run dev
```

Then open the local URL shown by Vite (usually `http://localhost:5173/`).

## Production build

```bash
npm run build
```

Output goes to `dist/`.

## Preview production output

```bash
npm run preview
```

## Notes

- Static assets remain in place and were not reorganized.
- Vite reports a non-blocking warning for `js/webflow.js` because it is loaded as a classic script (not `type="module"`) in `index.html`. Build still succeeds.
