import { Row } from './row'

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
}

export interface NormalTable extends TableBase {}

export interface OrderedTable extends TableBase {
  order: Order
  orderedRows: Row[]
}

export type Table = NormalTable | OrderedTable
