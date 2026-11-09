// Lists every visible [bracketed placeholder] in the source as a Markdown table (file, line, text).
// A bracket counts when it sits in JSX text (right after ">") or inside a quoted string, so code such as
// dependency arrays and Tailwind arbitrary values is ignored.
// Usage: npm run placeholders
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', 'src')

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (/\.tsx?$/.test(e.name) && !/\.test\.ts$/.test(e.name)) yield p
  }
}

const RE = /(?<![\w)\](-])\[[A-Za-z][^\]\n[]{2,}\](?!:)/g
const insideQuotes = (before) => ['"', "'", '`'].some((q) => (before.split(q).length - 1) % 2 === 1)
const isCode = (text) => /=/.test(text) || /^\[[a-z-]+(,[a-z-]+)+\]$/.test(text) || /^\[mock form\]/.test(text)

const rows = []
for await (const file of walk(root)) {
  const lines = (await readFile(file, 'utf8')).split('\n')
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return
    for (const m of line.matchAll(RE)) {
      const before = line.slice(0, m.index)
      if ((before.endsWith('>') || insideQuotes(before)) && !isCode(m[0]))
        rows.push({ file: path.relative(path.dirname(root), file), line: i + 1, text: m[0] })
    }
  })
}
console.log('| File | Line | Placeholder |\n| --- | --- | --- |')
for (const r of rows) console.log(`| ${r.file} | ${r.line} | ${r.text.replace(/\|/g, '\\|')} |`)
console.error(`\n${rows.length} placeholders`)
