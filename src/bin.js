#!/usr/bin/env node

import { GTBuilder } from "./index.mjs"
import { program } from "commander"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

function debounce(fn, ms) {
  let timeout

  return function () {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...arguments), ms)
  }
}

program.name("gt-builder")

program.command("init [dest]").action(dest => {
  const src = path.join(import.meta.dirname, "..", "template")
  dest = path.resolve(dest ?? process.cwd())

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  fs.cpSync(src, dest, { recursive: true })
  console.log(`Initialized program template: ${dest}`)
})

program
  .command("build [paths...]")
  .option("-d, --dist-dir <dir>")
  .option("-e, --exclude <paths...>")
  .option("-w, --watch")
  .action((paths, options) => {
    const distDir = options.distDir ?? path.join(process.cwd(), "dist")
    const excluded = options.exclude ?? []

    for (let i = 0; i < excluded.length; i++) {
      excluded[i] = path.resolve(excluded[i])
    }

    if (paths.length === 0) {
      paths.push(process.cwd())
    }

    for (let i = 0; i < paths.length; i++) {
      paths[i] = path.resolve(paths[i])
    }

    const build = debounce(() => {
      console.log("-".repeat(80))
      console.log(`Building... (${new Date().toLocaleTimeString()})`)

      try {
        for (let i = 0; i < paths.length; i++) {
          const p = paths[i]

          const srcDir = path.resolve(
            fs.statSync(p).isDirectory() ? p : path.dirname(p),
          )

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
  })

program.parse()
