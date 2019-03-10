import { FormulaExpression } from '../parser'

export enum ValueKind {
  nothing,
  number,
  string,
  formula
}

export interface ValueBase {
  kind: ValueKind
}

export interface NothingValue extends ValueBase {
  kind: ValueKind.nothing
}

export interface NumberValue extends ValueBase {
  kind: ValueKind.number
  value: number
}

export interface StringValue extends ValueBase {
  kind: ValueKind.string
  value: string
}

export interface FormulaValue extends ValueBase {
  kind: ValueKind.formula
  value: FormulaExpression
  resolvedValue?: PrimitiveValue
}

export type PrimitiveValue = NothingValue | NumberValue | StringValue

export type Value = PrimitiveValue | FormulaValue

export const nothing: NothingValue = {
  kind: ValueKind.nothing
}
