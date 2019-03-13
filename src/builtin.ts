import { PrimitiveValue, ValueKind, nothing } from './models/value'

export type BuiltinFunction = (args: PrimitiveValue[]) => PrimitiveValue

const builtinIf: BuiltinFunction = args => {
  if (args.length !== 3) {
    throw new Error(`expected 3 arguments, got ${args.length}`)
  }
  const [cond, trueBranch, falseBranch] = args as [
    PrimitiveValue,
    PrimitiveValue,
    PrimitiveValue
  ]
  if (cond.kind === ValueKind.nothing) {
    return nothing
  }
  return cond.value ? trueBranch : falseBranch
}

export const BuiltinFunctionMap: Map<string, BuiltinFunction> = new Map([
  ['if', builtinIf]
])
