export function fill<T>(n: number, cb: (i: number) => T) {
  return Array.from({ length: n }).map((_, i) => cb(i))
}

export function range(start: number, end: number, cb: (i: number) => void) {
  for (let i = start; i < end; ++i) {
    cb(i)
  }
}
