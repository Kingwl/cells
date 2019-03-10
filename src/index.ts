import { defaultRows, defaultCols, defaultTitle } from './models/constant'
import { Table } from './models/table'
import { fillRows } from './utils/helper'
import { render } from './render'

export interface Options {
  title?: string
  initialRows?: number
  initialCols?: number
}

export function setup(el: Element, options: Options = {}) {
  const {
    initialRows = defaultRows,
    initialCols = defaultCols,
    title = defaultTitle
  } = options

  const table: Table = {
    title,
    rows: fillRows(initialRows, initialCols),
    colsCount: initialCols,
    rowsCount: initialRows
  }

  return render(el, table)
}
