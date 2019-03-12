import {
  isAlpha,
  isDigit,
  isWhiteSpace,
  CharacterCodes,
  isQuote
} from './utils/parse'
import { parseCell } from './utils/utils'

export enum SyntaxKind {
  EndOfFile,
  Nothing,
  NumericalLiteral,
  StringLiteral,
  FormulaLiteral,

  FormulaNumericalLiteralToken,
  FormulaStringLiteralToken,
  FormulaTrueLiteralToken,
  FormulaFalseLiteralToken,

  FormulaCellIdentifierToken,
  FormulaBuiltinIdentifierToken,

  FormulaOpenParenToken,
  FormulaCloseParenToken,

  FormulaPlusToken,
  FormulaMinusToken,
  FormulaStarToken,
  FormulaSlashTOken,

  FormulaExpression,

  FormulaCellIdentifier,
  FormulaBuiltinIdentifier,

  FormulaNumericalLiteral,
  FormulaStringLiteral,
  FormulaBooleanLiteral,

  FormulaBinaryExpression,
  FormulaUnaryExpression,
  FormulaParenExpression
}

export const keywords = new Map<string, SyntaxKind>([
  ['true', SyntaxKind.FormulaTrueLiteralToken],
  ['false', SyntaxKind.FormulaFalseLiteralToken]
])

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

export type FormulaLiteralExpression =
  | FormulaNumericalLiteral
  | FormulaStringLiteral
  | FormulaBooleanLiteral

export type FormulaIdentifierExpression =
  | FormulaCellIdentifier
  | FormulaBuiltinIdentifier

export type PrimaryExpression =
  | FormulaLiteralExpression
  | FormulaIdentifierExpression
  | FormulaParenExpression

export type UnaryOrHigherExpression = FormulaUnaryExpression | PrimaryExpression
export type BinaryOrHigherExpression =
  | FormulaBinaryExpression
  | UnaryOrHigherExpression
export type FormulaExpression = BinaryOrHigherExpression

export type FormulaExpressionKind = FormulaExpression['kind']

export interface Formula extends Token {
  kind: FormulaExpressionKind
}

export interface FormulaNumericalLiteral extends Formula {
  kind: SyntaxKind.FormulaNumericalLiteral
  value: number
}

export interface FormulaStringLiteral extends Formula {
  kind: SyntaxKind.FormulaStringLiteral
  value: string
}

export interface FormulaBooleanLiteral extends Formula {
  kind: SyntaxKind.FormulaBooleanLiteral
  value: boolean
}

export interface FormulaBuiltinIdentifier extends Formula {
  kind: SyntaxKind.FormulaBuiltinIdentifier
  name: string
}

export interface FormulaCellIdentifier extends Formula {
  kind: SyntaxKind.FormulaCellIdentifier
  row: number
  col: number
}

export interface FormulaParenExpression extends Formula {
  kind: SyntaxKind.FormulaParenExpression
  expression: FormulaExpression
}

export interface FormulaBinaryExpression extends Formula {
  kind: SyntaxKind.FormulaBinaryExpression
  left: FormulaExpression
  op: SyntaxKind
  right: FormulaExpression
}

export interface FormulaUnaryExpression extends Formula {
  kind: SyntaxKind.FormulaUnaryExpression
  op: SyntaxKind
  expression: FormulaExpression
}

