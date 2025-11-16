function replaceInTemplate<T extends Record<string, unknown>>(
  template: string,
  values: T
): string {
  let result = ""
  let keyBuffer = ""
  let insideBraces = false
  for (let i = 0;i < template.length;i++) {
    const char = template[i]
    if (char === "[") {
      if (insideBraces) {
        // Handle consecutive '<'
        result += `{${keyBuffer}`
        keyBuffer = ""
        continue
      }
      insideBraces = true
      keyBuffer = ""
      continue
    }
    if (char === "]" && insideBraces) {
      insideBraces = false
      if (keyBuffer in values && values[keyBuffer] != null) {
        result += String(values[keyBuffer])
      } else {
        result += `{${keyBuffer}}` // leave placeholder if key missing
      }
      keyBuffer = ""
      continue
    }
    if (insideBraces) {
      keyBuffer += char
    } else {
      result += char
    }
  }
  // Handle unclosed '{'
  if (insideBraces) {
    result += `{${keyBuffer}`
  }
  return result
}

export { replaceInTemplate }