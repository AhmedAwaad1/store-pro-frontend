# StorePro Marketing Website

Nuxt 3 website for StorePro, an Arabic-first e-commerce platform and implementation service.

## Requirements

- Node.js 20 or newer
- npm
- The StorePro Laravel API for lead submissions and published blog content

## Run locally

```bash
npm install
npm run dev
```

Set `NUXT_PUBLIC_API_BASE` to the Laravel API URL when it is not `http://localhost:8000/api`. Set `NUXT_PUBLIC_SITE_URL` to the canonical public website origin before deployment.

## Build

```bash
npm run build
npm run preview
```

The static build generates the marketing routes and prerenders published blog articles when the public blog API is reachable. The main marketing pages can still build when the API is unavailable.

## Content and inquiries

The public site loads testimonials and articles from the Laravel API. The consultation form submits sales inquiries to `/api/sales-inquiries`. Service descriptions, illustrative portfolio concepts, and package outlines are frontend content until StorePro adds dedicated content APIs.

