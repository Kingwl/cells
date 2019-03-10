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
  }
}
