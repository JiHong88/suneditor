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

	describe('iframe clipboard placeholder rebuild', () => {
		/** @param {Object<string, string>} attrs */
		const placeholder = (attrs) =>
			`<div data-se-iframe-holder="1" data-se-iframe-holder-attrs="${JSON.stringify(attrs).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}">[iframe]</div>`;

		const rebuild = (attrs) => {
			const div = document.createElement('div');
			div.innerHTML = editor.$.html.clean(placeholder(attrs));
			return div.querySelector('iframe');
		};

		it('should rebuild a copied editor iframe with its whitelisted and data-se attributes', () => {
			const iframe = rebuild({
				src: 'https://www.youtube.com/embed/abc?a=1&b=2',
				width: '640',
				height: '360',
				frameborder: '0',
				allowfullscreen: '',
				'data-se-size': '640px,360px',
				style: 'width: 640px; height: 360px;',
			});
			expect(iframe).not.toBeNull();
			expect(iframe.getAttribute('src')).toBe('https://www.youtube.com/embed/abc?a=1&b=2');
			expect(iframe.getAttribute('width')).toBe('640');
			expect(iframe.getAttribute('data-se-size')).toBe('640px,360px');
			expect(iframe.hasAttribute('allowfullscreen')).toBe(true);
		});

		it('should drop srcdoc, event handlers and non-whitelisted attributes', () => {
			const iframe = rebuild({
				src: 'https://www.youtube.com/embed/abc',
				srcdoc: '<script>alert(1)</script>',
				onload: 'alert(1)',
				name: 'x',
			});
			expect(iframe).not.toBeNull();
			expect(iframe.hasAttribute('srcdoc')).toBe(false);
			expect(iframe.hasAttribute('onload')).toBe(false);
			expect(iframe.hasAttribute('name')).toBe(false);
			expect(iframe.getAttribute('src')).toBe('https://www.youtube.com/embed/abc');
		});

		it('should drop an attribute whose name breaks out of the tag', () => {
			for (const key of ['a" onload="alert(1)', 'a"/onload="alert(1)', 'a=1 x']) {
				const div = document.createElement('div');
				div.innerHTML = editor.$.html.clean(
					placeholder({ src: 'https://www.youtube.com/embed/abc', [key]: '1' }),
				);
				const iframe = div.querySelector('iframe');
				expect(iframe?.hasAttribute('onload') || false).toBe(false);
				if (iframe) expect(Array.from(iframe.attributes).map((a) => a.name)).toEqual(['src']);
			}
		});

		it('should drop an unsafe src', () => {
			const iframe = rebuild({ src: 'javascript:alert(1)' });
			expect(iframe).not.toBeNull();
			expect(iframe.hasAttribute('src')).toBe(false);
		});

		it('should remove a malformed placeholder instead of throwing', () => {
			for (const raw of ['null', '[]', '"x"', '{bad json', '']) {
				const html = `<p>a</p><div data-se-iframe-holder="1" data-se-iframe-holder-attrs="${raw}">[iframe]</div>`;
				let out;
				expect(() => (out = editor.$.html.clean(html))).not.toThrow();
				expect(out).not.toContain('data-se-iframe-holder');
				expect(out).not.toContain('<iframe');
			}
		});
	});
});

