# ProductionBot Quick Status

## Current state
- Webflow export lives at root; Vite builds against the existing `index.html` and keeps static assets (`css/`, `js/`, `images/`, etc.) intact.
- Project scripts cover `npm run dev`, `npm run build`, `npm run preview`, and `npm run deploy` (deploy pushes `dist/` to `gh-pages`).
- Deployment target: GitHub Pages at https://krysjezek.github.io/productionbot/ with a base path configured via `vite.config.js` and the copied `js/` assets.
- GitHub history is up-to-date (latest commit `2857c13 feat: add serverless form handler`).
- Contact forms now POST to `/api/submit`; the serverless handler (Node 20, defined in `api/submit.js`) validates the email and forwards it via Nodemailer. A `vercel.json` file exposes the endpoint for Vercel.

## What remains when you get back
- Deploy the repo to Vercel (run `vercel` or use the dashboard).
- Set these Vercel environment variables before deployment so the contact form actually sends mail:
  1. `CONTACT_RECIPIENT_EMAIL` – where submissions should land.
  2. `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` – your SMTP relay credentials (`SMTP_SECURE` should be `true` for TLS/465).
  3. Optionally `CONTACT_FROM_EMAIL` if you want to override the default sender.
- After the build and deployment, Vercel’s `/api/submit` URL will power the form; GH Pages stays live for the static site.

## Recommendations
- Rotate the SMTP credentials with a secure vault (Vercel secrets or env var manager) and monitor delivery errors via Vercel function logs.
- If you want submissions buffered before sending (e.g., Slack/webhook to internal ops), swap the payload handler in `api/submit.js` to call that service instead of SMTP.
- Consider adding a simple data store (spreadsheet, Airtable, or even another repo file) if you want a historical log of the emails without digging through inboxes.
- Keep the Webflow assets untouched unless you redo the design; use Vite only for serving/building the static export and augmenting functionality (like the form handler).
