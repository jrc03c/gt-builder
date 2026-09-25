import { GTBuilder } from "../src/index.mjs"
import fs from "node:fs"
import path from "node:path"

function build() {
  console.log("---")
  console.log(`Building... (${new Date().toLocaleTimeString()})`)
  const srcDir = path.join(import.meta.dirname, "src")
  const distDir = path.join(import.meta.dirname, "dist")

  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { force: true, recursive: true })
  }

  fs.mkdirSync(distDir, { recursive: true })

  const builder = new GTBuilder({
    distDir,
    srcDir,
    transforms: [
      out =>
        out
          .split("\n")
          .filter(
            v =>
              !v.includes(
                '-- NOTE: This line will be deleted by a "transform" in the build script!',
              ),
          )
          .join("\n")
          .trim(),
    ],
  })

  const files = builder.build()
  console.log(`Built! 🎉   (${new Date().toLocaleTimeString()})`)
  console.log("Output:")

  for (const file of files) {
    console.log(`💾 ${file}`)
  }
}

build()
