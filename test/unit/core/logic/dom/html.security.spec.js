/**
 * @jest-environment jsdom
 * @fileoverview XSS security tests for html.js sanitization and attribute encoding
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../../__mocks__/editorIntegration';
import { dom } from '../../../../../src/helper';

jest.setTimeout(30000);

describe('HTML Security - XSS Prevention', () => {
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});

		editor = createTestEditor({
			buttonList: [['bold', 'italic']],
			defaultLine: 'p',
		});

		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
		jest.restoreAllMocks();
	});

	describe('JavaScript protocol sanitization (whitelist approach)', () => {
		it('should block basic javascript: protocol in href', () => {
			const cleaned = editor.$.html.clean('<a href="javascript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/javascript\s*:/i);
		});

		it('should block javascript: protocol with mixed case', () => {
			const cleaned = editor.$.html.clean('<a href="JaVaScRiPt:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/javascript\s*:/i);
		});

		it('should block javascript: protocol with whitespace', () => {
			const cleaned = editor.$.html.clean('<a href="java\tscript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/javascript\s*:/i);
		});

		it('should block javascript: protocol with newlines', () => {
			const cleaned = editor.$.html.clean('<a href="java\nscript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/javascript\s*:/i);
		});

		it('should block javascript: with HTML entities', () => {
			const cleaned = editor.$.html.clean('<a href="&#106;avascript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/javascript\s*:/i);
		});

		it('should block javascript: with hex entities', () => {
			const cleaned = editor.$.html.clean('<a href="&#x6A;avascript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/javascript\s*:/i);
		});

		it('should block vbscript: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="vbscript:MsgBox(1)">link</a>');
			expect(cleaned).not.toMatch(/vbscript\s*:/i);
		});

		it('should allow https: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="https://example.com">link</a>');
			expect(cleaned).toContain('https://example.com');
		});

		it('should allow http: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="http://example.com">link</a>');
			expect(cleaned).toContain('http://example.com');
		});

		it('should allow mailto: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="mailto:test@example.com">link</a>');
			expect(cleaned).toContain('mailto:test@example.com');
		});

		it('should allow tel: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="tel:+1234567890">link</a>');
			expect(cleaned).toContain('tel:+1234567890');
		});

		it('should allow relative URLs', () => {
			const cleaned = editor.$.html.clean('<a href="/path/to/page">link</a>');
			expect(cleaned).toContain('/path/to/page');
		});

		it('should allow fragment URLs', () => {
			const cleaned = editor.$.html.clean('<a href="#section">link</a>');
			expect(cleaned).toContain('#section');
		});

		it('should allow data:image/ URLs for images', () => {
			const cleaned = editor.$.html.clean('<img src="data:image/png;base64,iVBOR">');
			expect(cleaned).toContain('data:image/png');
		});

		it('should allow blob: URLs for images', () => {
			const cleaned = editor.$.html.clean('<img src="blob:http://localhost/abc-123">');
			expect(cleaned).toContain('blob:');
		});

		it('should allow ftp: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="ftp://files.example.com">link</a>');
			expect(cleaned).toContain('ftp://files.example.com');
		});

		it('should allow ftps: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="ftps://files.example.com">link</a>');
			expect(cleaned).toContain('ftps://files.example.com');
		});

		it('should allow sms: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="sms:+1234567890">link</a>');
			expect(cleaned).toContain('sms:+1234567890');
		});

		it('should allow geo: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="geo:37.7749,-122.4194">link</a>');
			expect(cleaned).toContain('geo:37.7749');
		});

		it('should allow webcal: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="webcal://example.com/cal.ics">link</a>');
			expect(cleaned).toContain('webcal:');
		});

		it('should allow callto: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="callto:+1234567890">link</a>');
			expect(cleaned).toContain('callto:');
		});

		it('should block data:text/html URLs', () => {
			const cleaned = editor.$.html.clean('<a href="data:text/html,<script>alert(1)</script>">link</a>');
			expect(cleaned).not.toContain('data:text/html');
		});

		it('should block javascript: in src attribute', () => {
			const cleaned = editor.$.html.clean('<img src="javascript:alert(1)">');
			expect(cleaned).not.toMatch(/javascript\s*:/i);
		});
	});

	describe('Encoded whitespace protocol bypass (CVE report)', () => {
		it('should block javascript: with tab entity &#x09;', () => {
			const cleaned = editor.$.html.clean('<a href="java&#x09;script:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with decimal tab entity &#9;', () => {
			const cleaned = editor.$.html.clean('<a href="java&#9;script:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with URL-encoded tab %09', () => {
			const cleaned = editor.$.html.clean('<a href="java%09script:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with newline entity &#x0A;', () => {
			const cleaned = editor.$.html.clean('<a href="java&#x0A;script:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with literal tab character', () => {
			const cleaned = editor.$.html.clean('<a href="java\tscript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with literal newline', () => {
			const cleaned = editor.$.html.clean('<a href="java\nscript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with spaces between characters', () => {
			const cleaned = editor.$.html.clean('<a href="j a v a s c r i p t:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with leading space', () => {
			const cleaned = editor.$.html.clean('<a href=" javascript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with null byte prefix', () => {
			const cleaned = editor.$.html.clean('<a href="\0javascript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with hex entity for j &#x6a;', () => {
			const cleaned = editor.$.html.clean('<a href="&#x6a;avascript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block javascript: with decimal entity for j &#106;', () => {
			const cleaned = editor.$.html.clean('<a href="&#106;avascript:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block mixed case JaVaScRiPt:', () => {
			const cleaned = editor.$.html.clean('<a href="JaVaScRiPt:alert(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block vbscript: protocol', () => {
			const cleaned = editor.$.html.clean('<a href="vbscript:msgbox(1)">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block data:text/html', () => {
			const cleaned = editor.$.html.clean('<a href="data:text/html,<script>alert(1)</script>">link</a>');
			expect(cleaned).not.toMatch(/href/i);
		});

		it('should block iframe with encoded javascript: src', () => {
			const cleaned = editor.$.html.clean('<iframe src="java&#x09;script:alert(1)"></iframe>');
			expect(cleaned).not.toMatch(/javascript/i);
		});

		it('should block iframe with URL-encoded javascript: src', () => {
			const cleaned = editor.$.html.clean('<iframe src="java%09script:alert(1)"></iframe>');
			expect(cleaned).not.toMatch(/javascript/i);
		});
	});

	describe('Script tag removal', () => {
		it('should remove script tags', () => {
			const cleaned = editor.$.html.clean('<p>safe</p><script>alert(1)</script>');
			expect(cleaned).not.toContain('<script');
			expect(cleaned).toContain('safe');
		});

		it('should remove script tags with attributes', () => {
			const cleaned = editor.$.html.clean('<script type="text/javascript">alert(1)</script><p>safe</p>');
			expect(cleaned).not.toContain('<script');
		});
	});

	describe('Event handler attribute blocking', () => {
		it('should strip onclick attributes via set/get', () => {
			editor.$.html.set('<p onclick="alert(1)">text</p>');
			const content = editor.$.html.get();
			expect(content).not.toContain('onclick');
		});

		it('should strip onerror attributes via set/get', () => {
			editor.$.html.set('<p><img src="x" onerror="alert(1)"></p>');
			const content = editor.$.html.get();
			expect(content).not.toContain('onerror');
		});

		it('should strip onmouseover attributes via set/get', () => {
			editor.$.html.set('<p onmouseover="alert(1)">text</p>');
			const content = editor.$.html.get();
			expect(content).not.toContain('onmouseover');
		});

		it('should strip onload attributes via set/get', () => {
			editor.$.html.set('<p><img src="valid.png" onload="alert(1)"></p>');
			const content = editor.$.html.get();
			expect(content).not.toContain('onload');
		});
	});

	describe('Attribute value encoding (domUtils.getAttributesToString)', () => {
		it('should encode double quotes in attribute values', () => {
			const el = document.createElement('div');
			el.setAttribute('data-test', 'value"with"quotes');
			const result = dom.utils.getAttributesToString(el);
			expect(result).toContain('&quot;');
			expect(result).not.toMatch(/data-test="value"with"/);
		});

		it('should encode angle brackets in attribute values', () => {
			const el = document.createElement('div');
			el.setAttribute('data-test', '<script>alert(1)</script>');
			const result = dom.utils.getAttributesToString(el);
			expect(result).toContain('&lt;');
			expect(result).toContain('&gt;');
		});

		it('should encode ampersands in attribute values', () => {
			const el = document.createElement('div');
			el.setAttribute('data-test', 'a&b');
			const result = dom.utils.getAttributesToString(el);
			expect(result).toContain('&amp;');
		});

		it('should handle multiple attributes with special characters', () => {
			const el = document.createElement('span');
			el.setAttribute('title', 'He said "hello"');
			el.setAttribute('data-info', '<b>bold</b>');
			const result = dom.utils.getAttributesToString(el);
			expect(result).toContain('&quot;');
			expect(result).toContain('&lt;');
		});

		it('should exclude specified attributes', () => {
			const el = document.createElement('div');
			el.setAttribute('class', 'test');
			el.setAttribute('data-secret', 'hidden');
			const result = dom.utils.getAttributesToString(el, ['data-secret']);
			expect(result).toContain('class');
			expect(result).not.toContain('data-secret');
		});
	});
});
