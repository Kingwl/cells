import { FormulaExpression } from '../parser'

export enum ValueKind {
  nothing,
  number,
  string,
  boolean,
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

export interface BooleanValue extends ValueBase {
  kind: ValueKind.boolean
  value: boolean
}

export interface FormulaValue extends ValueBase {
  kind: ValueKind.formula
  value: FormulaExpression
  resolvedValue?: PrimitiveValue
}

export type PrimitiveValue =
  | NothingValue
  | NumberValue
  | StringValue
  | BooleanValue

export type Value = PrimitiveValue | FormulaValue

export const nothing: NothingValue = {
  kind: ValueKind.nothing
}
