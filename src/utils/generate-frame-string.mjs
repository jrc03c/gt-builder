import { border } from "./frame-common.mjs"
import { wrap } from "@jrc03c/js-text-tools"

function generateFrameString(x, shouldWrap) {
  shouldWrap = shouldWrap ?? true

  const comment = "--"
  let previousLineWasEmpty = false

  const lines = (shouldWrap ? wrap(x, 73) : x).split("\n").filter(line => {
    if (line.trim().length === 0) {
      const out = !previousLineWasEmpty
      previousLineWasEmpty = true
      return out
    }

    previousLineWasEmpty = false
    return true
  })

  const out = []

  out.push(
    comment +
      " " +
      border.top.left +
      border.horiz.repeat(75) +
      border.top.right,
  )

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.length > 73) {
      out.push(comment + " " + border.vert + " " + line)
    } else {
      out.push(
        comment +
          " " +
          border.vert +
          " " +
          line +
          " ".repeat(74 - line.length) +
          border.vert,
      )
    }
  }

  out.push(
    comment +
      " " +
      border.bottom.left +
      border.horiz.repeat(75) +
      border.bottom.right,
  )

  return out.join("\n")
}

export { generateFrameString }
