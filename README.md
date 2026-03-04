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

## Email collection (lightweight endpoint)

The contact forms now POST to `/api/submit`, which is a tiny Vercel serverless function that accepts an email, validates it, and forwards it via SMTP. To deploy it:

1. Run `vercel` (or use the web dashboard) pointing to this repo; Vite builds the static site while the `api/` directory becomes the serverless function namespace.
2. Set the following environment variables in Vercel:
   - `CONTACT_RECIPIENT_EMAIL` – the inbox that should receive every submission.
   - `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_SECURE` – your SMTP relay (Gmail, SendGrid, Postmark, etc.). `SMTP_SECURE` should be `true` when using 465-style TLS.
   - (Optional) `CONTACT_FROM_EMAIL` to customize the sender.
3. The form handlers will return JSON that the Webflow markup already expects (`200` for success, `4xx/5xx` on error).
4. The `vercel.json` file targets Node 20 for the `/api/submit` route.

If you prefer to log submissions somewhere else (Slack, spreadsheets, etc.), I can swap the handler accordingly—just let me know the destination.
