# Nourish to Flourish

Nuxt 4 public website for Dr. Nouran Awaad. The home page is Arabic-first and RTL, based on the supplied design package.

## Requirements

- Node.js 24.22.1 (see `.nvmrc` and `package.json` engines)
- npm

## Run locally

```bash
npm install
npm run dev
```

The nutrition landing page does not require a running API. Its current editable content is centralized in `data/nouranSiteContent.ts`; the presentation lives in `components/nouran/`. Nuxt serves the public website only. All administration belongs to the sibling Vue/Vite Admin Panel; Laravel provides its API, authentication, and storage. The existing root-level app layout is retained; Nuxt 4 detects and supports it, so no source files needed to move into an `app/` directory.

## Build and preview

```bash
npm run build
npm run preview
npm run typecheck
```

The build writes the static site to `.output/public` and excludes `/admin` and its descendants from prerendering. Nuxt has no admin routes, login screen, or contact inbox. Set `NUXT_PUBLIC_SITE_URL` in `.env.production` when the production domain is known. `NUXT_PUBLIC_API_BASE` remains available for public API consumers, including SEO redirect lookups for unmatched public URLs.

### Nginx redirects

Nuxt prerenders the section aliases below as HTML redirect pages. Add equivalent rules in the Nginx `server` block for permanent HTTP redirects. Retired StorePro URLs also need an Nginx rule because static hosting does not execute Nuxt route middleware at the server. The fallback serves Nuxt's generated `200.html` for other paths, allowing browser-side pages and the existing API lookup for custom SEO redirects to run; the homepage itself does not call the API.

```nginx
location = /about { return 301 /#about; }
location = /services { return 301 /#services; }
location = /pricing { return 301 /#services; }
location = /contact { return 301 /#contact; }
location = /blog { return 301 /#content; }
location ^~ /blog/ { return 301 /#content; }
location = /portfolio { return 301 /; }
location = /page { return 301 /; }
location ~ ^/(?:account|auth/google|branches|brands|cart|categories|category|checkout|collections|compare|forgot-password|login|offers|order-success|product|products|register|search|sub-category|verify-email|wishlist)(?:/|$) { return 301 /; }

location / {
    try_files $uri $uri/ /200.html;
}
```

## Contact and content

Booking links currently point to Dr. Nouran's Instagram account because the supplied design package does not include a phone, WhatsApp, or booking URL. The homepage content is static for this frontend step; wiring the landing-page sections to the backend and admin CMS is a separate integration step.

### Optional future contact inbox

The current public site has no contact-message submission flow. `/contact` redirects to `/#contact`, whose consultation button opens Instagram. The older StorePro form is unreachable through this redirect and submits to `/sales-inquiries`, not `/contact`; it does not require the contact inbox.

Laravel contact records, submission APIs, and protected management APIs are preserved. Existing historical records have not been inspected or changed. If a contact inbox is later needed, reuse `Admin-Panel-Dr-Nouran/src/views/Contacts/ContactList.vue` and `ContactView.vue`. These components are currently absent from the active Admin Panel router. Their existing service reads/writes `/contact`, while management now requires `/admin/contacts`; update those URLs before enabling the screens. Keep `auth:api` and `support.manage` authorization, use the Admin Panel's authenticated Axios client and CSRF handling, and verify pagination and response shapes. Do not enable a new public contact form unless it is explicitly required.
