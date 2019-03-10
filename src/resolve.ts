import { Cell } from './models/cell'
import { parse, SyntaxKind } from './parser'
import { Value, ValueKind } from './models/value'

export function resolveCellValue(cell: Cell): Value {
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
  }
}

export function ensureCellValue(cell: Cell) {
  if (cell.dirty) {
    cell.dependencies.forEach(ensureCellValue)
    cell.resolvedValue = resolveCellValue(cell)
    cell.dirty = false
  }
  return cell.resolvedValue
}
