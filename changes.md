### feat

- `dom.check.hasMediaOrTable(node)`: check the element contains a media or table element (`helper/dom/domCheck`)

### fix

- Preserve inline whitespace, punctuation adjacency, and ordered-list start numbers when switching Markdown View (`helper/converter`, `helper/markdown`, `core/schema/options`) [ #1711](https://github.com/JiHong88/suneditor/issues/1711)
- Preserve negative-start lists as HTML and multiline inline formatting during Markdown round trips (`helper/markdown`)
- `converter.htmlToJson` / `html.getJson` no longer drop whitespace from text content (`helper/converter`)
- Keep adjacent and space-padded emphasis inline during Markdown round trips (`helper/markdown`)
- A split list restarts its numbering instead of copying the original `start` (`core/logic/dom/format`, `core/logic/dom/nodeTransform`, `core/logic/dom/listFormat`)
- Keep line breaks during Markdown round trips: `<br>` in a paragraph becomes a hard line break (`\` + newline), `<br>` in a list item, table cell or heading is kept as HTML, and a line that would start a Markdown block stays in its paragraph (`helper/markdown`)
- Markdown parsing supports hard line breaks (`\` or two spaces before a newline) and empty list items (`-`, `1.`), restores escapes inside link text, and treats only block tags at a line start as HTML blocks, so a paragraph starting with inline HTML such as a styled `<span>` keeps its Markdown (`helper/markdown`)
- Escape Markdown syntax in text only where it would be parsed (e.g. `2\*3\*4`, `\_draft\_`, `\<b>`, `a \| b` in a table cell; `file_name` and a single `~` are kept), so text no longer turns into formatting, links or HTML after a Markdown round trip. Escapes accept any ASCII punctuation, and inline code and HTML tag attributes are no longer parsed as Markdown (`helper/markdown`)
- Applying a block (e.g. blockquote) to list items keeps it where the items were, instead of after the rest of the list (`core/logic/dom/format`)
- Inserting a component (e.g. hr) in a list item keeps it in that item, without creating a list item inside it (`core/logic/shell/component`)
- Splitting a list keeps a line before the split that holds only an image or other media, instead of clearing it (`core/logic/dom/nodeTransform`)

### breaking

- ⚠️ `listFormat.applyNested(cells, nested)`: `nested` now means what it says — `true` indents (nests) the cells and `false` outdents them; it was the reverse before. — In direct calls, swap the boolean (outdent: `true` → `false`, indent: `false` → `true`). `format.indent()` / `format.outdent()` and the Tab key are unchanged (`core/logic/dom/listFormat`)
