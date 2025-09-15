# To-Do List (React)

A simple, clean To-Do List built with React.

[![CI](https://github.com/abdullahArshadCheema/my-react-todos/actions/workflows/ci.yml/badge.svg)](https://github.com/abdullahArshadCheema/my-react-todos/actions/workflows/ci.yml)
[![Pages](https://github.com/abdullahArshadCheema/my-react-todos/actions/workflows/pages.yml/badge.svg)](https://github.com/abdullahArshadCheema/my-react-todos/actions/workflows/pages.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/PLACEHOLDER-SITE-ID/deploy-status)](https://app.netlify.com/sites/PLACEHOLDER-NAME/deploys)

## Features

- Add tasks (Enter or Add)
- Toggle complete (checkbox)
- Delete tasks
- Edit task (double-click, Enter to save, Esc to cancel)
- Filters: All / Active / Completed
- Persists to localStorage
- Undo delete (5s)
- Drag to reorder (All filter)
- Dark mode toggle (persists)
- Search, sort, priorities (High/Medium/Low)
- Toggle all, import/export JSON

## Quick Start

```bash
# start dev server
npm start

# run unit tests
npm test -- --watchAll=false

# lint & format
npm run lint
npm run format

# e2e tests (Chromium)
npm run e2e -- --project=chromium

# record/update visual baselines
VISUAL=1 npm run e2e:update -- --project=chromium
```

Open http://localhost:3000 in your browser.

## File structure

- `src/TodoList.js` — component logic
- `src/TodoList.css` — component styles
- `src/App.js` — renders the TodoList

## Deploy

- GitHub Pages (auto): https://abdullahArshadCheema.github.io/my-react-todos
	- Auto-deploys on each push to main/master via `pages.yml` (build:pages script sets PUBLIC_URL).
- Netlify: connect the repo OR rely on `netlify.yml`.
	- Auto-deploys on push to main/master (production) and creates preview deploys for pull requests.
	- Secrets required in repo settings → Actions secrets:
		- `NETLIFY_AUTH_TOKEN`
		- `NETLIFY_SITE_ID`
	- Badge: replace `PLACEHOLDER-SITE-ID` & `PLACEHOLDER-NAME` after first deploy.
	- PRs get a comment with preview URL when secrets are present.

### Dual deployment note

This repo deploys to both GitHub Pages and Netlify:
- Pages build uses `npm run build:pages` (injects PUBLIC_URL for subpath).
- Netlify uses plain `npm run build` so assets resolve at site root.
If you see broken asset paths on Netlify, ensure the `homepage` field is NOT present in `package.json` and you used the standard build script.

### CI/CD flow summary

1. Push / PR triggers `ci.yml` (lint, unit tests, e2e matrix) and `pages.yml` (if push to main/master) and `netlify.yml` (push + PR).
2. Pages deploy only happens after a successful build step producing the artifact.
3. Netlify action deploys preview for PRs, production for main/master pushes.
4. Optional manual run: both workflows still expose `workflow_dispatch`.
5. Visual baseline updates (if enabled) would be a future enhancement (currently e2e runs only chromium in CI).

## Tech & tests

- React 19 (CRA)
- Unit tests: React Testing Library + Jest DOM
- Visual/e2e: Playwright (Chromium/Firefox/WebKit)
- CI: GitHub Actions (lint, tests, build, Pages deploy)
