/**
 * @fileoverview Markdown converter module
 * - Supports GitHub Flavored Markdown (GFM) syntax
 */

const VOID_ELEMENTS = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
const ZERO_WIDTH_RE = /^[\u200B\uFEFF]+$/;

/**
 * @description Check if a string is empty or contains only zero-width characters
 * @param {string} str
 * @returns {boolean}
 */
function isBlankLine(str) {
	const trimmed = str.trim();
	return trimmed === '' || ZERO_WIDTH_RE.test(trimmed);
}

/**
 * @description Inline tag to markdown syntax mapping
 */
const INLINE_WRAP_MAP = {
	strong: '**',
	b: '**',
	em: '*',
	i: '*',
	del: '~~',
	s: '~~',
	mark: '==',
};

/**
 * @description Process children of a JSON node into inline markdown
 * @param {Array<Object>} children
 * @returns {string}
 */
function childrenToInline(children) {
	if (!children || children.length === 0) return '';

	const parts = [];
	for (let i = 0; i < children.length; i++) {
		const part = nodeToMarkdown(children[i], '', false);
		if (part) {
			// Add space between adjacent parts when both are non-empty and
			// the previous part doesn't end with space and current doesn't start with space
			if (parts.length > 0) {
				const prev = parts[parts.length - 1];
				if (prev && !prev.endsWith(' ') && !prev.endsWith('\n') && !part.startsWith(' ') && !part.startsWith('\n')) {
					parts.push(' ');
				}
			}
			parts.push(part);
		}
	}
	return parts.join('');
}

/**
 * @description Get text content from a JSON node recursively
 * @param {Object} node
 * @returns {string}
 */
function getTextContent(node) {
	if (!node) return '';
	if (node.type === 'text') return node.content || '';
	if (node.children) return node.children.map(getTextContent).join('');
	return '';
}

/**
 * @description Convert a JSON element node to its HTML string (for fallback)
 * @param {Object} node
 * @returns {string}
 */
function nodeToHtmlFallback(node) {
	if (!node) return '';
	if (node.type === 'text') return node.content || '';

	const { tag, attributes = {}, children = [] } = node;
	const attrStr = Object.entries(attributes)
		.map(([k, v]) => `${k}="${v}"`)
		.join(' ');
	const openTag = attrStr ? `<${tag} ${attrStr}>` : `<${tag}>`;

	if (VOID_ELEMENTS.test(tag)) return openTag;

	const inner = children.map(nodeToHtmlFallback).join('');
	return `${openTag}${inner}</${tag}>`;
}

/**
 * @description Indent each line of a block string
 * @param {string} str
 * @param {string} indent
 * @returns {string}
 */
function indentBlock(str, indent) {
	if (!str) return '';
	return (
		str
			.split('\n')
			.map((line) => (line ? indent + line : ''))
			.join('\n') + '\n'
	);
}

/**
 * @description Convert a list JSON node (ul/ol) to markdown
 * @param {Object} node
 * @param {string} indent Current indentation
 * @param {boolean} isOrdered
 * @returns {string}
 */
