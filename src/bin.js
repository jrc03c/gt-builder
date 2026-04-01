#!/usr/bin/env node

import { GTBuilder } from "./index.mjs"
import { program } from "commander"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

program
  .name("gt-build")
  .option("-d, --dist-dir <dir>")
  .option("-w, --watch")
  .argument("[paths...]")

program.parse()

const options = program.opts()
const distDir = options.distDir ?? path.join(process.cwd(), "dist")
const paths = program.args

if (paths.length === 0) {
  paths.push(process.cwd())
}

for (let i = 0; i < paths.length; i++) {
  paths[i] = path.resolve(paths[i])
}

function debounce(fn, ms) {
  let timeout

  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...arguments), ms)
  }
}

const build = debounce(() => {
  console.log("-".repeat(80))
  console.log(`Building... (${new Date().toLocaleTimeString()})`)

  try {
    for (let i = 0; i < paths.length; i++) {
      const p = paths[i]

      const srcDir = fs.statSync(p).isDirectory()
        ? p
        : p.split(path.sep).slice(0, -1).join(path.sep)

      const builder = new GTBuilder({
        distDir,
        srcDir,
      })

      const outfiles = builder.build()

      for (const f of outfiles) {
        console.log(`Built: ${f}`)
      }
    }

    console.log(`Built! 🎉  (${new Date().toLocaleTimeString()})`)
  } catch (e) {
    console.error(e)
  }
}, 100)

if (options.watch) {
  for (const p of paths) {
    fs.watch(p, { recursive: true }, () => build())
  }
}

build()
