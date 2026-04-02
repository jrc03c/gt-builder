import { Liquid } from "liquidjs"
import { ProgramData } from "./program-data.mjs"
import * as fsx from "@jrc03c/fs-extras"
import fs from "node:fs"
import path from "node:path"
import process from "node:process"

class GTBuilder {
  distDir = path.join(process.cwd(), "dist")
  exclude = [".git", "node_modules"]
  srcDir = path.join(process.cwd(), "src")

  constructor(data) {
    data = data ?? {}
    this.distDir = data.distDir ?? this.distDir
    this.exclude = data.exclude ?? this.exclude
    this.srcDir = data.srcDir ?? this.srcDir

    if (this.distDir === this.srcDir) {
      throw new Error(
        `The "srcDir" and "distDir" properties cannot have the same value!`,
      )
    }
  }

  build() {
    const { distDir, srcDir } = this
    const lq = new Liquid({ strictVariables: true })
    const outfiles = []

    fs.rmSync(distDir, { force: true, recursive: true })
    fs.mkdirSync(distDir, { recursive: true })

    for (const file of fsx.getFilesDeepIter(srcDir)) {
      if (!file.match(/data\.ya?ml/)) {
        continue
      }

      const dir = path.resolve(path.dirname(file))

      const isExcluded = this.exclude.some(e => {
        if (typeof e === "string") {
          return file.includes(e) || dir.includes(e)
        }

        if (e instanceof RegExp) {
          return file.match(e) || dir.match(e)
        }

        if (typeof e === "function") {
          return e(file) || e(dir)
        }
      })

      if (isExcluded) {
        continue
      }

      const data = ProgramData.fromFile(file)
      const docs = data.generateDocs()

      const template = fs.readFileSync(
        file.replace(/data\.ya?ml/, "template.gt"),
        "utf8",
      )

      let out = lq.parseAndRenderSync(template, {
        ...data.toObject(),
        cleanup: "{{ cleanup }}",
        docs,
      })

      const cleanup = data.generateCleanup(out)
      out = lq.parseAndRenderSync(out, { cleanup })

      out = out
        .split("\n")
        .map(v => (v.trim().length === 0 ? "" : v))
        .join("\n")

      if (data.gtlintDirectivesToRemoveOnBuild) {
        const patterns = data.gtlintDirectivesToRemoveOnBuild.map(
          v => new RegExp(`-- @${v}`),
        )

        out = out
          .split("\n")
          .filter(v => !patterns.some(p => v.match(p)))
          .map(v => (v.trim().length === 0 ? "" : v))
          .join("\n")
      }

      while (out.includes("\n\n\n")) {
        out = out.replaceAll("\n\n\n", "\n\n")
      }

      if (out.match(/^ /gms)) {
        throw new Error(
          `The file "${file}" includes lines that use spaces rather than tabs for indentation!`,
        )
      }

      out = out.trim()

      const outfile = path.resolve(
        path.join(
          distDir,
          data[ProgramData.SYMBOL_FOR_DIR].split(path.sep).at(-1) + ".gt",
        ),
      )

      fs.writeFileSync(outfile, out, "utf8")
      outfiles.push(outfile)
    }

    return outfiles
  }
}

export { GTBuilder }
