import { Value } from './value'

export interface Cell {
  value: string
  resolvedValue: Value
  dependencies: Set<Cell>
  subs: Set<Cell>

  editing: boolean
  dirty: boolean

  el?: HTMLTableDataCellElement
}
