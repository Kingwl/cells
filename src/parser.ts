import { isAlpha, isDigit, isWhiteSpace } from './utils/parse'
import { colToIndex } from './utils/utils'

export enum SyntaxKind {
  Nothing,
  NumericalLiteral,
  StringLiteral,
  FormulaLiteral,

  FormulaExpression,
  FormulaCellIdentifier,
  FormulaNumericalLiteral
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

export interface FormulaLiteralToken extends Token {
  kind: SyntaxKind.FormulaLiteral
  expression: FormulaExpression
}

export type FormulaExpressionKind =
  | SyntaxKind.FormulaCellIdentifier
  | SyntaxKind.FormulaNumericalLiteral

export interface FormulaExpression extends Token {
  kind: FormulaExpressionKind
}

export interface FormulaCellIdentifier extends FormulaExpression {
  kind: SyntaxKind.FormulaCellIdentifier
  row: number
  col: number
}

export interface FormulaNumericalLiteral extends FormulaExpression {
  kind: SyntaxKind.FormulaNumericalLiteral
  value: number
}

export function parse(str: string) {
  let cur = 0

  if (str.startsWith('`')) {
    cur++
    return parseStringLiteral()
  }
  if (str.startsWith(`=`)) {
    cur++
    return parseFormulaLiteral()
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

  function parseFormulaExpression(): FormulaExpression {
    const ch = str.charCodeAt(cur)
    if (isWhiteSpace(ch)) {
      skipFormulaWhiteSpace()
    }

    if (isDigit(ch)) {
      return parseFormulaNumericalLiteral()
    }
    if (isAlpha(ch)) {
      return parseFormulaCellIdentifier()
    }
    throw new Error('unexpected token')
  }

  function skipFormulaWhiteSpace() {
    let tokenEnd = cur
    let ch = str.charCodeAt(tokenEnd)

    while (isWhiteSpace(ch)) {
      ch = str.charCodeAt(++tokenEnd)
    }
    cur = tokenEnd
  }

  function parseFormulaNumericalLiteral(): FormulaNumericalLiteral {
    let tokenStart = cur
    let tokenEnd = cur
    let ch = str.charCodeAt(tokenEnd)

    while (isDigit(ch)) {
      ch = str.charCodeAt(++tokenEnd)
    }
    cur = tokenEnd

    return {
      kind: SyntaxKind.FormulaNumericalLiteral,
      value: Number(str.substring(tokenStart, tokenEnd))
    }
  }

  function parseFormulaCellIdentifier(): FormulaCellIdentifier {
    let tokenStart = cur
    let tokenEnd = cur
    let ch = str.charCodeAt(tokenEnd)

    while (isAlpha(ch)) {
      ch = str.charCodeAt(++tokenEnd)
    }
    const col = colToIndex(str.substring(tokenStart, tokenEnd))
    tokenStart = tokenEnd

    while (isDigit(ch)) {
      ch = str.charCodeAt(tokenEnd++)
    }
    const row = Number(str.substring(tokenStart, tokenEnd))
    cur = tokenEnd

    return {
      kind: SyntaxKind.FormulaCellIdentifier,
      row,
      col
    }
  }

  function parseFormulaLiteral(): FormulaLiteralToken {
    const expression = parseFormulaExpression()
    return {
      kind: SyntaxKind.FormulaLiteral,
      expression
    }
  }

  function parseStringLiteral(): NothingToken | StringLiteralToken {
    const value = str.substring(cur)
    if (!value) {
      return {
        kind: SyntaxKind.Nothing
      }
    }

    return {
      kind: SyntaxKind.StringLiteral,
      value: str.substring(cur)
    }
  }

  function parseNumericalLiteral(): NumericalLiteralToken | undefined {
    const value = Number(str.substring(cur))
    if (Number.isNaN(value)) {
      return undefined
    }
    return {
      kind: SyntaxKind.NumericalLiteral,
      value
    }
  }
}
