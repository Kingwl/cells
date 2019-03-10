import { Row } from '../models/row'
import { fill } from './utils'
import { Cell } from '../models/cell'
import { nothing } from '../models/value'

export function fillCells(cols: number): Cell[] {
  return fill(cols, () => ({
    value: '',
    resolvedValue: nothing,
    dependencies: new Set<Cell>(),
    subs: new Set<Cell>(),
    editing: false,
    dirty: false
  }))
}

export function fillRows(rows: number, cols: number): Row[] {
  return fill(rows, () => ({
    length: cols,
    cells: fillCells(cols)
  }))
}
