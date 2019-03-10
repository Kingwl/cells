export function isInput(e: Element | null | undefined): e is HTMLInputElement {
  return !!(e && e.nodeName === 'INPUT')
}

export function isSpan(e: Element | null | undefined): e is HTMLSpanElement {
  return !!(e && e.nodeName === 'SPAN')
}