export function parse(str: string) {
  let cur = 0

  let token: SyntaxKind
  let tokenValue: string
  let tokenStart: number
  let tokenEnd: number

  if (str.startsWith('`')) {
    cur++
    return parseStringLiteral()
  }
  if (str.startsWith(`=`)) {
    cur++
    return parseFormulaLiteral()
  }
  const num = lookAHead(parseNumericalLiteral)
  if (num) {
    return num
  }
  return parseStringLiteral()

  function lookAHead<T extends Token>(cb: () => T | undefined) {
    const lastCur = cur
    const result = cb()
    cur = lastCur
    return result
  }

  function nextToken(): SyntaxKind {
    tokenStart = tokenEnd = cur

    let ch = str.charCodeAt(cur)
    switch (ch) {
      case CharacterCodes.lineFeed:
      case CharacterCodes.carriageReturn:
      case CharacterCodes.lineSeparator:
      case CharacterCodes.paragraphSeparator:
      case CharacterCodes.nextLine:
      case CharacterCodes.space:
      case CharacterCodes.tab:
        while (isWhiteSpace(ch)) {
          ch = str.charCodeAt(++tokenEnd)
        }
        return nextToken()

      case CharacterCodes._0:
      case CharacterCodes._1:
      case CharacterCodes._2:
      case CharacterCodes._3:
      case CharacterCodes._4:
      case CharacterCodes._5:
      case CharacterCodes._6:
      case CharacterCodes._7:
      case CharacterCodes._8:
      case CharacterCodes._9:
        while (isDigit(ch)) {
          ch = str.charCodeAt(++tokenEnd)
        }
        token = SyntaxKind.FormulaNumericalLiteralToken
        tokenValue = str.substring(tokenStart, tokenEnd)
        cur = tokenEnd
        return token
      case CharacterCodes.singleQuote:
      case CharacterCodes.doubleQuote:
        const lastQuote = ch
        do {
          ch = str.charCodeAt(++tokenEnd)
        } while (ch && !isQuote(ch) && ch !== lastQuote)

        if (!ch) {
          throw new Error('unterm string')
        }

        token = SyntaxKind.FormulaStringLiteralToken
        tokenValue = str.substring(tokenStart + 1, tokenEnd)
        cur = ++tokenEnd
        return token
      case CharacterCodes.openParen:
      case CharacterCodes.closeParen:
      case CharacterCodes.plus:
      case CharacterCodes.minus:
      case CharacterCodes.asterisk:
      case CharacterCodes.slash:
        switch (ch) {
          case CharacterCodes.openParen:
            token = SyntaxKind.FormulaOpenParenToken
            break
          case CharacterCodes.closeParen:
            token = SyntaxKind.FormulaCloseParenToken
            break
          case CharacterCodes.plus:
            token = SyntaxKind.FormulaPlusToken
            break
          case CharacterCodes.minus:
            token = SyntaxKind.FormulaMinusToken
            break
          case CharacterCodes.asterisk:
            token = SyntaxKind.FormulaStarToken
            break
          case CharacterCodes.slash:
            token = SyntaxKind.FormulaSlashTOken
            break
        }

        tokenValue = str.substring(tokenStart, ++tokenEnd)
        cur = tokenEnd
        return token
      default:
        if (Number.isNaN(ch)) {
          token = SyntaxKind.EndOfFile
          return token
        }
        if (!isAlpha(ch)) {
          throw new Error('unexpected token')
        }
        do {
          ch = str.charCodeAt(++tokenEnd)
        } while (ch && (isDigit(ch) || isAlpha(ch)))

        tokenValue = str.substring(tokenStart, tokenEnd)
        cur = tokenEnd

        const cell = parseCell(tokenValue)
        if (cell) {
          token = SyntaxKind.FormulaCellIdentifierToken
        } else if (keywords.has(tokenValue.toLowerCase())) {
          token = keywords.get(tokenValue.toLowerCase())!
        } else {
          token = SyntaxKind.FormulaBuiltinIdentifierToken
        }
        return token
    }
  }

  function parseFormulaExpression(): FormulaExpression {
    nextToken()
    return parseBinaryExpressionOrHigher()
  }

  function parseBinaryExpressionOrHigher(): BinaryOrHigherExpression {
    const left = parseUnaryExpressionOrHigher()
    const op = token
    if (op === SyntaxKind.FormulaPlusToken) {
      nextToken()

      const right = parseBinaryExpressionOrHigher()
      return {
        kind: SyntaxKind.FormulaBinaryExpression,
        left,
        right,
        op
      }
    }

    return left
  }

  function parseUnaryExpressionOrHigher(): UnaryOrHigherExpression {
    const op = token
    if (op === SyntaxKind.FormulaMinusToken) {
      nextToken()

      const expression = parsePrimaryExpression()
      return {
        kind: SyntaxKind.FormulaUnaryExpression,
        op,
        expression
      }
    }
    return parsePrimaryExpression()
  }

  function parsePrimaryExpression(): PrimaryExpression {
    switch (token) {
      case SyntaxKind.FormulaStringLiteralToken:
        return parseFormulaStringLiteral()
      case SyntaxKind.FormulaNumericalLiteralToken:
        return parseFormulaNumericalLiteral()
      case SyntaxKind.FormulaOpenParenToken:
        return parseFormulaParenExpression()
      case SyntaxKind.FormulaCellIdentifierToken:
        return parseFormulaCellIdentifier()
      case SyntaxKind.FormulaTrueLiteralToken:
        return parseFormulaBooleanLiteral(true)
      case SyntaxKind.FormulaFalseLiteralToken:
        return parseFormulaBooleanLiteral(false)
      case SyntaxKind.FormulaBuiltinIdentifierToken:
        return parseFormulaBuiltinIdentifier()
      default:
        throw new Error('unexpected token')
    }
  }

  function parseFormulaNumericalLiteral(): FormulaNumericalLiteral {
    const value = tokenValue
    nextToken()
    return {
      kind: SyntaxKind.FormulaNumericalLiteral,
      value: Number(value)
    }
  }

  function parseFormulaStringLiteral(): FormulaStringLiteral {
    const value = tokenValue
    nextToken()
    return {
      kind: SyntaxKind.FormulaStringLiteral,
      value
    }
  }

  function parseFormulaBooleanLiteral(value: boolean): FormulaBooleanLiteral {
    nextToken()
    return {
      kind: SyntaxKind.FormulaBooleanLiteral,
      value
    }
  }

  function parseFormulaParenExpression(): FormulaParenExpression {
    nextToken()
    const expression = parseFormulaExpression()
    if (token === SyntaxKind.FormulaCloseParenToken) {
      nextToken()
      return {
        kind: SyntaxKind.FormulaParenExpression,
        expression
      }
    }
    throw new Error('missing close paren')
  }

  function parseFormulaCellIdentifier(): FormulaCellIdentifier {
    const { col, row } = parseCell(tokenValue)!
    nextToken()
    return {
      kind: SyntaxKind.FormulaCellIdentifier,
      row,
      col
    }
  }

  function parseFormulaBuiltinIdentifier(): FormulaBuiltinIdentifier {
    const name = tokenValue
    nextToken()
    return {
      kind: SyntaxKind.FormulaBuiltinIdentifier,
      name
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
