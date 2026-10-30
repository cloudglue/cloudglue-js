// Zod 4 post-generation transforms for the openapi-zod-client output.
//
// openapi-zod-client emits zod 3 style code. Two of its patterns change
// meaning or stop compiling under zod 4, so we rewrite them:
//
// - `z.record(Value)`: the single-argument form was removed in zod 4, which
//   requires an explicit key schema. We insert `z.string()` (JSON object keys
//   are always strings), i.e. `z.record(z.string(), Value)`.
// - `z.ZodType<T>` annotations: in zod 3 the input type defaulted to the
//   output type; in zod 4 it defaults to `unknown`, which would erase the
//   request body/param types Zodios derives via `z.input`. We spell out the
//   zod 3 meaning: `z.ZodType<T, T>`.
//
// Both transforms are idempotent. generate.js runs them after generation;
// run this file directly (`node scripts/zod4-transforms.js`) to apply them to
// the committed generated/ files without regenerating from the spec.

const fs = require('fs');
const path = require('path');

// Index just past the `)` closing the call whose `(` is at openIndex,
// plus the offsets of its top-level argument separators
function scanCallArgs(source, openIndex) {
    let depth = 0;
    const commas = [];
    for (let i = openIndex; i < source.length; i++) {
        const ch = source[i];
        if (ch === '"' || ch === "'" || ch === '`') {
            i = skipString(source, i);
            continue;
        }
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') {
            depth--;
            if (depth === 0) return { end: i + 1, commas };
        } else if (ch === ',' && depth === 1) commas.push(i);
    }
    throw new Error(`Unbalanced call starting at offset ${openIndex}`);
}

function skipString(source, start) {
    const quote = source[start];
    for (let i = start + 1; i < source.length; i++) {
        if (source[i] === '\\') i++;
        else if (source[i] === quote) return i;
    }
    throw new Error(`Unterminated string starting at offset ${start}`);
}

function addRecordKeySchemas(source) {
    const recordCall = /\bz\s*\.record\(/g;
    let result = '';
    let cursor = 0;
    let match;
    while ((match = recordCall.exec(source)) !== null) {
        const openIndex = match.index + match[0].length - 1;
        const { end, commas } = scanCallArgs(source, openIndex);
        const argsText = source.slice(openIndex + 1, end - 1);
        // Trailing comma after a single argument still means one argument
        const realCommas = commas.filter((c) => source.slice(c + 1, end - 1).trim() !== '');
        if (realCommas.length === 0 && argsText.trim() !== '') {
            const separator = /\s/.test(source[openIndex + 1]) ? ',' : ', ';
            result += source.slice(cursor, openIndex + 1) + 'z.string()' + separator;
            cursor = openIndex + 1;
        }
        recordCall.lastIndex = openIndex + 1;
    }
    return result + source.slice(cursor);
}

function pinZodTypeInputs(source) {
    return source.replace(/\bz\.ZodType<(\w+)>/g, 'z.ZodType<$1, $1>');
}

function applyZod4Transforms(generatedDir) {
    const files = fs.readdirSync(generatedDir).filter((f) => f.endsWith('.ts'));
    for (const file of files) {
        const filePath = path.join(generatedDir, file);
        const original = fs.readFileSync(filePath, 'utf8');
        const transformed = pinZodTypeInputs(addRecordKeySchemas(original));
        if (transformed !== original) fs.writeFileSync(filePath, transformed);
    }
}

module.exports = { applyZod4Transforms, addRecordKeySchemas, pinZodTypeInputs };

if (require.main === module) {
    applyZod4Transforms(path.join(__dirname, '..', 'generated'));
}
