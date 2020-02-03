import FunctionInfo from '../../types/FunctionInfo'
import { getCacheFromChar, getSafeCategory } from '../../types/ClientCache'
import { Position, DocumentHighlight } from 'vscode-languageserver'
import onSelectionRanges from './onSelectionRanges'

export default async function onDocumentHighlight({ position, info }: { position: Position, info: FunctionInfo }) {
    const { line: lineNumber, character: char } = position
    const line = info.lines[lineNumber]
    /* istanbul ignore next */
    const result = getCacheFromChar(line.cache || {}, char)
    if (result) {
        // Highlight all the references/definitions of the selected stuff.
        const ans: DocumentHighlight[] = []

        for (let i = 0; i < info.lines.length; i++) {
            const line = info.lines[i]
            const unit = getSafeCategory(line.cache, result.type)[result.id]
            /* istanbul ignore else */
            if (unit) {
                const ref = [...unit.def, ...unit.ref]
                /* istanbul ignore else */
                if (ref.length > 0) {
                    ans.push(...ref.map(v => ({
                        range: {
                            start: { line: i, character: v.start },
                            end: { line: i, character: v.end }
                        }
                    })))
                }
            }
        }

        return ans
    }

    // Highlight the selected token.
    return onSelectionRanges({ info, positions: [position] })
}
