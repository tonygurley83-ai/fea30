#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const IGNORE = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  ".cache",
]);

let fileCount = 0;
let dirCount = 0;

function walk(dir, prefix = "") {
  let entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !IGNORE.has(e.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;

    const connector = isLast
      ? "└── "
      : "├── ";

    console.log(
      prefix + connector + entry.name
    );

    const fullPath = path.join(
      dir,
      entry.name
    );

    if (entry.isDirectory()) {
      dirCount++;

      walk(
        fullPath,
        prefix +
          (isLast
            ? "    "
            : "│   ")
      );
    } else {
      fileCount++;
    }
  });
}

console.log(
  path.basename(ROOT)
);

walk(ROOT);

console.log("\n--------------------------------");
console.log(`Directories: ${dirCount}`);
console.log(`Files:       ${fileCount}`);
console.log("--------------------------------");
