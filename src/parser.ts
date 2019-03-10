export enum SyntaxKind {
  Nothing,
  NumericalLiteral,
  StringLiteral
}

export interface Token {
  kind: SyntaxKind
}

export interface NothingToken extends Token {
  kind: SyntaxKind.Nothing
}

export interface NumericalLiteralToken extends Token {
  kind: SyntaxKind.NumericalLiteral
  value: number
}

export interface StringLiteralToken extends Token {
  kind: SyntaxKind.StringLiteral
  value: string
}
export function parse(str: string) {
  let cur = 0

  if (str.startsWith('`')) {
    cur++
    return parseStringLiteral()
  }
  const token = lookAHead(parseNumericalLiteral)
  if (token) {
    return token
  }
  return parseStringLiteral()

  function lookAHead<T extends Token>(cb: () => T | undefined) {
    const lastCur = cur
    const result = cb()
    cur = lastCur
    return result
  }

  function parseStringLiteral(): NothingToken | StringLiteralToken {
    const value = str.substr(cur)
    if (!value) {
      return {
        kind: SyntaxKind.Nothing
      }
    }

    return {
      kind: SyntaxKind.StringLiteral,
      value: str.substr(cur)
    }
  }

  function parseNumericalLiteral(): NumericalLiteralToken | undefined {
    const value = Number(str.substr(cur))
    if (Number.isNaN(value)) {
      return undefined
    }
    return {
      kind: SyntaxKind.NumericalLiteral,
      value
    }
  }
}
