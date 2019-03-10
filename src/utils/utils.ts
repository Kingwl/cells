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
  let sum = 0
  for (let i = 0; i < col.length; ++i) {
    sum += col.charCodeAt(i) - CharacterCodes.A
  }
  return sum
}