function listToMarkdown(node, indent, isOrdered) {
	const children = node.children || [];
	let result = '';
	let index = 1;

	for (const child of children) {
		if (child.type !== 'element' || child.tag !== 'li') continue;

		const prefix = isOrdered ? `${index}. ` : '- ';
		const liChildren = child.children || [];
		let inlineContent = '';
		let subBlocks = '';
		const blockIndent = indent + ' '.repeat(prefix.length);

		// GFM task list: check for checkbox input
		let taskPrefix = '';
		const firstChild = liChildren[0];
		if (firstChild && firstChild.type === 'element' && firstChild.tag === 'input' && firstChild.attributes?.type === 'checkbox') {
			taskPrefix = firstChild.attributes.checked !== undefined ? '[x] ' : '[ ] ';
		}

		for (let ci = 0; ci < liChildren.length; ci++) {
			const liChild = liChildren[ci];
			// Skip checkbox input already handled
			if (ci === 0 && taskPrefix) continue;

			if (liChild.type !== 'element') {
				inlineContent += nodeToMarkdown(liChild, '', false);
				continue;
			}

			const tag = liChild.tag;
			if (tag === 'ul' || tag === 'ol') {
				subBlocks += listToMarkdown(liChild, blockIndent, tag === 'ol');
			} else if (tag === 'table') {
				subBlocks += indentBlock(tableToMarkdown(liChild), blockIndent);
			} else if (tag === 'figure') {
				// figure wraps table/image in editor (e.g. <figure><table>...</table></figure>)
				const tableChild = (liChild.children || []).find((c) => c.type === 'element' && c.tag === 'table');
				if (tableChild) {
					subBlocks += indentBlock(tableToMarkdown(tableChild), blockIndent);
				} else {
					subBlocks += indentBlock(nodeToMarkdown(liChild, '', true), blockIndent);
				}
			} else if (tag === 'blockquote' || tag === 'pre') {
				subBlocks += indentBlock(nodeToMarkdown(liChild, '', true), blockIndent);
			} else {
				inlineContent += nodeToMarkdown(liChild, '', false);
			}
		}

		result += `${indent}${prefix}${taskPrefix}${inlineContent.trim()}\n`;
		if (subBlocks) result += subBlocks;
		index++;
	}

	return result;
}

/**
 * @description Convert a table JSON node to markdown pipe table
 * @param {Object} node
 * @returns {string}
 */
function tableToMarkdown(node) {
	const rawRows = [];
	let hasHeader = false;

	// Collect raw rows from thead/tbody/tfoot or direct tr children
	function collectRows(parent, isHead) {
		for (const child of parent.children || []) {
			if (child.tag === 'thead') {
				collectRows(child, true);
			} else if (child.tag === 'tbody' || child.tag === 'tfoot') {
				collectRows(child, false);
			} else if (child.tag === 'tr') {
				const cells = [];
				for (const cell of child.children || []) {
					if (cell.tag === 'td' || cell.tag === 'th') {
						const content = childrenToInline(cell.children).trim();
						const colspan = parseInt(cell.attributes?.colspan, 10) || 1;
						const rowspan = parseInt(cell.attributes?.rowspan, 10) || 1;
						cells.push({ content, colspan, rowspan });
					}
				}
				const isHeaderRow = isHead || (!hasHeader && child.children?.some((c) => c.tag === 'th'));
				if (isHeaderRow) hasHeader = true;
				rawRows.push({ cells, isHeader: isHeaderRow });
			}
		}
	}

	collectRows(node, false);
	if (rawRows.length === 0) return '';

	// Move header rows to front
	const headerRows = rawRows.filter((r) => r.isHeader);
	const bodyRows = rawRows.filter((r) => !r.isHeader);
	const orderedRows = [...headerRows, ...bodyRows];

	// Determine column count by expanding colspan
	let colCount = 0;
	for (const row of orderedRows) {
		let count = 0;
		for (const cell of row.cells) {
			count += cell.colspan;
		}
		if (count > colCount) colCount = count;
	}

	// Build a 2D grid, expanding colspan and rowspan
	// null = unoccupied, string = occupied (content or empty string for spanned cells)
	const grid = Array.from({ length: orderedRows.length }, () => new Array(colCount).fill(null));

	for (let r = 0; r < orderedRows.length; r++) {
		let col = 0;
		for (const cell of orderedRows[r].cells) {
			// Skip columns already occupied by rowspan from above
			while (col < colCount && grid[r][col] !== null) col++;
			if (col >= colCount) break;

			// Fill colspan and rowspan cells
			for (let rs = 0; rs < cell.rowspan && r + rs < orderedRows.length; rs++) {
				for (let cs = 0; cs < cell.colspan && col + cs < colCount; cs++) {
					// Only put content in the first cell; spanned cells get empty string
					grid[r + rs][col + cs] = rs === 0 && cs === 0 ? cell.content : '';
				}
			}
			col += cell.colspan;
		}
		// Fill any remaining null cells with empty string
		for (let c = 0; c < colCount; c++) {
			if (grid[r][c] === null) grid[r][c] = '';
		}
	}

	let result = '';
	const hasHeaderRow = headerRows.length > 0;

	if (hasHeaderRow) {
		// Use actual header row
		result += '| ' + grid[0].join(' | ') + ' |\n';
		result += '| ' + grid[0].map(() => '---').join(' | ') + ' |\n';
		for (let r = 1; r < grid.length; r++) {
			result += '| ' + grid[r].join(' | ') + ' |\n';
		}
	} else {
		// No header: insert empty header row
		result += '| ' + new Array(colCount).fill(' ').join(' | ') + ' |\n';
		result += '| ' + new Array(colCount).fill('---').join(' | ') + ' |\n';
		for (let r = 0; r < grid.length; r++) {
			result += '| ' + grid[r].join(' | ') + ' |\n';
		}
	}

	return result;
}

