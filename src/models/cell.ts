import { Value } from './value'

export interface Cell {
  value: string
  resolvedValue: Value
  dependencies: Cell[]

  editing: boolean
  dirty: boolean
}
