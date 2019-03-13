import { CharacterCodes } from './parse'

export function fill<T>(n: number, cb: (i: number) => T) {
  return Array.from({ length: n }).map((_, i) => cb(i))
}

export function range(start: number, end: number, cb: (i: number) => void) {
  for (let i = start; i < end; ++i) {
    cb(i)
  }
}

export function colToIndex(col: string): number {
  col = col.toLowerCase()
  let sum = 0
  for (let i = 0; i < col.length; ++i) {
    sum += col.charCodeAt(i) - CharacterCodes.a
  }
  return sum
}

export interface Pos {
  col: number
  row: number
}

const cellRegex = /^([A-Za-z]+)([0-9]+)$/
export function parseCell(str: string): Pos | undefined {
  const m = str.match(cellRegex)
  if (!m) return undefined
  const [_, col, row] = m
  return { col: colToIndex(col), row: Number(row) }
}