/**
 * @description Convert a single JSON node to markdown
 * @param {Object} node JSON node from htmlToJson
 * @param {string} indent Current indentation for block-level
 * @param {boolean} isBlock Whether we're in block context
 * @returns {string}
 */
function nodeToMarkdown(node, indent, isBlock) {
	if (!node) return '';

	// Text node - strip zero-width characters (editor artifacts)
	if (node.type === 'text') {
		return (node.content || '').replace(/[\u200B\uFEFF]/g, '');
	}

	if (node.type !== 'element') return '';

	const { tag, attributes = {}, children = [] } = node;

	// Body (root node from htmlToJson)
	if (tag === 'body') {
		return children.map((c) => nodeToMarkdown(c, '', true)).join('');
	}

	// Headings
	const headingMatch = /^h([1-6])$/.exec(tag);
	if (headingMatch) {
		const level = parseInt(headingMatch[1], 10);
		const prefix = '#'.repeat(level);
		return `${prefix} ${childrenToInline(children).trim()}\n\n`;
	}

	if (tag === 'p') {
		const content = childrenToInline(children);
		// Empty paragraph
		if (!content.trim()) return '\n';
		return `${content.trim()}\n\n`;
	}

	if (tag === 'br') {
		return '\n';
	}

	if (tag === 'hr') {
		return '---\n\n';
	}

	// Inline formatting
	const wrapSyntax = INLINE_WRAP_MAP[tag];
	if (wrapSyntax) {
		const content = childrenToInline(children);
		return `${wrapSyntax}${content}${wrapSyntax}`;
	}

	// Inline code
	if (tag === 'code') {
		const content = getTextContent({ children });
		// Use double backticks if content contains backtick
		if (content.includes('`')) {
			return '`` ' + content + ' ``';
		}
		return '`' + content + '`';
	}

	// Keyboard input
	if (tag === 'kbd') {
		const content = getTextContent({ children });
		return `<kbd>${content}</kbd>`;
	}

	// Subscript / Superscript
	if (tag === 'sub') {
		const content = childrenToInline(children);
		return `<sub>${content}</sub>`;
	}
	if (tag === 'sup') {
		const content = childrenToInline(children);
		return `<sup>${content}</sup>`;
	}

	if (tag === 'a') {
		const href = attributes.href || '';
		const text = childrenToInline(children);
		const title = attributes.title;
		if (title) return `[${text}](${href} "${title}")`;
		return `[${text}](${href})`;
	}

	if (tag === 'img') {
		const src = attributes.src || '';
		const alt = attributes.alt || '';
		return `![${alt}](${src})`;
	}

	if (tag === 'blockquote') {
		const inner = children.map((c) => nodeToMarkdown(c, '', true)).join('');
		// Prefix each line with >
		const lines = inner.replace(/\n$/, '').split('\n');
		return lines.map((line) => `> ${line}`).join('\n') + '\n\n';
	}

	// Pre / code block
	if (tag === 'pre') {
		let lang = '';
		let codeContent = '';

		// Check if pre contains a code element
		const codeChild = children.find((c) => c.type === 'element' && c.tag === 'code');
		if (codeChild) {
			lang = (codeChild.attributes?.class || '').replace(/^language-/, '');
			codeContent = getTextContent(codeChild);
		} else {
			// Also check pre's own class for language- (editor internal format)
			lang = (node.attributes?.class || '').match(/language-(\S+)/)?.[1] || '';
			codeContent = getTextContent({ children });
		}

		// Replace <br> represented as newlines
		return '```' + lang + '\n' + codeContent + '\n```\n\n';
	}

	// Details/Summary (GFM)
	if (tag === 'details') {
		return nodeToHtmlFallback(node) + '\n\n';
	}
	if (tag === 'summary') {
		return nodeToHtmlFallback(node);
	}

	// Lists
	if (tag === 'ul') {
		return listToMarkdown(node, indent, false) + '\n';
	}
	if (tag === 'ol') {
		return listToMarkdown(node, indent, true) + '\n';
	}

	if (tag === 'table') {
		return tableToMarkdown(node) + '\n';
	}

	if (tag === 'dl') {
		let result = '';
		for (const child of children) {
			if (child.type !== 'element') continue;
			if (child.tag === 'dt') {
				result += childrenToInline(child.children).trim() + '\n';
			} else if (child.tag === 'dd') {
				result += ': ' + childrenToInline(child.children).trim() + '\n';
			}
		}
		return result + '\n';
	}
	if (tag === 'dt' || tag === 'dd') {
		return childrenToInline(children).trim();
	}

	// Div - check for component containers, otherwise process children
	if (tag === 'div') {
		// Component containers - process inner content
		if (attributes.class && /se-component/.test(attributes.class)) {
			return children.map((c) => nodeToMarkdown(c, indent, true)).join('');
		}
		const content = childrenToInline(children);
		if (isBlock) return content + '\n\n';
		return content;
	}

	// Span - pass through as inline (may contain styles)
	if (tag === 'span') {
		// Check if it has meaningful attributes that need HTML fallback
		if (attributes.style || attributes.class) {
			return nodeToHtmlFallback(node);
		}
		return childrenToInline(children);
	}

	// Figure - process children (usually contains img or other media)
	if (tag === 'figure') {
		return children.map((c) => nodeToMarkdown(c, indent, true)).join('');
	}
	if (tag === 'figcaption') {
		const content = childrenToInline(children).trim();
		return content ? content + '\n\n' : '';
	}

	// Video / Audio / Iframe - fallback to HTML
	if (tag === 'video' || tag === 'audio' || tag === 'iframe') {
		return nodeToHtmlFallback(node) + '\n\n';
	}

	// Abbreviation
	if (tag === 'abbr') {
		return nodeToHtmlFallback(node);
	}

	// HTML fallback
	return nodeToHtmlFallback(node);
}

