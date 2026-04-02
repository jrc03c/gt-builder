import fs from "node:fs"
import path from "node:path"

function findUpwards(root, fn) {
  root = path.resolve(
    fs.statSync(root).isDirectory() ? root : path.dirname(root),
  )

  while (true) {
    const children = fs.readdirSync(root)

    for (const child of children) {
      if (fn(child)) {
        return path.resolve(path.join(root, child))
      }
    }

    const parent = path.dirname(root)

    if (parent === root) {
      return
    }

    root = parent
  }
}

export { findUpwards }
