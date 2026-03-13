import { DataFrame } from "@jrc03c/js-math-tools"
import { generateFrameString } from "./utils/generate-frame-string.mjs"
import { generateTableString } from "./utils/generate-table-string.mjs"
import { getVariableNamesInGTProgram } from "./utils/get-variable-names-in-gt-program.mjs"
import { InputVariable, OutputVariable } from "./variable.mjs"
import { wrap } from "@jrc03c/js-text-tools"
import { YamlData } from "@jrc03c/data-file-helpers"
import fs from "node:fs"

class ProgramData extends YamlData {
  static fromFile(file) {
    let out = YamlData.fromFile(file)

    if (out.url) {
      const raw = fs.readFileSync(file, "utf8")
      const lines = raw.split("\n")

      // correct incorrectly-parsed description values
      !(() => {
        const descLines = lines.filter(line => line.match(/^\s*description:/))

        for (const line of descLines) {
          const desc = line.replace(/^\s*description:/, "").trim()
          out.description = desc
        }
      })()

      // correct incorrectly-parsed url values
      !(() => {
        const line = lines.find(v => v.match(/^url:/))

        if (line) {
          const url = line.replace(/^url:/, "").trim()
          out.url = url

          try {
            out.url = JSON.parse(out.url)
          } catch (e) {}
        }
      })()
    }

    const shouldIncludeAllProperties = true
    out = new ProgramData(out)

    out.inputVariables = (out.inputVariables || []).map(v =>
      InputVariable.new(v, shouldIncludeAllProperties),
    )

    out.outputVariables = (out.outputVariables || []).map(v =>
      OutputVariable.new(v, shouldIncludeAllProperties),
    )

    return out
  }

  generateCleanup(raw) {
    const otherVariablesNotToCleanUp = this.otherVariablesNotToCleanUp || []

    return Array.from(
      new Set(
        getVariableNamesInGTProgram(raw || "")
          .concat(this.inputVariables.map(v => v.name))
          .concat(this.otherVariablesToCleanUp || [])
          .filter(v => !this.outputVariables.find(w => w.name === v))
          .filter(v => !otherVariablesNotToCleanUp.includes(v)),
      ),
    )
      .filter(v => {
        for (const w of this.inputVariables) {
          if (!w.shouldCleanUp && w.name === v) {
            return false
          }
        }

        return true
      })
      .toSorted((a, b) => (a < b ? -1 : 1))
      .map(v => `>> ${v} = ""`)
      .join("\n")
  }

  generateDocs() {
    const maxWidth = 80
    const hr = "-".repeat(maxWidth)
    const prefix = "--"
    const labelWidth = 11

    const sortedInputVariables = this.inputVariables
      .toSorted((a, b) => (a.name < b.name ? -1 : 1))
      .filter(v => !!v.shouldShowInTable)

    const sortedOutputVariables = this.outputVariables
      .toSorted((a, b) => (a.name < b.name ? -1 : 1))
      .filter(v => !!v.shouldShowInTable)

    const out = []

    if (this.services) {
      const df = new DataFrame({
        NAME: this.services.map(v => v.name),
        URL: this.services.map(v => v.url),
        USERNAME: this.services.map(v => (v.username ? v.username : "")),
        PASSWORD: this.services.map(v => (v.password ? v.password : "")),
        HEADERS: this.services.map(() => ""),
      })

      this.services
        .map(
          v =>
            (v.headers && v.headers.length > 0 ? "\n" : "") +
            (v.headers || [])
              .map(h =>
                wrap(
                  " ".repeat(labelWidth - 7) +
                    `- KEY   : ${h.key}` +
                    "\n" +
                    " ".repeat(labelWidth - 5) +
                    `VALUE : ${h.value}`,
                  73,
                  " ".repeat(labelWidth),
                ),
              )
              .join("\n"),
        )
        .forEach((v, i) => {
          df.values[i][df.columns.indexOf("HEADERS")] = v
        })

      const servicesTable = generateTableString(df, labelWidth)
      out.push(hr, `${prefix} 📡 SERVICES:`, hr, servicesTable)
    }

    if (sortedInputVariables.length > 0) {
      const inputVariablesTable = generateTableString(
        new DataFrame({
          NAME: sortedInputVariables.map(v => v.name),
          REQUIRED: sortedInputVariables.map(v =>
            typeof v.isRequired === "boolean"
              ? v.isRequired
                ? "yes 🚨"
                : "no"
              : v.isRequired,
          ),
          TYPE: sortedInputVariables.map(v => v.type),
          DEFAULT: sortedInputVariables.map(v => v.defaultValue),
          DESCRIPTION: sortedInputVariables.map(v => v.description),
        }),
        labelWidth,
      )

      out.push(hr, `${prefix} 👉 INPUTS:`, hr, inputVariablesTable)
    }

    if (sortedOutputVariables.length > 0) {
      const outputVariablesTable = generateTableString(
        new DataFrame({
          NAME: sortedOutputVariables.map(v => v.name),
          TYPE: sortedOutputVariables.map(v => v.type),
          DESCRIPTION: sortedOutputVariables.map(v => v.description),
        }),
        labelWidth,
      )

      out.push(hr, `${prefix} 👈 OUTPUTS:`, hr, outputVariablesTable)
    }

    if (this.notes) {
      out.push(
        hr,
        `${prefix} 📜 NOTES:`,
        hr,
        generateFrameString(this.notes.split("\n").join("\n\n")),
      )
    }

    if (out.length > 0) {
      out.push(hr)
    }

    return out.join("\n")
  }
}

export { ProgramData }
