# juancastillom.com

Personal portfolio site built with Next.js 15, React 19, and TypeScript. Statically exported and deployed on AWS Amplify.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Static export to `out/` |
| `npm run lint` | Run ESLint |

## Deployment

Builds and deploys automatically via AWS Amplify on push. See `amplify.yml` for the build config.

## Analytics

The site uses [Umami](https://umami.is) for privacy-friendly analytics. The tracking script is loaded only in production (`NODE_ENV !== "development"`) and only when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set, so local development never reports events.

Set the website ID in `.env.local` (and in the Amplify environment for deploys):

```bash
NEXT_PUBLIC_UMAMI_WEBSITE_ID=your-umami-website-id
```

Use separate website IDs for production and any preview/staging environments so reporting stays clean.

### Tracked events

| Event | When | Properties |
|-------|------|------------|
| `session_start` | First load of a session | `entry` (`home` \| `apps` \| `other`), plus any `utm_*` params |
| `nav_apps_click` | Click on the "Apps" link in the main nav | — |
| `contact_click` | Click on a link in the "Say hi" section | `label`, `handle` |
| `app_link_click` | Opening an app's external link | `app` (id), `source` (`home_grid` \| `apps_page`) |

Events are fired through `lib/track.ts`, which queues calls until the Umami script is ready and drops them after 10s if it never loads.
