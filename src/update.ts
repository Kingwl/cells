import { Table } from './models/table'
import { Cell } from './models/cell'
import { isSpan, isInput } from './utils/dom'
import { renderCellContent } from './render'

export function updateCell(cell: Cell, table: Table) {
  if (
    cell.el &&
    (isSpan(cell.el.firstElementChild) || isInput(cell.el.firstElementChild))
  ) {
    const span = renderCellContent(cell, table)
    cell.el.replaceChild(span, cell.el.firstElementChild)
  }
}

export function notifyDirty(cell: Cell, table: Table) {
  cell.dirty = true
  table.dirtyCell.add(cell)
  cell.dependencies.forEach(dep => notifyDirty(dep, table))
}

export function updateDirtyCell(table: Table, cb: () => void) {
  table.dirtyCell = new Set<Cell>()
  cb()
  table.dirtyCell.forEach(c => {
    updateCell(c, table)
  })
  table.dirtyCell = new Set<Cell>()
}
