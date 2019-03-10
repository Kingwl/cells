import { Row } from './row'
import { Cell } from './cell';

export enum Order {
  ASC,
  DESC
}

export interface OrderBy {
  order: Order
}

export interface TableBase {
  title: string
  rows: Row[]

  colsCount: number
  rowsCount: number

  order?: Order

  dirtyCell: Set<Cell>
}

export interface NormalTable extends TableBase {}

export interface OrderedTable extends TableBase {
  order: Order
  orderedRows: Row[]
}

export type Table = NormalTable | OrderedTable
