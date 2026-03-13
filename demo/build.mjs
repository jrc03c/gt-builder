import { GTBuilder } from "../src/index.mjs"
import { watch } from "@jrc03c/watch"
import path from "node:path"
import process from "node:process"

function rebuild() {
  try {
    const builder = new GTBuilder({
      distDir: path.join(import.meta.dirname, "dist"),
      srcDir: path.join(import.meta.dirname, "src"),
    })

    builder.build()
    console.log("---")
    console.log(`Rebuilding... (${new Date().toLocaleTimeString()})`)
    console.log("Rebuilt! 🎉")
  } catch (e) {
    console.error(e)
  }
}

if (process.argv.includes("--watch") || process.argv.includes("-w")) {
  watch({
    target: path.join(import.meta.dirname, "src"),
    created: rebuild,
    modified: rebuild,
    deleted: rebuild,
  })
}

rebuild()
