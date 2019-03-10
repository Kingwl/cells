import { Table } from './models/table'
import { range } from './utils/utils'
import { Cell } from './models/cell'
import { isInput, isSpan } from './utils/dom'
import { editCell, saveCell } from './edit'
import { ensureCellValue } from './resolve'
import { Value, ValueKind, PrimitiveValue } from './models/value'
import { notifyDirty, updateCell } from './update';

declare global {
  interface HTMLTableDataCellElement {
    __cell__?: Cell
  }

  interface ResolvedHTMLTableDataCellElement extends HTMLTableDataCellElement {
    __cell__: Cell
  }
}

export function isCellElement(
  obj: EventTarget | Element
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

export function renderValue(value: PrimitiveValue) {
  const span = document.createElement('span')
  switch (value.kind) {
    case ValueKind.string:
      span.classList.add('string-literal')
    case ValueKind.number:
      span.textContent = value.value.toString()
      break
    case ValueKind.nothing:
      break
  }
  return span
}

export function renderCellContent(cell: Cell, table: Table) {
  return renderValue(ensureCellValue(cell, table))
}

export function renderEditingCellContent(cell: Cell) {
  const input = document.createElement('input')
  input.value = cell.value
  return input
}

export function renderCell(cell: Cell, table: Table) {
  const td = document.createElement('td')
  const span = renderCellContent(cell, table)
  td.appendChild(span)
  td.__cell__ = cell
  cell.el = td
  return td
}

export function bindSaveListener(input: HTMLInputElement, table: Table) {
  input.addEventListener('blur', e => {
    const td = e.composedPath().find(isCellElement)
    if (td && isInput(td.firstElementChild)) {
      const cell = td.__cell__
      saveCell(cell, td.firstElementChild.value)
      updateCell(cell, table)
      notifyDirty(cell, table)
    }
  })
}

export function bindEditListener(tbody: Element, table: Table) {
  tbody.addEventListener('click', e => {
    const td = e.composedPath().find(isCellElement)
    if (td && isSpan(td.firstElementChild)) {
      const cell = td.__cell__
      editCell(cell)

      const input = renderEditingCellContent(cell)
      bindSaveListener(input, table)
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
      tr.appendChild(renderCell(cell, table))
    })
    tbody.appendChild(tr)
  })

  bindEditListener(tbody, table)
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