/**
 * @description Converts a JSON tree (from htmlToJson) to a Markdown string.
 * @param {Object} jsonNode JSON node from htmlToJson
 * @returns {string} Markdown string
 * @example
 * const json = htmlToJson('<p><strong>Hello</strong> World</p>');
 * const md = jsonToMarkdown(json);
 * // '**Hello** World\n\n'
 */
export function jsonToMarkdown(jsonNode) {
	if (!jsonNode) return '';
	const result = nodeToMarkdown(jsonNode, '', true);
	// Trim trailing whitespace but keep final newline
	return result.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// ========================================================================
// Markdown -> HTML Parser
// ========================================================================

/**
 * @description Parse inline markdown syntax to HTML
 * @param {string} text
 * @returns {string} HTML string
 */
function parseInline(text) {
	if (!text) return '';

	const placeholders = [];
	function hold(html) {
		placeholders.push(html);
		return '\uFFFC' + (placeholders.length - 1) + '\uFFFC';
	}

	// 1. Escape sequences: \* \_ \~ \` \[ \] \( \) \# \! \\ \| \{ \} \< \> \+ \-
	text = text.replace(/\\([\\*_~`[\]()#!|{}<>+-])/g, (_, ch) => hold(ch));

	// 2. Inline code — extract to placeholder so inner syntax is not parsed
	text = text.replace(/``\s(.+?)\s``/g, (_, c) => hold('<code>' + c + '</code>'));
	text = text.replace(/`([^`]+)`/g, (_, c) => hold('<code>' + c + '</code>'));

	// 3. Images: ![alt](src "title") or ![alt](src)
	text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, src, title) => {
		return hold(title ? `<img src="${src}" alt="${alt}" title="${title}">` : `<img src="${src}" alt="${alt}">`);
	});

	// 4. Links: [text](url "title") or [text](url)
	text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, t, url, title) => {
		return hold(title ? `<a href="${url}" title="${title}">${t}</a>` : `<a href="${url}">${t}</a>`);
	});

	// 5. Autolinks: <https://url> or <email@example.com>
	text = text.replace(/<(https?:\/\/[^>]+)>/g, (_, url) => hold(`<a href="${url}">${url}</a>`));
	text = text.replace(/<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>/g, (_, email) => hold(`<a href="mailto:${email}">${email}</a>`));

	// 6. GFM autolink: bare URLs (only when not already inside a tag attribute)
	text = text.replace(/(?<![="'\w/])(https?:\/\/[^\s<>\])"]+)/g, (_, url) => hold(`<a href="${url}">${url}</a>`));

	// 7. Strikethrough first (before single tilde subscript)
	text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');

	// 8. Bold+italic: ***text*** or ___text___
	text = text.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
	text = text.replace(/_{3}(.+?)_{3}/g, '<strong><em>$1</em></strong>');

	// 9. Bold: **text** or __text__
	text = text.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
	text = text.replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>');

	// 10. Italic: *text* or _text_
	text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
	text = text.replace(/(?<![a-zA-Z0-9])_(.+?)_(?![a-zA-Z0-9])/g, '<em>$1</em>');

	// 11. GFM highlight: ==text==
	text = text.replace(/==(.+?)==/g, '<mark>$1</mark>');

	// 12. Superscript: ^text^
	text = text.replace(/\^([^\s^]+)\^/g, '<sup>$1</sup>');

	// 13. Subscript: ~text~ (single tilde only, after strikethrough is already consumed)
	text = text.replace(/(?<!~)~([^\s~]+)~(?!~)/g, '<sub>$1</sub>');

	// Restore all placeholders
	text = text.replace(/\uFFFC(\d+)\uFFFC/g, (_, idx) => placeholders[parseInt(idx, 10)]);

	return text;
}

/**
 * @description Parses a Markdown string into an HTML string.
 * - HTML tags in the markdown are passed through as-is (for fallback elements).
 * @param {string} md Markdown string
 * @param {string} [defaultLine='p'] Default block element tag
 * @returns {string} HTML string
 * @example
 * markdownToHtml('# Hello\n\n**bold** text');
 * // '<h1>Hello</h1><p><strong>bold</strong> text</p>'
 */
export function markdownToHtml(md, defaultLine) {
	if (!md) return '';
	if (!defaultLine) defaultLine = 'p';

	const lines = md.split('\n');
	const output = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];

		// Empty line (or zero-width-only line) - skip
		if (isBlankLine(line)) {
			i++;
			continue;
		}

		// Code fence: ``` or ~~~
		const fenceMatch = /^(`{3,}|~{3,})(\w*)/.exec(line);
		if (fenceMatch) {
			const fenceChar = fenceMatch[1].charAt(0);
			const fenceLen = fenceMatch[1].length;
			const lang = fenceMatch[2];
			const codeLines = [];
			i++;
			// Close fence must use same char and at least same length
			const closeRe = new RegExp('^' + (fenceChar === '`' ? '`' : '~') + '{' + fenceLen + ',}\\s*$');
			while (i < lines.length && !closeRe.test(lines[i])) {
				codeLines.push(lines[i]);
				i++;
			}
			i++; // skip closing fence
			const langAttr = lang ? ` class="language-${lang}"` : '';
			output.push(`<pre><code${langAttr}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
			continue;
		}

		// Heading: # ~ ######
		const headingMatch = /^(#{1,6})\s+(.+)/.exec(line);
		if (headingMatch) {
			const level = headingMatch[1].length;
			output.push(`<h${level}>${parseInline(headingMatch[2].trim())}</h${level}>`);
			i++;
			continue;
		}

		// Horizontal rule: ---, ***, ___
		if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
			output.push('<hr>');
			i++;
			continue;
		}

		// Blockquote
		if (/^>\s?/.test(line)) {
			const quoteLines = [];
			while (i < lines.length && /^>\s?/.test(lines[i])) {
				quoteLines.push(lines[i].replace(/^>\s?/, ''));
				i++;
			}
			const innerHtml = markdownToHtml(quoteLines.join('\n'), defaultLine);
			output.push(`<blockquote>${innerHtml}</blockquote>`);
			continue;
		}

		// Table
		if (/^\|.*\|/.test(line) && i + 1 < lines.length && /^\|[\s:]*-{3,}[\s:]*/.test(lines[i + 1])) {
			const tableLines = [];
			while (i < lines.length && /^\|.*\|/.test(lines[i])) {
				tableLines.push(lines[i]);
				i++;
			}
			output.push(parseTable(tableLines));
			continue;
		}

		// Unordered list: - item, * item, + item
		if (/^(\s*)([-*+])\s+/.test(line)) {
			const result = parseList(lines, i, false);
			output.push(result.html);
			i = result.index;
			continue;
		}

		// Ordered list: 1. item
		if (/^(\s*)\d+\.\s+/.test(line)) {
			const result = parseList(lines, i, true);
			output.push(result.html);
			i = result.index;
			continue;
		}

		// HTML tag pass-through (starts with <)
		if (/^\s*<[a-zA-Z]/.test(line)) {
			// Collect all lines until we find the closing or a blank line
			let htmlBlock = line;
			i++;
			// If it's a self-closing or known void element, just pass it
			if (VOID_ELEMENTS.test(line.match(/<(\w+)/)?.[1] || '')) {
				output.push(htmlBlock);
				continue;
			}
			// For block-level HTML, collect until blank line
			while (i < lines.length && !isBlankLine(lines[i])) {
				htmlBlock += '\n' + lines[i];
				i++;
			}
			output.push(htmlBlock);
			continue;
		}

		// Paragraph (default)
		const paraLines = [];
		while (i < lines.length && !isBlankLine(lines[i]) && !/^(#{1,6}\s|`{3,}|~{3,}|>|\||(\s*)([-*+]|\d+\.)\s|(\*{3,}|-{3,}|_{3,})\s*$)/.test(lines[i])) {
			paraLines.push(lines[i]);
			i++;
		}
		if (paraLines.length > 0) {
			const content = parseInline(paraLines.join('\n'));
			output.push(`<${defaultLine}>${content}</${defaultLine}>`);
		} else {
			// Line matched a block-break pattern but no handler caught it (e.g., "|" without table separator)
			output.push(`<${defaultLine}>${parseInline(lines[i])}</${defaultLine}>`);
			i++;
		}
	}

	return output.join('');
}

