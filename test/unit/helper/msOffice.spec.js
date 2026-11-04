/**
 * @jest-environment jsdom
 */

import { isMSOffice, cleanHTML } from '../../../src/helper/msOffice';

describe('Helper - msOffice', () => {
	describe('isMSOffice', () => {
		it('detects desktop Word Mso classes', () => {
			expect(isMSOffice('<p class="MsoNormal">Text</p>')).toBe(true);
			expect(isMSOffice('<p class="MsoListParagraph">1. Item</p>')).toBe(true);
			expect(isMSOffice('<p class=MsoNormal>Unquoted text</p>')).toBe(true);
			expect(isMSOffice('<p class=MsoListParagraph>Unquoted list</p>')).toBe(true);
		});

		it('detects Word/Excel/OneNote content meta tags', () => {
			expect(isMSOffice('<meta name="Generator" content="Word.Document">')).toBe(true);
			expect(isMSOffice('<meta name="Generator" content="Excel.Sheet">')).toBe(true);
			expect(isMSOffice('<meta name="ProgId" content="OneNote.File">')).toBe(true);
		});

		it('detects Word Online / Office 365 class markers', () => {
			expect(isMSOffice('<div class="OutlineElement SCXW12345"><p class="Paragraph">Hello</p></div>')).toBe(true);
			expect(isMSOffice('<div class="content Paragraph SCXW100"><p>Hello</p></div>')).toBe(true);
			expect(isMSOffice('<span class="NormalTextRun SCXW98765">Online text</span>')).toBe(true);
			expect(isMSOffice('<span class="EOP SCXW2600" style="background-color: rgb(96, 96, 96);">&nbsp;</span>')).toBe(
				true,
			);
		});

		it('detects Office 365 data attributes and XML namespaces', () => {
			expect(isMSOffice('<span data-ccp-props="{}">Text</span>')).toBe(true);
			expect(isMSOffice('<html xmlns:o="urn:schemas-microsoft-com:office:office"></html>')).toBe(true);
			expect(isMSOffice('<html xmlns:w="urn:schemas-microsoft-com:office:word"></html>')).toBe(true);
		});

		it('detects strong Office markers in combinations', () => {
			expect(isMSOffice('<p class="MsoNormal" style="mso-margin-top-alt: auto;">Text</p>')).toBe(true);
			expect(isMSOffice('<div class="OutlineElement"><span style="mso-list: Ignore;">·</span>Item</div>')).toBe(
				true,
			);
			expect(
				isMSOffice('<span class="NormalTextRun" style=\'font-size:11.0pt;font-family:"Calibri",sans-serif;mso-fareast-font-family:Calibri\'>Text</span>'),
			).toBe(true);
			expect(isMSOffice('<html xmlns:o="urn:schemas-microsoft-com:office:office"><style><!-- @list l0 {mso-list-id:1;} --></style></html>')).toBe(true);
		});

		it('returns false for non-MS Office content', () => {
			expect(isMSOffice('<p>Plain HTML paragraph</p>')).toBe(false);
			expect(isMSOffice('<p class="eop-footer developer-eop">Footer</p>')).toBe(false);
			expect(isMSOffice('<div class="is-selected">Custom element</div>')).toBe(false);
			expect(isMSOffice('<div class="tab selected">Selected tab</div>')).toBe(false);
			expect(isMSOffice('<p class="my-paragraph">Custom text</p>')).toBe(false);
			expect(isMSOffice('<p class="paragraph">Generic paragraph class</p>')).toBe(false);
			expect(isMSOffice('<p class=MsoNormal-custom>Unquoted hyphenated class</p>')).toBe(false);
			expect(isMSOffice('<p class="msonormal">Case-sensitive MsoNormal check</p>')).toBe(false);
			expect(isMSOffice('<span class="scxw12345">Case-sensitive SCXW check</span>')).toBe(false);
			expect(isMSOffice('<div class="xl24 col-xl10">Case-sensitive xl check</div>')).toBe(false);
			expect(isMSOffice('<img alt="Use class=MsoNormal in Word" src="https://example.com/a.png">')).toBe(false);
			expect(isMSOffice('<meta data-content="Word.Document">')).toBe(false);
			expect(isMSOffice('<div style="--mso-custom-var: 10px;">CSS custom property</div>')).toBe(false);
			expect(isMSOffice('<p>The mso-format in prose is: valid</p>')).toBe(false);
			expect(isMSOffice('<p>In CSS, mso-style: is a prefix</p>')).toBe(false);
			expect(isMSOffice('<p>The data-ccp-props attribute is used by Word</p>')).toBe(false);
			expect(isMSOffice('<p>xmlns:o=urn:schemas-microsoft-com in prose</p>')).toBe(false);
			expect(isMSOffice('<p>class="MsoNormal" in tutorial text</p>')).toBe(false);
			expect(isMSOffice('<b id="docs-internal-guid-123"><p>Google Doc</p></b>')).toBe(false);
			// Google Sheets real clipboard payloads
			expect(
				isMSOffice(
					'<google-sheets-html-origin><style type="text/css"><!--td {border: 1px solid #cccccc;padding: 2px 3px;}br {mso-data-placement:same-cell;}--></style><table xmlns="http://www.w3.org/1999/xhtml"><colgroup><col width="100"/></colgroup><tbody><tr><td>test</td></tr></tbody></table>',
				),
			).toBe(false);
			expect(
				isMSOffice(
					'<style type="text/css"><!--br {mso-data-placement:same-cell;}--></style><table><colgroup><col width="100"></colgroup><tr><td>Cell 1</td></tr></table>',
				),
			).toBe(false);
			// HTML email template fragments & non-Outlook conditional branches
			expect(
				isMSOffice(
					'<table style="mso-table-lspace:0pt;mso-table-rspace:0pt;"><tr><td style="mso-line-height-rule:exactly;">Email</td></tr></table>',
				),
			).toBe(false);
			expect(isMSOffice('<body style="mso-line-height-rule: exactly;"><!--[if mso | IE]><table><![endif]-->Email</body>')).toBe(false);
			expect(isMSOffice('<!--[if mso]><p>Outlook</p><![endif]-->')).toBe(false);
			expect(isMSOffice('<!--[if !mso]><style>v\\:* {behavior:url(#default#VML);}</style><![endif]-->')).toBe(
				false,
			);
			expect(isMSOffice('<p style="mso-margin-top-alt: auto;">Standalone mso style without strong marker</p>')).toBe(
				false,
			);
			// Tailwind responsive grid and generic class tokens
			expect(
				isMSOffice(
					'<div class="max-w-4xl mx-auto xl:flex 2xl:container col-xl-12"><p class="paragraph selected">Text</p></div>',
				),
			).toBe(false);
			expect(isMSOffice('')).toBe(false);
			expect(isMSOffice(null)).toBe(false);
		});

		it('returns false for real-world web and productivity app payloads', () => {
			// 1. Google Sheets real clipboard table
			const googleSheetsHtml =
				'<google-sheets-html-origin><style type="text/css"><!--td {border: 1px solid #cccccc;padding: 2px 3px;}br {mso-data-placement:same-cell;}--></style>' +
				'<table xmlns="http://www.w3.org/1999/xhtml" data-sheets-root="1"><colgroup><col width="100"/><col width="100"/></colgroup>' +
				'<tbody><tr><td>Header 1</td><td>Header 2</td></tr><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>';
			expect(isMSOffice(googleSheetsHtml)).toBe(false);

			// 2. Google Docs real clipboard payload
			const googleDocsHtml =
				'<b id="docs-internal-guid-12345" style="font-weight:normal;">' +
				'<p dir="ltr"><span style="font-size:11pt;font-family:Arial;color:#000000;">Google Docs paragraph text</span></p>' +
				'</b>';
			expect(isMSOffice(googleDocsHtml)).toBe(false);

			// 3. Marketing HTML email template with tables and mso styling
			const emailTemplateHtml =
				'<table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="width: 100%; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">' +
				'<tbody><tr><td style="mso-line-height-rule: exactly;"><p>Newsletter update</p>' +
				'<table class="btn btn-primary"><tr><td><a href="https://example.com" style="background:#007bff;">Click Here</a></td></tr></table>' +
				'</td></tr></tbody></table>';
			expect(isMSOffice(emailTemplateHtml)).toBe(false);

			// 4. Tailwind CSS documentation / UI component with responsive grid tokens
			const tailwindHtml =
				'<div class="max-w-4xl mx-auto xl:flex 2xl:container col-xl-12">' +
				'<div class="w-full xl:w-1/2 p-6 bg-white rounded-xl shadow-md space-y-4">' +
				'<h2 class="text-xl font-bold text-gray-900 paragraph">Tailwind Card</h2>' +
				'<p class="text-gray-600 paragraph selected">Responsive tokens: xl:flex, 2xl:container, col-xl-4</p>' +
				'<button class="px-4 py-2 bg-blue-600 text-white rounded-lg active selected">Button</button>' +
				'</div></div>';
			expect(isMSOffice(tailwindHtml)).toBe(false);

			// 5. Stack Overflow code article discussing Word cleanup (contains class="MsoNormal" in code blocks and prose)
			const stackOverflowHtml =
				'<div class="s-prose js-post-body">' +
				'<p>To strip <code>class="MsoNormal"</code> when pasting from Word, avoid using loose regexes.</p>' +
				'<pre class="lang-html s-code-block"><code>&lt;p class="MsoNormal"&gt;Example code&lt;/p&gt;</code></pre>' +
				'<p>Check <code>mso-margin-top-alt</code> or <code>xmlns:o=urn:schemas-microsoft-com</code> boundaries.</p>' +
				'</div>';
			expect(isMSOffice(stackOverflowHtml)).toBe(false);
		});
	});

	describe('cleanHTML', () => {
		describe('Word Online / Office 365 artifacts', () => {
			it('removes EOP (End Of Paragraph) markers with dark backgrounds', () => {
				const input =
					'<p>Paragraph text<span class="EOP SCXW2600" style="background-color: rgb(96, 96, 96);">&nbsp;</span></p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>Paragraph text</p>');
			});

			it('removes Selected cursor markers with gray backgrounds', () => {
				const input = '<p>Selected text<span class="Selected" style="background-color: gray;">&nbsp;</span></p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>Selected text</p>');
			});

			it('preserves user text and normal highlights in selection markers', () => {
				const inputYellow =
					'<p>Highlighted <span class="Selected" style="background-color: yellow;">user text</span></p>';
				expect(cleanHTML(inputYellow)).toBe(
					'<p>Highlighted <span style="background-color: yellow">user text</span></p>',
				);

				const inputDark =
					'<p>Highlighted <span class="Selected" style="background-color: rgb(96, 96, 96);">user text</span></p>';
				expect(cleanHTML(inputDark)).toBe(
					'<p>Highlighted <span style="background-color: rgb(96, 96, 96)">user text</span></p>',
				);
			});

			it('preserves media and line breaks inside selection markers', () => {
				const input =
					'<p>Before<span class="Selected" style="background-color: rgb(96, 96, 96);"><img src="https://example.com/pic.png"></span>After</p>';
				const output = cleanHTML(input);
				expect(output).toBe(
					'<p>Before<span style="background-color: rgb(96, 96, 96)"><img src="https://example.com/pic.png"></span>After</p>',
				);
			});

			it('preserves blank lines represented by empty EOP spans between paragraphs', () => {
				const input =
					'<p>First paragraph</p><p class="Paragraph"><span class="EOP">&nbsp;</span></p><p>Second paragraph</p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>First paragraph</p><p><br></p><p>Second paragraph</p>');
			});

			it('preserves whitespace text inside Selected spans', () => {
				const input = '<p>Hello<span class="Selected"> </span>world</p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>Hello world</p>');
			});

			it('preserves blank lines when paragraph contains empty TextRun sibling spans', () => {
				const input =
					'<p>First paragraph</p>' +
					'<p class="Paragraph"><span class="TextRun"><span class="NormalTextRun"></span></span><span class="EOP Selected">&nbsp;</span></p>' +
					'<p>Second paragraph</p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>First paragraph</p><p><br></p><p>Second paragraph</p>');

				const inputWithStyledSpan =
					'<p>First paragraph</p>' +
					'<p class="Paragraph"><span class="TextRun" style="font-size: 12pt"><span class="NormalTextRun"></span></span><span class="EOP Selected">&nbsp;</span></p>' +
					'<p>Second paragraph</p>';
				expect(cleanHTML(inputWithStyledSpan)).toBe('<p>First paragraph</p><p><br></p><p>Second paragraph</p>');
			});

			it('preserves non-breaking spaces inside Selected spans between words', () => {
				const input = '<p>Hello<span class="Selected">&nbsp;</span>world</p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>Hello&nbsp;world</p>');
			});

			it('unwraps redundant OutlineElement container divs without losing sibling nodes', () => {
				const input =
					'<div class="OutlineElement SCXW100">Lead text <p>Paragraph inside OutlineElement</p><h2>Heading</h2></div>';
				const output = cleanHTML(input);
				expect(output).toBe('Lead text <p>Paragraph inside OutlineElement</p><h2>Heading</h2>');
			});

			it('purges Office 365 proprietary metadata attributes', () => {
				const input =
					'<p data-ccp-parastyle="Normal"><span data-ccp-props="{}" data-contrast="none">Clean text</span></p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>Clean text</p>');
			});

			it('removes Office Online classes while preserving hyphenated class names', () => {
				const input =
					'<p class="custom Paragraph SCXW12345 keep is-selected my-paragraph"><span class="TextRun NormalTextRun BCX9876">Text</span></p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p class="custom keep is-selected my-paragraph">Text</p>');
			});
		});

		describe('Legacy font tags and windowtext colors', () => {
			it('converts <font> tag with face, explicit color, and size="4" to semantic span while stripping windowtext default color', () => {
				const inputWindowtext = '<font face="Candara" color="windowtext" size="4">Important text</font>';
				expect(cleanHTML(inputWindowtext)).toBe(
					'<span style="font-family: Candara; font-size: 19px">Important text</span>',
				);

				const inputExplicitColor =
					'<font face="Candara" color="#d9534f" size="4">Colored text</font>';
				expect(cleanHTML(inputExplicitColor)).toBe(
					'<span style="font-family: Candara; color: #d9534f; font-size: 19px">Colored text</span>',
				);
			});

			it('maps legacy <font size="1..7"> values to pixel font-sizes', () => {
				expect(cleanHTML('<font size="2">Small</font>')).toBe('<span style="font-size: 13px">Small</span>');
				expect(cleanHTML('<font size="5">Large</font>')).toBe('<span style="font-size: 24px">Large</span>');
			});

			it('prioritizes inline style over font tag face, color, and size attributes', () => {
				const inputColorWin =
					'<font color="windowtext" style="color: #C00000;">Red text</font>';
				expect(cleanHTML(inputColorWin)).toBe('<span style="color: #C00000">Red text</span>');

				const inputSizeWin =
					'<font face="Candara" size="4" style="font-size: 14pt; font-weight: bold;">Styled text</font>';
				expect(cleanHTML(inputSizeWin)).toBe(
					'<span style="font-family: Candara; font-size: 14pt; font-weight: bold">Styled text</span>',
				);

				const inputFaceWin =
					'<font face="Arial" style="font-family: Georgia;">Custom font</font>';
				expect(cleanHTML(inputFaceWin)).toBe('<span style="font-family: Georgia">Custom font</span>');

				const msoFontInput =
					'<font face="Candara" size="4" style="mso-fareast-font-family: SimSun; mso-bidi-font-size: 14pt; font-weight: bold;">MSO styled text</font>';
				expect(cleanHTML(msoFontInput)).toBe(
					'<span style="font-family: Candara; font-size: 19px; font-weight: bold">MSO styled text</span>',
				);
			});

			it('does not rewrite 14pt to 19px when <font> tag lacks size attribute', () => {
				const input = '<font style="font-size: 14pt;">Kept size</font>';
				const output = cleanHTML(input);
				expect(output).toBe('<span style="font-size: 14pt">Kept size</span>');
			});

			it('strips color: windowtext on text while mapping windowtext to #000000 on borders and links', () => {
				const textInput = '<p style="color: windowtext; font-weight: bold;">Theme-adaptive text</p>';
				expect(cleanHTML(textInput)).toBe('<p style="font-weight: bold">Theme-adaptive text</p>');

				const importantInput =
					'<p style="color: windowtext !important; font-weight: bold;">Important text</p>';
				expect(cleanHTML(importantInput)).toBe('<p style="font-weight: bold">Important text</p>');

				const linkInput = '<a href="https://example.com" style="color: windowtext;">Word Link</a>';
				expect(cleanHTML(linkInput)).toBe('<a href="https://example.com" style="color: #000000">Word Link</a>');

				const linkFontInput =
					'<a href="https://example.com"><font color="windowtext">Word Link Font</font></a>';
				expect(cleanHTML(linkFontInput)).toBe(
					'<a href="https://example.com"><span style="color: #000000">Word Link Font</span></a>',
				);

				const linkSpanInput =
					'<a href="https://example.com"><span style="color: windowtext !important;">Word Link Span</span></a>';
				expect(cleanHTML(linkSpanInput)).toBe(
					'<a href="https://example.com"><span style="color: #000000 !important">Word Link Span</span></a>',
				);

				const tableInput =
					'<table><tr><td style="border: 1pt solid windowtext; color: windowtext;">Cell</td></tr></table>';
				expect(cleanHTML(tableInput)).toBe(
					'<table><tbody><tr><td style="border: 1pt solid #000000">Cell</td></tr></tbody></table>',
				);
			});
		});

		describe('Desktop Word lists & headings', () => {
			it('converts flat MsoList paragraphs with bullet symbols to <ul> list', () => {
				const input =
					'<p class="MsoListParagraph" style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">·&nbsp;</span>First item</p>' +
					'<p class="MsoListParagraph" style="mso-list:l0 level1 lfo1"><span style="mso-list:Ignore">·&nbsp;</span>Second item</p>';
				const output = cleanHTML(input);
				expect(output).toBe('<ul><li>First item</li><li>Second item</li></ul>');
			});

			it('converts mso-outline-level paragraphs to semantic headings', () => {
				const input = '<p style="mso-outline-level:1;">Main Title</p>';
				const output = cleanHTML(input);
				expect(output).toBe('<h1>Main Title</h1>');
			});
		});

		describe('Empty elements & table cleanup', () => {
			it('removes completely empty paragraphs without content', () => {
				const input = '<p>Valid content</p><p></p><p><span style="mso-spacerun:yes">   </span></p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>Valid content</p>');
			});

			it('cleans Word table attributes and Mso classes', () => {
				const input =
					'<table class="MsoNormalTable" cellspacing="0" cellpadding="0"><tr><td valign="top">Cell</td></tr></table>';
				const output = cleanHTML(input);
				expect(output).toBe('<table><tbody><tr><td style="vertical-align:top">Cell</td></tr></tbody></table>');
			});
		});
	});
});
