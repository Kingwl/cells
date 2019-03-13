import { Cell } from './models/cell'
import { parse, SyntaxKind } from './parser'
import { Value, ValueKind, PrimitiveValue, FormulaValue } from './models/value'
import { execute, Context } from './executor'
import { Table } from './models/table'

export function parseCellValue(cell: Cell): Value {
  const token = parse(cell.value)
  switch (token.kind) {
    case SyntaxKind.Nothing:
      return {
        kind: ValueKind.nothing
      }
    case SyntaxKind.NumericalLiteral:
      return {
        kind: ValueKind.number,
        value: token.value
      }
    case SyntaxKind.StringLiteral:
      return {
        kind: ValueKind.string,
        value: token.value
      }
    case SyntaxKind.FormulaLiteral:
      return {
        kind: ValueKind.formula,
        value: token.expression
      }
  }
}

export function resolveFormulaValue(
  value: FormulaValue,
  cell: Cell,
  table: Table
) {
  if (!value.resolvedValue) {
    cell.subs.forEach(sub => sub.dependencies.delete(cell))
    cell.subs = new Set<Cell>()

    const context: Context = { cell, table }
    value.resolvedValue = execute(value.value, context)
  }
  return value.resolvedValue
}

export function resolveCellValue(
  value: Value,
  cell: Cell,
  table: Table
): PrimitiveValue {
  switch (value.kind) {
    case ValueKind.nothing:
    case ValueKind.number:
    case ValueKind.string:
    case ValueKind.boolean:
      return value
    case ValueKind.formula:
      return resolveFormulaValue(value, cell, table)
  }
}

export function ensureCellValue(cell: Cell, table: Table) {
  if (cell.dirty) {
    cell.resolvedValue = parseCellValue(cell)
    cell.dirty = false
  }
  return resolveCellValue(cell.resolvedValue, cell, table)
}
