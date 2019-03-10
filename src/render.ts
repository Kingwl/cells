import { Table } from './models/table'
import { range } from './utils/utils'
import { Cell } from './models/cell'
import { isInput, isSpan } from './utils/dom'
import { editCell, saveCell } from './edit'
import { ensureCellValue } from './resolve'
import { Value, ValueKind } from './models/value'

declare global {
  interface HTMLTableDataCellElement {
    __cell__?: Cell
  }

  interface ResolvedHTMLTableDataCellElement extends HTMLTableDataCellElement {
    __cell__: Cell
  }
}

export function isCellElement(
  obj: EventTarget
): obj is ResolvedHTMLTableDataCellElement {
  return '__cell__' in obj && !!(<HTMLTableDataCellElement>obj).__cell__
}

export function renderHeader(table: Table) {
  const thead = document.createElement('thead')

  const colsNum = document.createElement('tr')
  const th = document.createElement('th')
  colsNum.appendChild(th)

  range(0, table.colsCount, i => {
    const th = document.createElement('th')
    th.textContent = String.fromCharCode('A'.charCodeAt(0) + i)
    colsNum.appendChild(th)
  })
  thead.append(colsNum)
  return thead
}

export function renderValue(value: Value) {
  switch (value.kind) {
    case ValueKind.string:
    case ValueKind.number:
      return value.value.toString()
    case ValueKind.nothing:
      return ''
    case ValueKind.formula:
      throw new Error('formula is not supported yet')
  }
}

export function renderCellContent(cell: Cell) {
  const span = document.createElement('span')
  span.textContent = renderValue(ensureCellValue(cell))
  return span
}

export function renderEditingCellContent(cell: Cell) {
  const input = document.createElement('input')
  input.value = cell.value
  return input
}

export function renderCell(cell: Cell) {
  const td = document.createElement('td')
  const span = renderCellContent(cell)
  td.appendChild(span)
  td.__cell__ = cell
  return td
}

export function bindSaveListener(input: HTMLInputElement) {
  input.addEventListener('blur', e => {
    const td = e.composedPath().find(isCellElement)
    if (td && isInput(td.firstElementChild)) {
      const cell = td.__cell__
      saveCell(cell, td.firstElementChild.value)

      const span = renderCellContent(cell)
      td.replaceChild(span, td.firstElementChild)
    }
  })
}

export function bindEditListener(tbody: Element) {
  tbody.addEventListener('click', e => {
    const td = e.composedPath().find(isCellElement)
    if (td && isSpan(td.firstElementChild)) {
      const cell = td.__cell__
      editCell(cell)

      const input = renderEditingCellContent(cell)
      bindSaveListener(input)
      td.replaceChild(input, td.firstElementChild)
      input.focus()
    }
  })
}

export function renderBody(table: Table) {
  const tbody = document.createElement('tbody')
  range(0, table.rowsCount, i => {
    const tr = document.createElement('tr')

    const rowNum = document.createElement('td')
    rowNum.textContent = i.toString()
    tr.appendChild(rowNum)

    table.rows[i].cells.forEach(cell => {
      tr.appendChild(renderCell(cell))
    })
    tbody.appendChild(tr)
  })

  bindEditListener(tbody)
  return tbody
}

export function render(el: Element, table: Table) {
  const tableElement = document.createElement('table')

  const thead = renderHeader(table)
  tableElement.appendChild(thead)

  const tbody = renderBody(table)
  tableElement.appendChild(tbody)

  el.appendChild(tableElement)
}
