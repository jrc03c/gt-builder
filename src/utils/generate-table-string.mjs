import { DataFrame } from "@jrc03c/js-math-tools"
import { generateFrameString } from "./generate-frame-string.mjs"
import { wrap } from "@jrc03c/js-text-tools"

function generateTableString(df, labelWidth) {
  if (!(df instanceof DataFrame)) {
    throw new Error(
      "The first option passed into the `generateTableString` function must be a `DataFrame` instance!",
    )
  }

  labelWidth = labelWidth || Math.max(...df.columns.map(c => c.length))
  const out = []

  for (const i of df.index) {
    const row = df.get(i, null)
    const temp = []

    for (const col of df.columns) {
      const value = row.get(col)

      if (
        typeof value !== "undefined" &&
        (typeof value !== "string" || value.length > 0)
      )
        if (typeof value === "string" && !value.trim().match(/\s/)) {
          // if the value is a really long string with no whitespace (e.g., a
          // URL or API key), then don't apply wrapping
          temp.push(
            `${col.toUpperCase() + " ".repeat(labelWidth - col.length)} : ${value}`,
          )
        } else {
          // otherwise, apply wrapping as usual
          temp.push(
            ...wrap(
              `${col.toUpperCase() + " ".repeat(labelWidth - col.length)} : ${typeof value === "string" ? value : JSON.stringify(value)}`,
              73,
              " ".repeat(labelWidth + 3),
            ).split("\n"),
          )
        }
    }

    const shouldWrap = false
    out.push(generateFrameString(temp.join("\n"), shouldWrap))
  }

  return out.join("\n")
}

export { generateTableString }