/**
 * @description Parse markdown table lines into HTML table
 * @param {string[]} tableLines
 * @returns {string}
 */
function parseTable(tableLines) {
	if (tableLines.length < 2) return '';

	const parseRow = (line) =>
		line
			.replace(/^\|/, '')
			.replace(/\|$/, '')
			.split('|')
			.map((c) => c.trim());

	const headers = parseRow(tableLines[0]);
	// Parse separator line for alignment
	const separators = parseRow(tableLines[1]);
	const aligns = separators.map((sep) => {
		const trimmed = sep.trim();
		if (/^:-+:$/.test(trimmed)) return 'center';
		if (/^-+:$/.test(trimmed)) return 'right';
		if (/^:-+$/.test(trimmed)) return 'left';
		return '';
	});

	const rows = tableLines.slice(2).map(parseRow);
	const colCount = headers.length;

	// Check if header row is empty (all cells blank)
	const isEmptyHeader = headers.every((h) => h === '');

	let html = '<table>';

	const alignAttr = (idx) => {
		const a = aligns[idx];
		return a ? ` style="text-align: ${a};"` : '';
	};

	if (!isEmptyHeader) {
		html += '<thead><tr>';
		for (let c = 0; c < colCount; c++) {
			html += `<th${alignAttr(c)}>${parseInline(headers[c])}</th>`;
		}
		html += '</tr></thead>';
	}

	if (rows.length > 0 || isEmptyHeader) {
		html += '<tbody>';
		for (const row of rows) {
			html += '<tr>';
			for (let c = 0; c < colCount; c++) {
				html += `<td${alignAttr(c)}>${parseInline(row[c] || '')}</td>`;
			}
			html += '</tr>';
		}
		html += '</tbody>';
	}

	html += '</table>';
	return html;
}

