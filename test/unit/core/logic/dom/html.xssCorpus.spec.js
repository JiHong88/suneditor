/**
 * @jest-environment jsdom
 * @fileoverview XSS regression corpus for the HTML sanitizer.
 *
 * Every payload is pushed through `html.clean()` and `html.set()` → `html.get()` on two editors
 * (no plugins / every content plugin) and the output is inspected as a DOM, not by regex:
 * no executable tag, no event-handler attribute, no script-capable URL in any URL attribute.
 *
 * Add new payloads to `CORPUS` when a sanitizer bypass is reported or fixed.
 */

import { createTestEditor, destroyTestEditor, waitForEditorReady } from '../../../../__mocks__/editorIntegration';
import { blockquote, list, table, link, image, video, audio, embed, math, anchor, codeBlock } from '../../../../../src/plugins';

jest.setTimeout(60000);

/** @type {Array<[string, string]>} [label, payload] */
const CORPUS = [
	// --- dangerous URL protocols
	['a href javascript', '<a href="javascript:alert(1)">x</a>'],
	['a href entity-split javascript', '<a href="jav&#x09;ascript:alert(1)">x</a>'],
	['a href control-char prefix', '<a href="&#x01;javascript:alert(1)">x</a>'],
	['a href data html', '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>'],
	['a xlink:href', '<a xlink:href="javascript:alert(1)">x</a>'],
	['img src javascript', '<img src="javascript:alert(1)">'],
	['img srcset javascript', '<img src="a.png" srcset="javascript:alert(1) 1x">'],
	['video poster javascript', '<video poster="javascript:alert(1)" src="a.mp4"></video>'],
	['source src javascript', '<video><source src="javascript:alert(1)"></video>'],
	['td background javascript', '<table><tbody><tr><td background="javascript:alert(1)">x</td></tr></tbody></table>'],

	// --- event handlers
	['img onerror', '<img src="x" onerror="alert(1)">'],
	['body onload', '<body onload="alert(1)"><p>x</p></body>'],
	['details ontoggle', '<details open ontoggle="alert(1)"><summary>x</summary></details>'],
	['p onpointerenter', '<p onpointerenter="alert(1)">x</p>'],
	['input onfocus autofocus', '<input autofocus onfocus="alert(1)">'],
	['video onloadstart', '<video src="a.mp4" onloadstart="alert(1)"></video>'],
	['uppercase handler', '<p ONCLICK="alert(1)">x</p>'],
	['slash-separated handler', '<img/src="x"/onerror="alert(1)">'],

	// --- executable / navigation tags
	['script', '<script>alert(1)</script><p>x</p>'],
	['script in table', '<table><tbody><tr><td><script>alert(1)</script></td></tr></tbody></table>'],
	['object data', '<object data="javascript:alert(1)"></object>'],
	['embed src', '<embed src="javascript:alert(1)">'],
	['applet', '<applet code="x"></applet>'],
	['base href', '<base href="javascript:alert(1)//"><a href="x">x</a>'],
	['meta refresh', '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">'],
	['form action', '<form action="javascript:alert(1)"><button>x</button></form>'],
	['button formaction', '<button formaction="javascript:alert(1)">x</button>'],

	// --- iframe
	['iframe src javascript', '<iframe src="javascript:alert(1)"></iframe>'],
	['iframe srcdoc', '<iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;"></iframe>'],
	['iframe src data html', '<iframe src="data:text/html,&lt;script&gt;alert(1)&lt;/script&gt;"></iframe>'],

	// --- SVG
	['svg onload', '<svg onload="alert(1)"></svg>'],
	['svg script', '<svg><script>alert(1)</script></svg>'],
	['svg a xlink', '<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>'],
	['svg animate href', '<svg><a><animate attributeName="href" values="javascript:alert(1)"/><text>x</text></a></svg>'],
	['svg set onbegin', '<svg><set attributeName="x" onbegin="alert(1)"/></svg>'],
	['svg foreignObject', '<svg><foreignObject><img src="x" onerror="alert(1)"></foreignObject></svg>'],
	['svg use data', '<svg><use href="data:image/svg+xml,&lt;svg id=x onload=alert(1)&gt;&lt;/svg&gt;#x"/></svg>'],

	// --- MathML
	['math maction href', '<math><maction actiontype="statusline" xlink:href="javascript:alert(1)">x</maction></math>'],
	['math mtext img', '<math><mtext><img src="x" onerror="alert(1)"></mtext></math>'],
	['math href', '<math href="javascript:alert(1)"><mi>x</mi></math>'],

	// --- parser differentials / mutation XSS
	['noscript mutation', '<noscript><p title="</noscript><img src=x onerror=alert(1)>"></noscript>'],
	['template content', '<template><img src="x" onerror="alert(1)"></template>'],
	['style breakout', '<style></style><img src="x" onerror="alert(1)"></style>'],
	['textarea breakout', '<textarea></textarea><img src="x" onerror="alert(1)"></textarea>'],
	['title breakout', '<title></title><img src="x" onerror="alert(1)">'],
	['comment breakout', '<!--><img src="x" onerror="alert(1)">-->'],
	['cdata in html', '<![CDATA[><img src="x" onerror="alert(1)">]]>'],
	['unclosed attribute', '<p title="x><img src=x onerror=alert(1)>">y</p>'],
	['nested malformed', '<p><b><i><a href="javascript:alert(1)"><img src=x onerror=alert(1)></b></p>'],
	['select breakout', '<select><option><img src="x" onerror="alert(1)"></option></select>'],
];

