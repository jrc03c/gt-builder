import { Data } from "@jrc03c/data-class"

class Variable extends Data {
  #description = ""
  #name = ""
  shouldShowInTable = true
  type = "???"

  get description() {
    if (!this.#description) {
      const temp = [this.type]

      if (this.isRequired) {
        temp.push("required")
      } else if (typeof this.defaultValue !== "undefined") {
        temp.push(`default = ${JSON.stringify(this.defaultValue)}`)
      }

      this.#description = temp.join("; ")
    }

    return this.#description
  }

  set description(v) {
    this.#description = v
  }

  get name() {
    return this.#name
  }

  set name(v) {
    this.#name = v.split(/\s/)[0]
  }
}

class InputVariable extends Variable {
  defaultValue = ""
  isRequired = false
  shouldCleanUp = true
}

class OutputVariable extends Variable {}

export { InputVariable, OutputVariable, Variable }
