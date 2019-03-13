import { FormulaExpression, SyntaxKind } from './parser'
import { Table } from './models/table'
import { PrimitiveValue, ValueKind, nothing } from './models/value'
import { ensureCellValue } from './resolve'
import { Cell } from './models/cell'
import { BuiltinFunctionMap } from './builtin'

export interface Context {
  cell: Cell
  table: Table
}

export function execute(
  formula: FormulaExpression,
  context: Context
): PrimitiveValue {
  switch (formula.kind) {
    case SyntaxKind.FormulaNumericalLiteral:
      return {
        kind: ValueKind.number,
        value: formula.value
      }
    case SyntaxKind.FormulaStringLiteral:
      return {
        kind: ValueKind.string,
        value: formula.value
      }
    case SyntaxKind.FormulaBooleanLiteral:
      return {
        kind: ValueKind.boolean,
        value: formula.value
      }
    case SyntaxKind.FormulaCellIdentifier:
      const cell = context.table.rows[formula.row].cells[formula.col]
      cell.dependencies.add(context.cell)
      context.cell.subs.add(cell)
      return ensureCellValue(cell, context.table)
    case SyntaxKind.FormulaParenExpression:
      return execute(formula.expression, context)
    case SyntaxKind.FormulaBinaryExpression:
      const left = execute(formula.left, context)
      const right = execute(formula.right, context)
      if (left.kind === ValueKind.nothing || right.kind === ValueKind.nothing) {
        return nothing
      }

      switch (formula.op) {
        case SyntaxKind.FormulaPlusToken:
          const value = (((left.value as any) + right.value) as any) as
            | string
            | number
          return typeof value === 'string'
            ? {
                kind: ValueKind.string,
                value
              }
            : {
                kind: ValueKind.number,
                value
              }
        default:
          throw new Error('unsupported')
      }
    case SyntaxKind.FormulaUnaryExpression:
      const expr = execute(formula.expression, context)
      if (expr.kind === ValueKind.nothing) {
        return nothing
      }

      switch (formula.op) {
        case SyntaxKind.FormulaMinusToken:
          return {
            kind: ValueKind.number,
            value: -(expr.value as number)
          }
        default:
          throw new Error('unsupported')
      }
    case SyntaxKind.FormulaBuiltinCallExpression:
      const name = formula.expression.name.toLowerCase()
      if (BuiltinFunctionMap.has(name)) {
        const builtin = BuiltinFunctionMap.get(name)!
        const args = formula.args.map(arg => execute(arg, context))
        return builtin(args)
      }
      throw new Error('unexpected builtin name')
    default:
      throw new Error('unsupported')
  }
}
