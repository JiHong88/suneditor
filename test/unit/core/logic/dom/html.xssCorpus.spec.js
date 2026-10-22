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

	// --- security advisories: namespaced-lookalike tag names skip attribute cleaning
	// (EXTRA_TAG_MAP `[a-z]+:[a-z]+` vs `_RE_XML_NS_TAG` `[a-z0-9]+:[a-z0-9]+` vs the whitelist `\b` lookahead)
	['GHSA-6pm3-2q9w-2926 ns tag digit name', '<a:1 onclick="alert(document.cookie)">click me</a:1>'],
	['GHSA-m989-x9mj-698j ns tag digit prefix', '<p>x</p><a1:b2 onclick="alert(1)">Click</a1:b2><p>y</p>'],
	['GHSA-m989-x9mj-698j ns tag digit prefix 2', '<x1:y onclick="alert(1)">Link</x1:y>'],
	['GHSA-m989-x9mj-698j ns tag digit prefix 3', '<a1:b onmouseover="alert(1)">Hover me</a1:b>'],
	['GHSA-692m-4688-45wp ns tag alnum', '<p><a:1b src="/x" onclick="alert(1)">click</a:1b></p>'],
	['GHSA-692m-4688-45wp ns tag text-style branch', '<p><b:1c src="/x" onmouseover="alert(1)">hover</b:1c></p>'],
	['GHSA-692m-4688-45wp ns tag dash suffix', '<p><a:1-d src="/x" onclick="alert(1)">click</a:1-d></p>'],
	['ns tag variant: dash prefix', '<p><a-b:c onclick="alert(1)">x</a-b:c></p>'],
	['ns tag variant: dot name', '<p><a:b.c onclick="alert(1)">x</a:b.c></p>'],
	['ns tag variant: underscore', '<p><x_y:z onclick="alert(1)">x</x_y:z></p>'],

	// --- security advisories: iframe placeholder rebuild copies `srcdoc` (and any other key) verbatim
	[
		'GHSA-q867-q2hw-f8gp placeholder srcdoc svg',
		'<span data-se-iframe-holder="1" data-se-iframe-holder-attrs="{&quot;srcdoc&quot;:&quot;<svg/onload=window.__PWNED=document.domain&gt;&quot;}">x</span>',
	],
	[
		'GHSA-q867-q2hw-f8gp placeholder srcdoc svg (jsdom-stable)',
		'<span data-se-iframe-holder="1" data-se-iframe-holder-attrs="{&quot;srcdoc&quot;:&quot;<svg/onload=alert(document.domain)&quot;}">x</span>',
	],
	[
		'GHSA-8rr9-72mx-m49h placeholder srcdoc json-escaped script',
		'<div data-se-iframe-holder="1" data-se-iframe-holder-attrs="{&quot;srcdoc&quot;:&quot;\\u003cscript\\u003ealert(document.cookie)\\u003c/script\\u003e&quot;}">[iframe: ]</div>',
	],
	[
		'GHSA-3qm5-8p2w-5q9j placeholder srcdoc entity script',
		'<div data-se-iframe-holder="1" data-se-iframe-holder-attrs="{&quot;srcdoc&quot;:&quot;&lt;script&gt;alert(document.domain)&lt;/script&gt;&quot;}">placeholder</div>',
	],
	[
		'GHSA-692m-4688-45wp placeholder srcdoc single-quoted json',
		`<p>x</p><div data-se-iframe-holder="1" data-se-iframe-holder-attrs='{"srcdoc":"&lt;script&gt;alert(document.domain)&lt;/script&gt;"}'>y</div>`,
	],
	[
		'GHSA-692m-4688-45wp placeholder malformed json (crash)',
		`<div data-se-iframe-holder="1" data-se-iframe-holder-attrs='{"srcdoc":"<img src=x onerror=alert(1)>"}'>y</div>`,
	],
	[
		'placeholder variant: attrs not an object',
		'<div data-se-iframe-holder="1" data-se-iframe-holder-attrs="null">y</div>',
	],

	// --- security advisories: `_normalizeURL` drops named entities instead of decoding them
	['GHSA-v4jx-8pj6-w4w8 &colon; entity', '<a href="javascript&colon;alert(document.domain)">Click me</a>'],
	['GHSA-v4jx-8pj6-w4w8 &colon; entity in src', '<img src="javascript&colon;alert(1)">'],
	['entity variant: numeric without semicolon', '<a href="javascript&#58alert(1)">x</a>'],
	['entity variant: hex without semicolon', '<a href="javascript&#x3a//%0aalert(1)">x</a>'],
	['entity variant: &Tab; split', '<a href="java&Tab;script:alert(1)">x</a>'],
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
	// no DOMParser round-trip before the attribute filter: entities reach `_normalizeURL` undecoded
	['autoStyleify off', { buttonList: [['bold', 'italic']], autoStyleify: [] }],
	// the security checks must not depend on which attribute/style filters are on
	['styleFilter off', { buttonList: [['bold', 'italic']], strictMode: { styleFilter: false } }],
	['attrFilter off', { buttonList: [['bold', 'italic']], strictMode: { attrFilter: false } }],
	[
		'attrFilter + styleFilter off, autoStyleify off',
		{ buttonList: [['bold', 'italic']], strictMode: { attrFilter: false, styleFilter: false }, autoStyleify: [] },
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

// With `tagFilter` off no tag is removed, but the attribute filter still runs and must strip
// event handlers from namespaced-lookalike tags too (GHSA-m989-x9mj-698j: `<a1:b2>` is only
// removed by the element whitelist, not by the namespace handling).
describe('XSS corpus (tagFilter off): namespaced tag event handlers', () => {
	const NS_TAG_CASES = CORPUS.filter(([label]) => label.includes('ns tag'));
	let editor;

	beforeAll(async () => {
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		editor = createTestEditor({ defaultLine: 'p', buttonList: [['bold', 'italic']], strictMode: { tagFilter: false } });
		await waitForEditorReady(editor);
	});

	afterAll(() => {
		destroyTestEditor(editor);
		jest.restoreAllMocks();
	});

	it.each(NS_TAG_CASES)('html.clean: %s', (_label, payload) => {
		expect(findViolations(editor.$.html.clean(payload)).filter((v) => /\[on/.test(v))).toEqual([]);
	});
});
