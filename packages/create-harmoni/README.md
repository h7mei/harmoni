# create-harmoni

Scaffold a new Harmoni project without cloning the repo. Downloads the template via [tiged](https://github.com/tiged/tiged) (no git history), installs dependencies, and runs setup.

## Usage

```bash
# With pnpm (recommended)
pnpm create harmoni my-project

# With npm
npm create harmoni@latest my-project

# With npx
npx create-harmoni@latest my-project

# Scaffold in current directory
pnpm create harmoni .
```

## What it does

1. Downloads the Harmoni template from GitHub (no full clone)
2. Runs `pnpm install` (or npm/yarn if pnpm isn't available)
3. Runs `pnpm run setup` (creates `.env` from `.env.example`)
4. Prints next steps (Docker, DB, migrate, dev)

## Custom template source

Set `HARMONI_TEMPLATE_REPO` to use a different repo or fork:

```bash
HARMONI_TEMPLATE_REPO=your-org/harmoni-fork pnpm create harmoni my-project
```

## Publishing

From the monorepo root:

```bash
pnpm --filter create-harmoni publish --access public
```
