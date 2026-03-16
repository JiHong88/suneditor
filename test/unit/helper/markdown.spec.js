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
			expect(result).toContain('line1\nline2');
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
