# create-harmoni

Scaffold a new Harmoni project without cloning the repo. Downloads the template via [tiged](https://github.com/tiged/tiged) (no git history), installs dependencies, and runs setup.

## Usage

```bash
# With npx (recommended)
npx create-harmoni my-project

# With pnpm
pnpm create harmoni my-project

# With npm
npm create harmoni@latest my-project

# Scaffold in current directory
npx create-harmoni .
```

## What it does

1. Downloads the Harmoni template from GitHub (no full clone)
2. Runs `pnpm install` (or npm/yarn if pnpm isn't available)
3. Runs `pnpm run setup` (creates `.env` from `.env.example`)
4. Prints next steps (Docker, DB, migrate, dev)

## Custom template source

Set `HARMONI_TEMPLATE_REPO` to use a different repo or fork:

```bash
HARMONI_TEMPLATE_REPO=your-org/harmoni-fork npx create-harmoni my-project
```

## Publishing

1. Bump version in `packages/create-harmoni/package.json`
2. Commit and push
3. Create and push a tag (must match the version):

```bash
git tag create-harmoni-v0.1.1
git push origin create-harmoni-v0.1.1
```

CI will publish to npm automatically. Requires `NPM_TOKEN` secret in the repo.

**404 on publish?** Ensure `NPM_TOKEN` is from the npm account that owns `create-harmoni` (hanafichoi). Create a token at [npmjs.com/settings/~/tokens](https://www.npmjs.com/settings/~/tokens) and add it to GitHub → Settings → Secrets → Actions.
