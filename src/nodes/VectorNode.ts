import { getCodeAction } from '../utils'
import { LintConfig } from '../types/Config'
import { GetFormattedString } from '../types/Formattable'
import { FunctionInfo } from '../types/DocumentInfo'
import { TextRange } from '../types/TextRange'
import { ArgumentNode, DiagnosticMap, GetCodeActions, NodeRange, NodeType } from './ArgumentNode'
import { NumberNode } from './NumberNode'

export const enum VectorElementType {
    Absolute = '',
    Relative = '~',
    Local = '^'
}

export class VectorElementNode extends NumberNode {
    constructor(public type: VectorElementType, value: number, raw: string) {
        super(value, raw)
    }

    /**
     * Return the raw representation of this vector, including prefix.
     */
    toString() {
        return this.type + this.raw
    }
}

export class VectorNode extends ArgumentNode implements ArrayLike<VectorElementNode> {
    [index: number]: VectorElementNode

    readonly [NodeType] = 'Vector'

    length = 0

    constructor() {
        super()
    }

    push(...values: VectorElementNode[]) {
        for (const value of values) {
            this[this.length++] = value
        }
    }

    /* istanbul ignore next */
    *[Symbol.iterator](): Iterator<VectorElementNode, any, undefined> {
        // You want me to call myself for iterating? Stupid!
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.length; i++) {
            yield this[i]
        }
    }

    [GetCodeActions](uri: string, info: FunctionInfo, range: TextRange, diagnostics: DiagnosticMap) {
        const ans = super[GetCodeActions](uri, info, range, diagnostics)
        if (Array.prototype.some.call(this,
            (v: VectorElementNode) => v.type === VectorElementType.Absolute && !v.raw.includes('.')
        )) {
            ans.push(
                getCodeAction(
                    'vector-align-0.0', [], info.document, this[NodeRange],
                    Array.prototype.map.call(this,
                        (v: VectorElementNode) => {
                            if (v.type === VectorElementType.Absolute) {
                                return v.raw.includes('.') ? v.raw : `${v.raw}.0`
                            }
                            return v.toString()
                        }
                    ).join(' '),
                    undefined, false
                ),
                getCodeAction(
                    'vector-align-0.5', [], info.document, this[NodeRange],
                    Array.prototype.map.call(this,
                        (v: VectorElementNode) => {
                            if (v.type === VectorElementType.Absolute) {
                                return v.raw.includes('.') ? v.raw : `${v.raw}.5`
                            }
                            return v.toString()
                        }
                    ).join(' '),
                    undefined, false
                )
            )
        }
        return ans
    }

    [GetFormattedString](lint: LintConfig) {
        return Array.prototype.map.call(this, (v: VectorElementNode) => v[GetFormattedString](lint)).join(' ')
    }
}
