/**
 * @jest-environment jsdom
 */

import { isMSOffice, cleanHTML } from '../../../src/helper/msOffice';

describe('Helper - msOffice', () => {
	describe('isMSOffice', () => {
		it('detects desktop Word Mso classes', () => {
			expect(isMSOffice('<p class="MsoNormal">Text</p>')).toBe(true);
			expect(isMSOffice('<p class="MsoListParagraph">1. Item</p>')).toBe(true);
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

		it('detects mso-* CSS styles', () => {
			expect(isMSOffice('<p style="mso-margin-top-alt: auto;">Text</p>')).toBe(true);
			expect(isMSOffice('<span style="mso-list: Ignore;">·</span>')).toBe(true);
		});

		it('returns false for non-MS Office content', () => {
			expect(isMSOffice('<p>Plain HTML paragraph</p>')).toBe(false);
			expect(isMSOffice('<p class="eop-footer developer-eop">Footer</p>')).toBe(false);
			expect(isMSOffice('<p>The mso-format in prose is: valid</p>')).toBe(false);
			expect(isMSOffice('<b id="docs-internal-guid-123"><p>Google Doc</p></b>')).toBe(false);
			expect(isMSOffice('')).toBe(false);
			expect(isMSOffice(null)).toBe(false);
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

			it('preserves user text in selection markers while stripping dark background and classes', () => {
				const input =
					'<p>Highlighted <span class="Selected" style="background-color: rgb(96, 96, 96);">user text</span></p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>Highlighted user text</p>');
			});

			it('preserves media and line breaks inside selection markers', () => {
				const input =
					'<p>Before<span class="Selected" style="background-color: rgb(96, 96, 96);"><img src="https://example.com/pic.png"></span>After</p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p>Before<img src="https://example.com/pic.png">After</p>');
			});

			it('unwraps redundant OutlineElement and Paragraph container divs without losing sibling nodes', () => {
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

			it('removes Office Online classes (SCXW, BCX, NormalTextRun, TextRun, OutlineElement, Paragraph)', () => {
				const input =
					'<p class="custom Paragraph SCXW12345 keep"><span class="TextRun NormalTextRun BCX9876">Text</span></p>';
				const output = cleanHTML(input);
				expect(output).toBe('<p class="custom keep">Text</p>');
			});
		});

		describe('Legacy font tags and windowtext colors', () => {
			it('converts <font> tag with face, explicit color, and size="4" to semantic span while stripping windowtext default color', () => {
				const inputWindowtext = '<font face="Candara" color="windowtext" size="4">Important text</font>';
				expect(cleanHTML(inputWindowtext)).toBe(
					'<span style="font-family: Candara; font-size: 19px">Important text</span>',
				);

				const inputExplicitColor = '<font face="Candara" color="#d9534f" size="4">Colored text</font>';
				expect(cleanHTML(inputExplicitColor)).toBe(
					'<span style="font-family: Candara; color: #d9534f; font-size: 19px">Colored text</span>',
				);
			});

			it('maps legacy <font size="1..7"> values to pixel font-sizes', () => {
				expect(cleanHTML('<font size="2">Small</font>')).toBe('<span style="font-size: 13px">Small</span>');
				expect(cleanHTML('<font size="5">Large</font>')).toBe('<span style="font-size: 24px">Large</span>');
			});

			it('deduplicates pre-existing font-size when size="4" specifies 19px', () => {
				const input =
					'<font face="Candara" size="4" style="font-size: 14pt; font-weight: bold;">Styled text</font>';
				const output = cleanHTML(input);
				expect(output).toBe(
					'<span style="font-family: Candara; font-size: 19px; font-weight: bold">Styled text</span>',
				);
			});

			it('strips color: windowtext on text while mapping windowtext to #000000 on borders', () => {
				const textInput = '<p style="color: windowtext; font-weight: bold;">Theme-adaptive text</p>';
				expect(cleanHTML(textInput)).toBe('<p style="font-weight: bold">Theme-adaptive text</p>');

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

		describe('Word Online cloud font cleanup', () => {
			it('strips _EmbeddedFont and _MSFontService suffixes from font-family styles', () => {
				const input =
					'<span style="font-family: &quot;Segoe Script&quot;, &quot;Segoe Script_EmbeddedFont&quot;, &quot;Segoe Script_MSFontService&quot;, cursive;">Much obliged</span>';
				expect(cleanHTML(input)).toBe(
					'<span style="font-family: &quot;Segoe Script&quot;, \'Apple Chancery\', \'URW Chancery L\', \'Z003\', cursive">Much obliged</span>',
				);

				const inputCalibri =
					'<span style="font-family: Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif;">Body text</span>';
				expect(cleanHTML(inputCalibri)).toBe(
					'<span style="font-family: Calibri, sans-serif">Body text</span>',
				);
			});

			it('strips cloud font suffixes in <font face="..."> attributes during conversion', () => {
				const input =
					'<font face="Calibri, Calibri_EmbeddedFont, Calibri_MSFontService, sans-serif" size="3">Text</font>';
				expect(cleanHTML(input)).toBe(
					'<span style="font-family: Calibri, sans-serif; font-size: 16px">Text</span>',
				);
			});

			it('removes font-family style if only cloud fonts were present', () => {
				const input = '<p style="font-family: Calibri_EmbeddedFont, Calibri_MSFontService;">Cloud only</p>';
				expect(cleanHTML(input)).toBe('<p>Cloud only</p>');
			});

			it('preserves existing style font-family when <font face> contains only cloud fonts', () => {
				const input =
					'<font face="Calibri_EmbeddedFont" style="font-family: Arial, sans-serif;">Fallback font</font>';
				expect(cleanHTML(input)).toBe('<span style="font-family: Arial, sans-serif">Fallback font</span>');
			});

			it('normalizes fallback to cross-platform cursive stack for MS Office script/cursive fonts like Monotype Corsiva', () => {
				const wordOnlineInput =
					'<span style="font-family: &quot;Monotype Corsiva&quot;, &quot;Monotype Corsiva_EmbeddedFont&quot;, &quot;Monotype Corsiva_MSFontService&quot;, sans-serif;">Much obliged,</span>';
				expect(cleanHTML(wordOnlineInput)).toBe(
					'<span style="font-family: &quot;Monotype Corsiva&quot;, \'Apple Chancery\', \'URW Chancery L\', \'Z003\', cursive">Much obliged,</span>',
				);

				const desktopWordInput = '<font face="Monotype Corsiva" size="4">Dr./ John Doe</font>';
				expect(cleanHTML(desktopWordInput)).toBe(
					'<span style="font-family: Monotype Corsiva, \'Apple Chancery\', \'URW Chancery L\', \'Z003\', cursive; font-size: 19px">Dr./ John Doe</span>',
				);
			});
		});
	});
});
