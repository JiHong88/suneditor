import { markdown, converter } from '../../../src/helper';

const { jsonToMarkdown, markdownToHtml } = markdown;

describe('markdown helper', () => {
	describe('jsonToMarkdown', () => {
		function htmlToMd(html) {
			return jsonToMarkdown(converter.htmlToJson(html));
		}

		it('should return empty string for null input', () => {
			expect(jsonToMarkdown(null)).toBe('');
			expect(jsonToMarkdown(undefined)).toBe('');
		});

		it('should convert paragraph', () => {
			expect(htmlToMd('<p>Hello World</p>')).toBe('Hello World\n');
		});

		it('should convert headings h1-h6', () => {
			expect(htmlToMd('<h1>Title</h1>')).toBe('# Title\n');
			expect(htmlToMd('<h2>Subtitle</h2>')).toBe('## Subtitle\n');
			expect(htmlToMd('<h3>H3</h3>')).toBe('### H3\n');
			expect(htmlToMd('<h4>H4</h4>')).toBe('#### H4\n');
			expect(htmlToMd('<h5>H5</h5>')).toBe('##### H5\n');
			expect(htmlToMd('<h6>H6</h6>')).toBe('###### H6\n');
		});

		it('should NOT emit a bare heading prefix for an empty heading line', () => {
			// Regression: an empty heading (blank line still carrying an h-tag) used to serialize to a
			// bare '####' instead of nothing. Empty headings become a blank line, like empty paragraphs.
			expect(htmlToMd('<h4><br></h4>')).toBe('\n');
			expect(htmlToMd('<h4>​</h4>')).toBe('\n');
			expect(htmlToMd('<h4></h4>')).toBe('\n');
			// surrounded by real content: the empty heading collapses to a separator, not '####'
			expect(htmlToMd('<h1>A</h1><h4><br></h4><p>B</p>')).toBe('# A\n\nB\n');
		});

		it('should convert bold', () => {
			expect(htmlToMd('<p><strong>bold</strong></p>')).toBe('**bold**\n');
			expect(htmlToMd('<p><b>bold</b></p>')).toBe('**bold**\n');
		});

		it('should convert italic', () => {
			expect(htmlToMd('<p><em>italic</em></p>')).toBe('*italic*\n');
			expect(htmlToMd('<p><i>italic</i></p>')).toBe('*italic*\n');
		});

		it('should convert strikethrough', () => {
			expect(htmlToMd('<p><del>strike</del></p>')).toBe('~~strike~~\n');
			expect(htmlToMd('<p><s>strike</s></p>')).toBe('~~strike~~\n');
		});

		it('should convert links', () => {
			expect(htmlToMd('<p><a href="https://example.com">link</a></p>')).toBe('[link](https://example.com)\n');
		});

		it('should convert images', () => {
			expect(htmlToMd('<img src="test.png" alt="alt text">')).toBe('![alt text](test.png)\n');
		});

		it('should convert inline code', () => {
			expect(htmlToMd('<p><code>code</code></p>')).toBe('`code`\n');
		});

		it('should convert horizontal rule', () => {
			expect(htmlToMd('<hr>')).toBe('---\n');
		});

		it('should convert unordered list', () => {
			const html = '<ul><li>one</li><li>two</li><li>three</li></ul>';
			const result = htmlToMd(html);
			expect(result).toContain('- one');
			expect(result).toContain('- two');
			expect(result).toContain('- three');
		});

		it('should convert ordered list', () => {
			const html = '<ol><li>first</li><li>second</li></ol>';
			const result = htmlToMd(html);
			expect(result).toContain('1. first');
			expect(result).toContain('2. second');
		});

		it('should convert table inside list item', () => {
			const html = '<ul><li>item<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table></li></ul>';
			const result = htmlToMd(html);
			expect(result).toContain('- item');
			expect(result).toContain('| A | B |');
			expect(result).toContain('| 1 | 2 |');
		});

		it('should convert figure-wrapped table inside list item', () => {
			const html = '<ul><li>item<figure class="se-flex-component"><table><thead><tr><th>X</th><th>Y</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table></figure></li></ul>';
			const result = htmlToMd(html);
			expect(result).toContain('- item');
			expect(result).toContain('| X | Y |');
			expect(result).toContain('| a | b |');
		});

		it('should convert blockquote', () => {
			const html = '<blockquote><p>quoted text</p></blockquote>';
			const result = htmlToMd(html);
			expect(result).toContain('> quoted text');
		});

		it('should convert code block', () => {
			const html = '<pre><code>const x = 1;</code></pre>';
			const result = htmlToMd(html);
			expect(result).toContain('```');
			expect(result).toContain('const x = 1;');
		});

		it('should convert table', () => {
			const html = '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>';
			const result = htmlToMd(html);
			expect(result).toContain('| A | B |');
			expect(result).toContain('| --- | --- |');
			expect(result).toContain('| 1 | 2 |');
		});

		it('should handle table with colspan', () => {
			const html = '<table><thead><tr><th colspan="2">AB</th><th>C</th></tr></thead><tbody><tr><td>1</td><td>2</td><td>3</td></tr></tbody></table>';
			const result = htmlToMd(html);
			expect(result).toContain('| AB |  | C |');
			expect(result).toContain('| --- | --- | --- |');
			expect(result).toContain('| 1 | 2 | 3 |');
		});

		it('should handle table without header', () => {
			const html = '<table><tbody><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>';
			const result = htmlToMd(html);
			// Empty header row should be generated
			expect(result).toContain('|   |   |');
			expect(result).toContain('| --- | --- |');
			// Data rows preserved
			expect(result).toContain('| 1 | 2 |');
			expect(result).toContain('| 3 | 4 |');
		});

		it('should handle table with rowspan', () => {
			const html = '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td rowspan="2">X</td><td>1</td></tr><tr><td>2</td></tr></tbody></table>';
			const result = htmlToMd(html);
			expect(result).toContain('| A | B |');
			expect(result).toContain('| X | 1 |');
			expect(result).toContain('|  | 2 |');
		});

		it('should handle mixed inline formatting', () => {
			const html = '<p>Hello <strong>bold</strong> and <em>italic</em> text</p>';
			const result = htmlToMd(html);
			expect(result).toBe('Hello **bold** and *italic* text\n');
		});

		it('should fallback to HTML for unsupported elements', () => {
			expect(htmlToMd('<p><u>underline</u></p>')).toContain('<u>underline</u>');
			expect(htmlToMd('<p><sub>sub</sub></p>')).toContain('<sub>sub</sub>');
			expect(htmlToMd('<p><sup>sup</sup></p>')).toContain('<sup>sup</sup>');
		});

		it('should fallback styled spans to HTML', () => {
			const html = '<p><span style="color: red;">red text</span></p>';
			const result = htmlToMd(html);
			expect(result).toContain('<span style="color: red;">red text</span>');
		});

		it('should handle line breaks', () => {
			const html = '<p>line1<br>line2</p>';
			const result = htmlToMd(html);
			expect(result).toContain('line1\\\nline2');
		});
	});

	describe('markdownToHtml', () => {
		it('should return empty string for empty input', () => {
			expect(markdownToHtml('')).toBe('');
			expect(markdownToHtml(null)).toBe('');
		});

		it('should convert headings', () => {
			expect(markdownToHtml('# Title')).toBe('<h1>Title</h1>');
			expect(markdownToHtml('## Subtitle')).toBe('<h2>Subtitle</h2>');
			expect(markdownToHtml('###### H6')).toBe('<h6>H6</h6>');
		});

		it('should convert paragraph', () => {
			expect(markdownToHtml('Hello World')).toBe('<p>Hello World</p>');
		});

		it('should convert paragraph with custom defaultLine', () => {
			expect(markdownToHtml('Hello', 'div')).toBe('<div>Hello</div>');
		});

		it('should convert bold', () => {
			expect(markdownToHtml('**bold**')).toBe('<p><strong>bold</strong></p>');
		});

		it('should convert italic', () => {
			expect(markdownToHtml('*italic*')).toBe('<p><em>italic</em></p>');
		});

		it('should convert strikethrough', () => {
			expect(markdownToHtml('~~strike~~')).toBe('<p><del>strike</del></p>');
		});

		it('should convert inline code', () => {
			expect(markdownToHtml('`code`')).toBe('<p><code>code</code></p>');
		});

		it('should convert links', () => {
			expect(markdownToHtml('[text](url)')).toBe('<p><a href="url">text</a></p>');
		});

		it('should convert images', () => {
			expect(markdownToHtml('![alt](src.png)')).toBe('<p><img src="src.png" alt="alt"></p>');
		});

		it('should convert horizontal rule', () => {
			expect(markdownToHtml('---')).toBe('<hr>');
			expect(markdownToHtml('***')).toBe('<hr>');
		});

		it('should convert unordered list', () => {
			const result = markdownToHtml('- one\n- two\n- three');
			expect(result).toBe('<ul><li>one</li><li>two</li><li>three</li></ul>');
		});

		it('should convert ordered list', () => {
			const result = markdownToHtml('1. first\n2. second');
			expect(result).toBe('<ol><li>first</li><li>second</li></ol>');
		});

		it('should convert blockquote', () => {
			const result = markdownToHtml('> quoted text');
			expect(result).toContain('<blockquote>');
			expect(result).toContain('quoted text');
		});

		it('should convert code fence', () => {
			const result = markdownToHtml('```js\nconst x = 1;\n```');
			expect(result).toContain('<pre><code class="language-js">');
			expect(result).toContain('const x = 1;');
		});

		it('should convert table', () => {
			const md = '| A | B |\n| --- | --- |\n| 1 | 2 |';
			const result = markdownToHtml(md);
			expect(result).toContain('<table>');
			expect(result).toContain('<th>A</th>');
			expect(result).toContain('<td>1</td>');
		});

		it('should pass through HTML tags', () => {
			const result = markdownToHtml('<u>underline</u>');
			expect(result).toContain('<u>underline</u>');
		});

		it('should handle mixed content', () => {
			const md = '# Title\n\nSome **bold** text.\n\n- item1\n- item2';
			const result = markdownToHtml(md);
			expect(result).toContain('<h1>Title</h1>');
			expect(result).toContain('<strong>bold</strong>');
			expect(result).toContain('<ul>');
			expect(result).toContain('<li>item1</li>');
		});
	});

	describe('text and numbering preservation', () => {
		it.each([
			'Read the **Rules**. Then set `title` (max 100).\n\n- Set `title` (max 100).\n- Use **bold** here.\n\n5. Fifth step.\n6. Sixth step.\n',
			'(`x`), **bold**! **a** **b**; [link](https://example.com).\n',
			'- [x] Set `title` here.\n- Use **bold** here.\n',
			'1. One\n2. Two\n\nParagraph.\n\n3. Three\n4. Four\n',
			'0. Zero\n1. One\n',
			'5. Parent\n   8. Nested\n   9. Next\n6. Last\n',
		])('preserves Markdown over repeated conversions: %s', (input) => {
			let result = input;
			for (let i = 0; i < 3; i++) {
				result = jsonToMarkdown(converter.htmlToJson(markdownToHtml(result)));
				expect(result).toBe(input);
			}
		});

		it.each([0, 5, 10])('preserves ordered start %i in both directions', (start) => {
			const html = `<ol start="${start}"><li>First</li><li>Next</li></ol>`;
			const md = `${start}. First\n${start + 1}. Next\n`;
			expect(markdownToHtml(md)).toBe(html);
			expect(jsonToMarkdown(converter.htmlToJson(html))).toBe(md);
		});

		it.each(['body', 'div', 'blockquote'])('preserves bare inline separators in %s', (tag) => {
			const html = `<${tag}><strong>A</strong> <code>B</code></${tag}>`;
			expect(jsonToMarkdown(converter.htmlToJson(html))).toContain('**A** `B`');
		});

		it('ignores whitespace between blocks without losing inline separators', () => {
			const html = '<p><strong>A</strong> <code>B</code>.</p>\n  <p>C</p>';
			expect(jsonToMarkdown(converter.htmlToJson(html))).toBe('**A** `B`.\n\nC\n');
		});
	});

	describe('review regressions', () => {
		it.each(['strong', 'em', 'del', 'mark'])('preserves multiline %s content', (tag) => {
			let html = `<p><${tag}>\n  first\n\nsecond\n</${tag}> text</p>`;
			const expected = html;
			for (let i = 0; i < 3; i++) {
				html = markdownToHtml(jsonToMarkdown(converter.htmlToJson(html)));
				expect(new DOMParser().parseFromString(html, 'text/html').body.innerHTML).toBe(expected);
			}
		});

		it.each([
			'<ol start="-2"><li>First</li><li>Next</li></ol>',
			'<ul><li>Parent<ol start="-2"><li>Nested</li></ol></li></ul>',
			'<ol start="-2"><li>&lt;tag&gt; &amp; text</li></ol>',
		])('preserves unsupported list starts as HTML: %s', (input) => {
			let html = input;
			for (let i = 0; i < 3; i++) {
				html = markdownToHtml(jsonToMarkdown(converter.htmlToJson(html)));
				expect(html).toBe(input);
			}
		});

		it.each([
			['<p><em>A</em><strong>B</strong></p>', '<p><em>A</em><strong>B</strong></p>'],
			[
				'<p><em>A</em><em>B</em> <strong>C</strong><em>D</em></p>',
				'<p><em>A</em><em>B</em> <strong>C</strong><em>D</em></p>',
			],
			['<p><em> word</em> rest</p>', '<p><em>word</em> rest</p>'],
			['<p>x <em> y </em>z</p>', '<p>x  <em>y</em> z</p>'],
			['<p>x<br><em> y</em></p>', '<p>x<br> <em>y</em></p>'],
		])('keeps adjacent or space-padded emphasis inline: %s', (input, expected) => {
			let html = input;
			for (let i = 0; i < 3; i++) {
				html = markdownToHtml(jsonToMarkdown(converter.htmlToJson(html)));
				expect(html).toBe(expected);
			}
		});

		it.each([
			// paragraph: a line that would start a block is escaped
			['<p><strong>A</strong>\n- b</p>', '<p><strong>A</strong>\n- b</p>'],
			['<p>a\n# b</p>', '<p>a\n# b</p>'],
			['<p>a\n| b |</p>', '<p>a\n| b |</p>'],
			['<p><code>a\n- b</code></p>', '<p><code>a - b</code></p>'],
			['<ul><li><code>a\nb</code></li></ul>', '<ul><li><code>a b</code></li></ul>'],
			['<p>- a</p>', '<p>- a</p>'],
			['<p>1. a</p>', '<p>1. a</p>'],
			['<p>line1\nline2</p>', '<p>line1\nline2</p>'],
			['<p>a\n  \nb</p>', '<p>a\nb</p>'],
			['<div>a\n- b</div>', '<p>a\n- b</p>'],
			['<blockquote><p>a\n- b</p></blockquote>', '<blockquote><p>a\n- b</p></blockquote>'],
			// paragraph: <br> is a hard line break; edge <br> is the empty line placeholder
			['<p>a<br>b</p>', '<p>a<br>b</p>'],
			['<p>a<br><br>b</p>', '<p>a<br><br>b</p>'],
			['<p>a<br>\nb</p>', '<p>a<br>b</p>'],
			['<p>a<br>- b</p>', '<p>a<br>- b</p>'],
			['<p>a\\<br>b</p>', '<p>a\\<br>b</p>'],
			['<p>a\\\nb</p>', '<p>a\\\nb</p>'],
			['<p>a<br></p>', '<p>a</p>'],
			['<p><strong>a<br>b</strong></p>', '<p><strong>a<br>b</strong></p>'],
			['<p><a href="x">a<br>b</a></p>', '<p><a href="x">a<br>b</a></p>'],
			['<div>a<br>b</div>', '<p>a<br>b</p>'],
			['<blockquote><p>a<br>b</p></blockquote>', '<blockquote><p>a<br>b</p></blockquote>'],
			// single-line blocks: breaks never leave the line
			['<ul><li><strong>A</strong>\nb</li></ul>', '<ul><li><strong>A</strong>&#10;b</li></ul>'],
			['<ul><li>a<br>b</li></ul>', '<ul><li>a<br>b</li></ul>'],
			['<ul><li>a</li><li><br></li><li>b</li></ul>', '<ul><li>a</li><li></li><li>b</li></ul>'],
			['<ol start="3"><li><br></li></ol>', '<ol start="3"><li></li></ol>'],
			[
				'<table><tbody><tr><td>a<br>b</td><td><br></td></tr></tbody></table>',
				'<table><tbody><tr><td>a<br>b</td><td></td></tr></tbody></table>',
			],
			['<h2>A<br>B</h2>', '<h2>A<br>B</h2>'],
		])('keeps line breaks inside their block: %s', (input, expected) => {
			let html = input;
			for (let i = 0; i < 3; i++) {
				html = markdownToHtml(jsonToMarkdown(converter.htmlToJson(html)));
				expect(html).toBe(expected);
			}
		});

		it.each([
			['<p><span style="color: red;">a</span> <strong>b</strong></p>'],
			['<p><u>a</u> <em>b</em></p>'],
			['<p>a</p><video src="x"></video><p>b</p>'],
		])('parses only block tags as HTML blocks: %s', (input) => {
			let html = input;
			for (let i = 0; i < 3; i++) {
				html = markdownToHtml(jsonToMarkdown(converter.htmlToJson(html)));
				expect(html).toBe(input);
			}
		});

		it.each([
			['<p>2*3*4 = 24, **kwargs</p>', '2\\*3\\*4 = 24, \\*\\*kwargs'],
			['<p>file_name and _draft_ 가_나</p>', 'file_name and \\_draft\\_ 가\\_나'],
			['<p>10시~12시 ~x~ 안녕~</p>', '10시\\~12시 \\~x\\~ 안녕\\~'],
			['<p>x^2 a ==b== c</p>', 'x^2 a \\==b\\== c'],
			['<p>see [1](note) `npm i`</p>', 'see [1\\](note) \\`npm i\\`'],
			['<p>&lt;b&gt;x&lt;/b&gt; &amp;lt; a &lt; b &amp; c</p>', '\\<b>x\\</b> \\&lt; a < b & c'],
			['<p>C:\\temp\\*</p>', 'C:\\temp\\\\\\*'],
			['<p>a~<del>b</del> a=<mark>b</mark></p>', 'a\\~~~b~~ a\\===b=='],
			['<p><span class="__se__a">x*y*</span></p>', '<span class="__se__a">x\\*y\\*</span>'],
			['<p><code>&lt;b&gt; a*b*</code></p>', '`<b> a*b*`'],
			['<ul><li>[ ] text</li></ul>', '- [ \\] text'],
			['<table><tbody><tr><td><code>a|b</code> c|d</td></tr></tbody></table>', '|   |\n| --- |\n| `a\\|b` c\\|d |'],
		])('escapes text only where it would be parsed as syntax: %s', (input, md) => {
			const result = jsonToMarkdown(converter.htmlToJson(input));
			expect(result).toBe(md + '\n');
			let html = input;
			for (let i = 0; i < 3; i++) {
				html = markdownToHtml(jsonToMarkdown(converter.htmlToJson(html)));
				expect(new DOMParser().parseFromString(html, 'text/html').body.innerHTML).toBe(input);
			}
		});

		it.each([
			['a  \nb', '<p>a<br>b</p>'],
			['a\\\nb', '<p>a<br>b</p>'],
			['a\\\\\nb', '<p>a\\\nb</p>'],
			['[a\\*b](x)', '<p><a href="x">a*b</a></p>'],
			['- a\n-\n- b', '<ul><li>a</li><li></li><li>b</li></ul>'],
			['1.', '<ol><li></li></ol>'],
			['a\n-', '<p>a\n-</p>'],
			['`a\\*b` \\=\\. <span class="__se__">x</span>', '<p><code>a\\*b</code> =. <span class="__se__">x</span></p>'],
			['\\<b>x\\</b>', '<p>&lt;b>x&lt;/b></p>'],
		])('parses hard breaks, nested escapes and empty list items: %s', (md, expected) => {
			expect(markdownToHtml(md)).toBe(expected);
		});
	});

	describe('roundtrip', () => {
		function roundtrip(html) {
			const json = converter.htmlToJson(html);
			const md = jsonToMarkdown(json);
			return markdownToHtml(md);
		}

		it('should preserve headings through roundtrip', () => {
			const result = roundtrip('<h1>Title</h1>');
			expect(result).toContain('<h1>Title</h1>');
		});

		it('should preserve bold through roundtrip', () => {
			const result = roundtrip('<p><strong>bold</strong></p>');
			expect(result).toContain('<strong>bold</strong>');
		});

		it('should preserve links through roundtrip', () => {
			const result = roundtrip('<p><a href="https://example.com">link</a></p>');
			expect(result).toContain('<a href="https://example.com">link</a>');
		});

		it('should preserve lists through roundtrip', () => {
			const result = roundtrip('<ul><li>one</li><li>two</li></ul>');
			expect(result).toContain('<li>one</li>');
			expect(result).toContain('<li>two</li>');
		});

		it('should preserve table inside list through roundtrip', () => {
			const html = '<ul><li>item<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table></li></ul>';
			const result = roundtrip(html);
			expect(result).toContain('<li>');
			expect(result).toContain('<table>');
			expect(result).toContain('<th>A</th>');
			expect(result).toContain('<td>1</td>');
		});
	});
});
