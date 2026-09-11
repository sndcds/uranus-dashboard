# Uranus Dashboard

[![Lighthouse CI](https://github.com/sndcds/uranus-dashboard/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/sndcds/uranus-dashboard/actions/workflows/lighthouse.yml)
[![Run codeql](https://github.com/sndcds/uranus-dashboard/actions/workflows/codeql.yml/badge.svg)](https://github.com/sndcds/uranus-dashboard/actions/workflows/codeql.yml)
[![Frontend Tests](https://github.com/sndcds/uranus-dashboard/actions/workflows/tests.yml/badge.svg)](https://github.com/sndcds/uranus-dashboard/actions/workflows/tests.yml)


## Web frontend for the Uranus Culture Platform.

It provides users with the ability to:
- Register and log in
- Manage and interact with platform content

The dashboard serves as the main interface for accessing and administering the Uranus Culture Platform’s features in a user-friendly web environment.

## Tech Stack

- Vue 3 (Composition API)
- TypeScript
- Vite
- Uranus API (backend service)

## Development

Use pnpm exclusively and the latest stable Node.js release (Current). The pnpm
version is pinned in `package.json`; `pnpm-lock.yaml` is the dependency lockfile.
With nvm, run `nvm install` and `nvm use` to select the latest Node.js release.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test --run
pnpm build
```

The deployment SSH user needs the pinned pnpm version installed, with `PNPM_HOME`
on its PATH (defaults to `~/.local/share/pnpm`). Deployment uses pnpm to install
the latest Node.js runtime before installing dependencies and building the app.
