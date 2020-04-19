import { GetFormattedString } from '../Formattable'
import { LintConfig } from '../Config'
import { toFormattedString, quoteString } from '../../utils/utils'
import NbtCompoundNode from './map/NbtCompoundNode'
import ArgumentNode, { NodeType } from './ArgumentNode'
import NbtCompoundKeyNode from './map/NbtCompoundKeyNode'

export const NbtPathIndexBegin = Symbol('NbtPathIndexBegin')
export const NbtPathIndexEnd = Symbol('NbtPathIndexEnd')
export const NbtPathSep = Symbol('NbtPathSep')
type NbtPathIndex = number
type NbtPathCompoundFilter = NbtCompoundNode
type NbtPathKey = NbtCompoundKeyNode

export default class NbtPathNode extends ArgumentNode {
    readonly [NodeType] = 'NbtPath'

    constructor(
        readonly value: (
            | typeof NbtPathIndexBegin
            | typeof NbtPathIndexEnd
            | typeof NbtPathSep
            | NbtPathIndex
            | NbtPathCompoundFilter
            | NbtPathKey
        )[]
    ) {
        super()
    }

    [GetFormattedString](lint: LintConfig): string {
        let ans = ''
        for (const value of this.value) {
            if (value === NbtPathIndexBegin) {
                ans += '['
            } else if (value === NbtPathIndexEnd) {
                ans += ']'
            } else if (value === NbtPathSep) {
                ans += '.'
            } else if (isNbtPathCompoundFilter(value) || isNbtPathIndex(value)) {
                ans += toFormattedString(value, lint)
            } else {
                ans += value[GetFormattedString]()
            }
        }
        return ans
    }
}

export function isNbtPathIndex(value: any): value is NbtPathIndex {
    return typeof value === 'number'
}

export function isNbtPathCompoundFilter(value: any): value is NbtPathCompoundFilter {
    return value instanceof NbtCompoundNode
}

export function isNbtPathKey(value: any): value is NbtPathKey {
    return typeof value === 'string'
}
