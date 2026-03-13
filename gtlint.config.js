export default {
  format: {
    insertFinalNewline: true,
    spaceAfterComma: true,
    spaceAroundArrow: true,
    spaceAroundOperators: true,
    trimTrailingWhitespace: true,
  },
  ignore: ["dist/_live*"],
  rules: {
    correctIndentation: "error",
    indentStyle: "error",
    noDuplicateLabels: "error",
    noInvalidGoto: "error",
    noSingleQuotes: "warn",
    noUnclosedBracket: "error",
    noUnclosedString: "error",
    noUndefinedVars: "error",
    noUnusedVars: "warn",
    validKeyword: "error",
    validSubKeyword: "error",
  },
}