/**
 * @description Parse markdown list into HTML
 * @param {string[]} lines
 * @param {number} startIndex
 * @param {boolean} ordered
 * @returns {{ html: string, index: number }}
 */
function parseList(lines, startIndex, ordered) {
	const tag = ordered ? 'ol' : 'ul';
	const itemPattern = ordered ? /^(\s*)\d+\.\s+(.*)/ : /^(\s*)([-*+])\s+(.*)/;
	let html = `<${tag}>`;
	let i = startIndex;
	const baseIndent = (lines[i].match(/^(\s*)/)[1] || '').length;

	while (i < lines.length) {
		const line = lines[i];
		if (isBlankLine(line)) {
			i++;
			continue;
		}

		const currentIndent = (line.match(/^(\s*)/)[1] || '').length;

		// If less indented than base, we're done
		if (currentIndent < baseIndent) break;

		// If at base level, check if it matches our list pattern
		if (currentIndent === baseIndent) {
			const match = itemPattern.exec(line);
			if (!match) break;

			const content = ordered ? line.replace(/^\s*\d+\.\s+/, '') : line.replace(/^\s*[-*+]\s+/, '');
			i++;

			// GFM task list checkbox
			let isTask = false;
			let taskChecked = false;
			let displayContent = content;
			const taskMatch = /^\[([ xX])\]\s*(.*)/.exec(content);
			if (taskMatch) {
				isTask = true;
				taskChecked = taskMatch[1] !== ' ';
				displayContent = taskMatch[2];
			}

			// Collect nested blocks (sublists, tables, etc.) that are more indented
			let nestedHtml = '';
			while (i < lines.length) {
				const nextLine = lines[i];
				if (isBlankLine(nextLine)) {
					i++;
					continue;
				}
				const nextIndent = (nextLine.match(/^(\s*)/)[1] || '').length;
				if (nextIndent <= baseIndent) break;

				// Nested list
				if (/^\s*[-*+]\s+/.test(nextLine) || /^\s*\d+\.\s+/.test(nextLine)) {
					const nested = parseList(lines, i, /^\s*\d+\.\s+/.test(nextLine));
					nestedHtml += nested.html;
					i = nested.index;
					continue;
				}

				// Nested table (indented pipe table)
				const trimmedLine = nextLine.trimStart();
				if (/^\|.*\|/.test(trimmedLine) && i + 1 < lines.length && /^\s*\|[\s:]*-{3,}/.test(lines[i + 1])) {
					const tableLines = [];
					while (i < lines.length) {
						const tl = lines[i];
						if (isBlankLine(tl) || (tl.match(/^(\s*)/)[1] || '').length <= baseIndent) break;
						if (!/^\s*\|/.test(tl)) break;
						tableLines.push(tl.trimStart());
						i++;
					}
					nestedHtml += parseTable(tableLines);
					continue;
				}

				// Other indented content — treat as continuation
				break;
			}

			if (isTask) {
				const checkbox = taskChecked ? '<input type="checkbox" checked disabled> ' : '<input type="checkbox" disabled> ';
				html += `<li class="task-list-item">${checkbox}${parseInline(displayContent)}${nestedHtml}</li>`;
			} else {
				html += `<li>${parseInline(content)}${nestedHtml}</li>`;
			}
		} else {
			// More indented - this shouldn't happen if nested blocks are handled above
			break;
		}
	}

	html += `</${tag}>`;
	return { html, index: i };
}

/**
 * @description Escape HTML special characters
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const markdown = {
	jsonToMarkdown,
	markdownToHtml,
};

export default markdown;
