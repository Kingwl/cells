import { Cell } from './models/cell'

export function editCell(cell: Cell) {
  cell.editing = true
}

export function notifyDirty(cell: Cell) {
  cell.dirty = true
  cell.dependencies.forEach(notifyDirty)
}

export function saveCell(cell: Cell, value: string) {
  cell.editing = false

  if (value !== cell.value) {
    cell.value = value
    notifyDirty(cell)
  }
}
