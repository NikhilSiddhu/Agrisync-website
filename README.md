# Agrisync Website

This project is configured for static export so deployment produces plain HTML files (including `index.html`) that can be hosted on cloud/static hosting providers and mapped to your private domain.

## Local development

```bash
npm install
npm run dev
```

## Validate before deploy

```bash
npm run lint
npm run build
```

## Build static site for cloud/domain hosting

```bash
npm run build
```

After build, deploy the generated `/out` folder to your hosting provider.

- The homepage is generated as `/out/index.html`.
- The custom domain file is included as `/out/CNAME` (`agrisync.tech`).

## Private domain setup

1. Point your domain DNS to your hosting provider (A/CNAME records based on provider docs).
2. Upload/deploy the `/out` directory.
3. Enable HTTPS in your hosting dashboard.
