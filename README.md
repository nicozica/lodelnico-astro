# lodelnico.com – Photoblog

This is the source code for my personal photoblog [lodelnico.com](https://lodelnico.com), built with **Astro** and deployed to my self-hosted Apache server.

## How it works
- Content (photos, posts) is managed in **WordPress**.
- When I upload a new image to WordPress, a **webhook** triggers a **GitHub Actions** workflow.
- The workflow builds the site (`npm run build`) and deploys the static output (`dist/`) to my server using `rsync` over SSH.

## Tech stack
- [Astro](https://astro.build/) – Static site generator
- [GitHub Actions](https://docs.github.com/actions) – CI/CD pipeline
- Apache on Debian – Self-hosted web server

## Deployment flow
1. WordPress → Webhook → GitHub Action trigger  
2. GitHub Actions → Build Astro → `rsync` deploy  
3. Server serves updated static files at `lodelnico.com`

## License
This project is for personal use. Feel free to get inspired, but please don’t copy content or images.