const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'xlink:href', 'data', 'poster', 'background', 'codebase', 'cite', 'longdesc', 'srcset', 'values', 'to', 'from']);
const FORBIDDEN_TAGS = new Set(['script', 'object', 'applet', 'base', 'meta', 'embed', 'form', 'noscript', 'template']);
const DANGEROUS_PROTOCOL = /^(?:javascript|vbscript|data:text\/html|data:image\/svg\+xml|data:application)/i;

/**
 * Normalizes a URL attribute the way a browser would before resolving its scheme.
 * @param {string} value
 * @returns {string}
 */
function normalizeUrl(value) {
	const ta = document.createElement('textarea');
	ta.innerHTML = value;
	let decoded = ta.value;
	try {
		decoded = decodeURIComponent(decoded);
	} catch {
		// keep the raw value
	}
	// eslint-disable-next-line no-control-regex
	return decoded.replace(/[\u0000- \u007f-\u009f]/g, '');
}

/**
 * Returns a list of violations found in sanitized output.
 * @param {string} output
 * @returns {string[]}
 */
function findViolations(output) {
	const violations = [];
	const container = document.createElement('div');
	container.innerHTML = output;

	for (const el of container.querySelectorAll('*')) {
		const tag = el.localName.toLowerCase();
		if (FORBIDDEN_TAGS.has(tag)) violations.push(`<${tag}>`);
		if (tag === 'iframe' && el.hasAttribute('srcdoc')) violations.push('iframe[srcdoc]');

		for (const { name, value } of Array.from(el.attributes)) {
			const attr = name.toLowerCase();
			if (attr.startsWith('on')) violations.push(`${tag}[${attr}]`);
			if (URL_ATTRS.has(attr) || attr.endsWith(':href')) {
				const parts = attr === 'srcset' || attr === 'values' ? value.split(/[,;]/) : [value];
				if (parts.some((p) => DANGEROUS_PROTOCOL.test(normalizeUrl(p)))) violations.push(`${tag}[${attr}="${value}"]`);
			}
		}
	}

	return violations;
}

const EDITOR_CASES = [
	['no plugins', { buttonList: [['bold', 'italic']] }],
	[
		'content plugins',
		{
			plugins: { blockquote, list, table, link, image, video, audio, embed, math, anchor, codeBlock },
			buttonList: [['blockquote', 'list', 'table', 'link', 'image', 'video', 'audio', 'embed', 'math', 'anchor', 'codeBlock']],
		},
	],
];

describe.each(EDITOR_CASES)('XSS corpus (%s)', (_name, options) => {
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		editor = createTestEditor({ defaultLine: 'p', ...options });
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
		jest.restoreAllMocks();
	});

	it.each(CORPUS)('html.clean: %s', (_label, payload) => {
		expect(findViolations(editor.$.html.clean(payload))).toEqual([]);
	});

	it.each(CORPUS)('html.set/get: %s', (_label, payload) => {
		editor.$.html.set(payload);
		expect(findViolations(editor.$.html.get())).toEqual([]);
	});
});
