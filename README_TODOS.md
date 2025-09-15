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
	- Pushed via GitHub Actions on every commit to main/master.
- Netlify: connect this repo and set build command `npm run build`, publish `build`.
	- (Optional) Add environment vars in Netlify UI if needed later.
	- To use the GitHub Action workflow, create a personal access token (classic) or Netlify auth token and set secrets:
		- `NETLIFY_AUTH_TOKEN`
		- `NETLIFY_SITE_ID`
	- After first deploy, replace the badge URL `PLACEHOLDER-SITE-ID` and `PLACEHOLDER-NAME` with your actual site values.

## Tech & tests

- React 19 (CRA)
- Unit tests: React Testing Library + Jest DOM
- Visual/e2e: Playwright (Chromium/Firefox/WebKit)
- CI: GitHub Actions (lint, tests, build, Pages deploy)
