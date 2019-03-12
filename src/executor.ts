import {
  FormulaExpression,
  SyntaxKind,
  FormulaNumericalLiteral,
  FormulaCellIdentifier
} from './parser'
import { Table } from './models/table'
import { PrimitiveValue, ValueKind } from './models/value'
import { ensureCellValue } from './resolve'
import { Cell } from './models/cell'

export interface Context {
  cell: Cell
  table: Table
}

export function execute(
  formula: FormulaExpression,
  context: Context
): PrimitiveValue {
  context.cell.subs.forEach(sub => sub.dependencies.delete(context.cell))
  context.cell.subs = new Set<Cell>()

  switch (formula.kind) {
    case SyntaxKind.FormulaNumericalLiteral:
      return {
        kind: ValueKind.number,
        value: (<FormulaNumericalLiteral>formula).value
      }
    case SyntaxKind.FormulaCellIdentifier:
      const id = <FormulaCellIdentifier>formula
      const cell = context.table.rows[id.row].cells[id.col]
      cell.dependencies.add(context.cell)
      context.cell.subs.add(cell)
      return ensureCellValue(cell, context.table)
    case SyntaxKind.FormulaParenExpression:
      return execute(formula.expression, context)
    case SyntaxKind.FormulaBinaryExpression:
      const left = execute(formula.left, context)
      const right = execute(formula.right, context)
      if (left.kind === ValueKind.nothing || right.kind === ValueKind.nothing) {
        return { kind: ValueKind.nothing }
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
        return { kind: ValueKind.nothing }
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

    default:
      throw new Error('unsupported')
  }
}