// `attrFilter` / `styleFilter` decide which attributes are kept; event handlers, `srcdoc` and unsafe URLs are
// removed whichever of them is on (`styleFilter: false` used to skip the whitelist and the URL check).
describe.each([
	['attrFilter + styleFilter', {}],
	['styleFilter off', { styleFilter: false }],
	['attrFilter off', { attrFilter: false }],
	['attrFilter + styleFilter off', { attrFilter: false, styleFilter: false }],
])('HTML Security - strictMode %s', (_name, strictMode) => {
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		editor = createTestEditor({ buttonList: [['bold', 'italic']], defaultLine: 'p', strictMode });
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
		jest.restoreAllMocks();
	});

	/** @param {string} html */
	const clean = (html) => {
		const div = document.createElement('div');
		div.innerHTML = editor.$.html.clean(html);
		return div;
	};

	it('should remove javascript: URLs', () => {
		const div = clean(
			'<p><a href="javascript:alert(1)">a</a><a href="java&Tab;script:alert(1)">b</a><a href="javascript&colon;alert(1)">c</a></p>',
		);
		for (const a of div.querySelectorAll('a')) expect(a.hasAttribute('href')).toBe(false);
	});

	it('should remove iframe srcdoc and an unsafe iframe src', () => {
		const iframe = clean('<iframe src="javascript:alert(1)" srcdoc="x"></iframe>').querySelector('iframe');
		expect(iframe?.hasAttribute('srcdoc') || false).toBe(false);
		expect(iframe?.hasAttribute('src') || false).toBe(false);
	});

	it('should remove event handlers', () => {
		const div = clean('<p onclick="alert(1)">x<span onmouseover="alert(1)">y</span></p>');
		for (const el of div.querySelectorAll('*')) {
			expect(Array.from(el.attributes).some((a) => /^on/i.test(a.name))).toBe(false);
		}
	});

	it('should keep safe URLs', () => {
		const a = clean('<p><a href="https://example.com" target="_blank">x</a></p>').querySelector('a');
		expect(a.getAttribute('href')).toBe('https://example.com');
		expect(a.getAttribute('target')).toBe('_blank');
	});

	it('should remove data: URLs other than images', () => {
		const div = clean('<p><a href="data:text/html,x">a</a><img src="data:image/png;base64,AAAA"></p>');
		expect(div.querySelector('a').hasAttribute('href')).toBe(false);
		expect(div.querySelector('img').getAttribute('src')).toBe('data:image/png;base64,AAAA');
	});

	it('should keep custom app schemes only when attrFilter is off (protocol blacklist instead of whitelist)', () => {
		const a = clean('<p><a href="zoommtg://zoom.us/join?confno=1">x</a></p>').querySelector('a');
		expect(a.getAttribute('href') === 'zoommtg://zoom.us/join?confno=1').toBe(strictMode.attrFilter === false);
	});

	it('should apply the attribute whitelist only when attrFilter is on', () => {
		const p = clean('<p data-x="1" title="t">x</p>').querySelector('p');
		expect(p.getAttribute('title')).toBe('t');
		expect(p.hasAttribute('data-x')).toBe(strictMode.attrFilter === false);
	});

	it('should keep the inline style as is only when styleFilter is off', () => {
		const p = clean('<p style="position: fixed;">x</p>').querySelector('p');
		expect(p.getAttribute('style') === 'position: fixed;').toBe(strictMode.styleFilter === false);
	});
});

// `allowedExtraTags` (script, style, meta, link...) is applied whichever `tagFilter`/`formatFilter` setting is used.
describe.each([
	['default', {}],
	['tagFilter off', { tagFilter: false }],
	['tagFilter + formatFilter off', { tagFilter: false, formatFilter: false }],
])('HTML Security - disallowed extra tags, strictMode %s', (_name, strictMode) => {
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		editor = createTestEditor({ buttonList: [['bold', 'italic']], defaultLine: 'p', strictMode });
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
		jest.restoreAllMocks();
	});

	it('should remove script tags', () => {
		const cleaned = editor.$.html.clean(
			'<p>a<script>alert(1)</script></p><script src="//x"></script><script>b</script>',
		);
		expect(cleaned).not.toMatch(/<script/i);
		expect(cleaned).toContain('a');
	});

	it('should remove a script tag rebuilt from the remains of a removed one', () => {
		const cleaned = editor.$.html.clean('<p>a</p><scr<script></script>ipt>alert(1)</script>');
		expect(cleaned).not.toMatch(/<script/i);
	});

	it('should remove style, meta and link tags', () => {
		const cleaned = editor.$.html.clean(
			'<p>a</p><style>@import "x";</style><meta http-equiv="refresh" content="0;url=x"><link rel="stylesheet" href="x">',
		);
		expect(cleaned).not.toMatch(/<(style|meta|link)/i);
	});
});

describe('HTML Security - every extra tag allowed', () => {
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		editor = createTestEditor({
			buttonList: [['bold']],
			defaultLine: 'p',
			allowedExtraTags: { script: true, style: true, meta: true, link: true, '[a-z]+:[a-z]+': true },
		});
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
		jest.restoreAllMocks();
	});

	it('should not strip ordinary tags when no extra tag is disallowed', () => {
		expect(editor.$.html.clean('<p>a<strong>b</strong></p>')).toBe('<p>a<strong>b</strong></p>');
	});
});

describe('HTML Security - setFullPage head', () => {
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		editor = createTestEditor({ buttonList: [['bold']], defaultLine: 'p', iframe: true, iframe_cssFileName: [] });
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
		jest.restoreAllMocks();
	});

	it('should remove a disallowed tag rebuilt from the remains of a removed one', () => {
		editor.$.html.setFullPage({
			head: '<title>t</title><sty<style></style>le>body{display:none}</style><li<link>nk rel="stylesheet" href="//x">',
		});
		const head = editor.$.frameContext.get('_wd').head.innerHTML;
		expect(head).not.toMatch(/<(style|link)/i);
		expect(head).toContain('<title>t</title>');
	});
});
