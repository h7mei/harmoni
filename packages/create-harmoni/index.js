#!/usr/bin/env node

/**
 * create-harmoni — Scaffold a new Harmoni project without cloning the repo.
 * Usage: npx @hanafichoi/create-harmoni my-project
 */
import { spawn, spawnSync } from "child_process";
import { existsSync, mkdirSync, rmSync } from "fs";
import { resolve } from "path";
import { chdir, cwd } from "process";
import tiged from "tiged";

const REPO = process.env.HARMONI_TEMPLATE_REPO || "h7mei/harmoni";
const [projectName = "."] = process.argv.slice(2);
const targetDir = resolve(cwd(), projectName);

function run(cmd, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(cmd, args, {
      stdio: "inherit",
      shell: true,
      ...opts,
    });
    child.on("exit", (code) =>
      code === 0 ? resolvePromise() : reject(new Error(`${cmd} exited with ${code}`))
    );
  });
}

function detectPackageManager() {
  if (process.env.npm_execpath?.includes("pnpm")) return "pnpm";
  if (process.env.npm_execpath?.includes("yarn")) return "yarn";
  const r = (cmd) => spawnSync(cmd, ["--version"], { encoding: "utf8" });
  if (r("pnpm").status === 0) return "pnpm";
  if (r("yarn").status === 0) return "yarn";
  return "npm";
}

async function main() {
  console.log("Creating Harmoni project...\n");

  if (projectName !== "." && existsSync(targetDir)) {
    const { createInterface } = await import("readline");
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise((r) =>
      rl.question(`Directory "${projectName}" already exists. Overwrite? (y/N) `, r)
    );
    rl.close();
    if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
      console.log("Aborted.");
      process.exit(1);
    }
    rmSync(targetDir, { recursive: true });
  }

  if (projectName !== ".") {
    mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Downloading template from ${REPO}...`);
  const emitter = tiged(REPO, { force: true });
  await emitter.clone(targetDir);
  console.log("Template downloaded.\n");

  chdir(targetDir);

  const pm = detectPackageManager();
  console.log(`Installing dependencies (${pm})...`);
  await run(pm, ["install"]);

  console.log("Running setup...");
  await run("node", ["scripts/setup.mjs"]);

  console.log("\n✓ Harmoni project ready!\n");
  console.log("Next steps:");
  if (projectName !== ".") {
    console.log(`  cd ${projectName}`);
  }
  console.log("  docker compose up -d");
  console.log("  psql -U postgres -h localhost -c \"CREATE DATABASE harmoni;\"  # if needed");
  console.log("  pnpm db:migrate");
  console.log("  pnpm dev");
  console.log("\nSee README.md for full docs.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
