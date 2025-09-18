import { converter } from '../../../src/helper';

describe('converter helper', () => {
	describe('htmlToJson', () => {
		it('should convert simple HTML to JSON', () => {
			const html = '<p>Hello World</p>';
			const result = converter.htmlToJson(html);

			expect(result.type).toBe('element');
			expect(result.tag).toBe('body');
			expect(result.children[0].type).toBe('element');
			expect(result.children[0].tag).toBe('p');
			expect(result.children[0].children[0].type).toBe('text');
			expect(result.children[0].children[0].content).toBe('Hello World');
		});

		it('should handle HTML with attributes', () => {
			const html = '<div id="test" class="example">Content</div>';
			const result = converter.htmlToJson(html);

			const div = result.children[0];
			expect(div.attributes.id).toBe('test');
			expect(div.attributes.class).toBe('example');
		});

		it('should handle nested elements', () => {
			const html = '<div><p><strong>Bold text</strong></p></div>';
			const result = converter.htmlToJson(html);

			const div = result.children[0];
			const p = div.children[0];
			const strong = p.children[0];

			expect(div.tag).toBe('div');
			expect(p.tag).toBe('p');
			expect(strong.tag).toBe('strong');
			expect(strong.children[0].content).toBe('Bold text');
		});

		it('should handle empty elements', () => {
			const html = '<div></div>';
			const result = converter.htmlToJson(html);

			const div = result.children[0];
			expect(div.children).toEqual([]);
		});
	});

	describe('jsonToHtml', () => {
		it('should convert JSON to HTML', () => {
			const jsonData = {
				type: 'element',
				tag: 'p',
				attributes: { class: 'test' },
				children: [{ type: 'text', content: 'Hello World' }]
			};

			const result = converter.jsonToHtml(jsonData);
			expect(result).toBe('<p class="test">Hello World</p>');
		});

		it('should handle text nodes', () => {
			const jsonData = { type: 'text', content: 'Plain text' };
			const result = converter.jsonToHtml(jsonData);
			expect(result).toBe('Plain text');
		});

		it('should handle elements without attributes', () => {
			const jsonData = {
				type: 'element',
				tag: 'div',
				children: [{ type: 'text', content: 'Content' }]
			};

			const result = converter.jsonToHtml(jsonData);
			expect(result).toBe('<div>Content</div>');
		});

		it('should handle empty or null input', () => {
			expect(converter.jsonToHtml(null)).toBe('');
			expect(converter.jsonToHtml(undefined)).toBe('');
		});

		it('should escape HTML entities in attributes', () => {
			const jsonData = {
				type: 'element',
				tag: 'div',
				attributes: { title: 'Test & example "quotes"' },
				children: []
			};

			const result = converter.jsonToHtml(jsonData);
			expect(result).toContain('title="Test &amp; example &quot;quotes&quot;"');
		});
	});

	describe('htmlToEntity', () => {
		it('should convert HTML special characters to entities', () => {
			const testCases = [
				{ input: '&', expected: '&amp;' },
				{ input: '<', expected: '&lt;' },
				{ input: '>', expected: '&gt;' },
				{ input: '"', expected: '&quot;' },
				{ input: "'", expected: '&apos;' },
				{ input: '\u00A0', expected: '&nbsp;' }
			];

			testCases.forEach(({ input, expected }) => {
				expect(converter.htmlToEntity(input)).toBe(expected);
			});
		});

		it('should handle mixed content', () => {
			const input = 'Hello & "world" <test>';
			const expected = 'Hello &amp; &quot;world&quot; &lt;test&gt;';
			expect(converter.htmlToEntity(input)).toBe(expected);
		});
	});

	describe('entityToHTML', () => {
		it('should convert HTML entities back to characters', () => {
			const testCases = [
				{ input: '&amp;', expected: '&' },
				{ input: '&lt;', expected: '&lt;' }, // Note: this stays as entity based on the regex
				{ input: '&gt;', expected: '&gt;' }, // Note: this stays as entity based on the regex
				{ input: '&quot;', expected: '"' },
				{ input: '&apos;', expected: "'" },
				{ input: '&nbsp;', expected: '\u00A0' }
			];

			testCases.forEach(({ input, expected }) => {
				expect(converter.entityToHTML(input)).toBe(expected);
			});
		});
	});

	describe('debounce', () => {
		it('should delay function execution', (done) => {
			let callCount = 0;
			const func = () => callCount++;
			const debouncedFunc = converter.debounce(func, 50);

			debouncedFunc();
			debouncedFunc();
			debouncedFunc();

			expect(callCount).toBe(0);

			setTimeout(() => {
				expect(callCount).toBe(1);
				done();
			}, 100);
		});

		it('should pass arguments to debounced function', (done) => {
			let receivedArgs;
			const func = (...args) => { receivedArgs = args; };
			const debouncedFunc = converter.debounce(func, 50);

			debouncedFunc('test', 123, { key: 'value' });

			setTimeout(() => {
				expect(receivedArgs).toEqual(['test', 123, { key: 'value' }]);
				done();
			}, 100);
		});
	});

	describe('syncMaps', () => {
		it('should sync two maps correctly', () => {
			const targetMap = new Map([['a', 1], ['b', 2], ['c', 3]]);
			const referenceMap = new Map([['a', 10], ['d', 4]]);

			converter.syncMaps(targetMap, referenceMap);

			expect(targetMap.get('a')).toBe(10); // updated
			expect(targetMap.get('d')).toBe(4); // added
			expect(targetMap.has('b')).toBe(false); // removed
			expect(targetMap.has('c')).toBe(false); // removed
		});
	});

	describe('mergeMaps', () => {
		it('should merge multiple maps', () => {
			const map1 = new Map([['a', 1], ['b', 2]]);
			const map2 = new Map([['c', 3], ['d', 4]]);
			const map3 = new Map([['a', 10], ['e', 5]]);

			const result = converter.mergeMaps(map1, map2, map3);

			expect(result.get('a')).toBe(10); // last one wins
			expect(result.get('b')).toBe(2);
			expect(result.get('c')).toBe(3);
			expect(result.get('d')).toBe(4);
			expect(result.get('e')).toBe(5);
		});

		it('should filter out non-Map objects', () => {
			const map1 = new Map([['a', 1]]);
			const notAMap = { b: 2 };
			const map2 = new Map([['c', 3]]);

			const result = converter.mergeMaps(map1, notAMap, map2);

			expect(result.get('a')).toBe(1);
			expect(result.get('b')).toBeUndefined();
			expect(result.get('c')).toBe(3);
		});
	});

	describe('getValues', () => {
		it('should return array of object values', () => {
			const obj = { a: 1, b: '2', c: true };
			const result = converter.getValues(obj);
			expect(result).toEqual([1, '2', true]);
		});

		it('should return empty array for null or undefined', () => {
			expect(converter.getValues(null)).toEqual([]);
			expect(converter.getValues(undefined)).toEqual([]);
		});
	});

	describe('camelToKebabCase', () => {
		it('should convert camelCase to kebab-case', () => {
			expect(converter.camelToKebabCase('camelCase')).toBe('camel-case');
			expect(converter.camelToKebabCase('backgroundColor')).toBe('background-color');
			expect(converter.camelToKebabCase('fontSize')).toBe('font-size');
		});

		it('should handle array of strings', () => {
			const input = ['camelCase', 'backgroundColor'];
			const result = converter.camelToKebabCase(input);
			expect(result).toEqual(['camel-case', 'background-color']);
		});
	});

	describe('kebabToCamelCase', () => {
		it('should convert kebab-case to camelCase', () => {
			expect(converter.kebabToCamelCase('kebab-case')).toBe('kebabCase');
			expect(converter.kebabToCamelCase('background-color')).toBe('backgroundColor');
			expect(converter.kebabToCamelCase('font-size')).toBe('fontSize');
		});
	});

	describe('toFontUnit', () => {
		it('should convert font units correctly', () => {
			// px to other units
			expect(converter.toFontUnit('em', '16px')).toBe('1.00em');
			expect(converter.toFontUnit('%', '16px')).toBe('100%');
			expect(converter.toFontUnit('pt', '16px')).toBe('12pt');

			// em to other units
			expect(converter.toFontUnit('px', '1em')).toBe('16px');
			expect(converter.toFontUnit('%', '1em')).toBe('100%');

			// pt to other units
			expect(converter.toFontUnit('px', '12pt')).toBe('16px');
		});

		it('should handle named font sizes', () => {
			expect(converter.toFontUnit('em', 'medium')).toBe('1.00em');
			expect(converter.toFontUnit('px', 'large')).toBe('18px');
		});
	});

	describe('nodeListToArray', () => {
		it('should convert NodeList to array', () => {
			const div = document.createElement('div');
			div.innerHTML = '<p></p><span></span><a></a>';
			const nodeList = div.childNodes;

			const result = converter.nodeListToArray(nodeList);

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(3);
		});

		it('should return empty array for null input', () => {
			expect(converter.nodeListToArray(null)).toEqual([]);
		});
	});

	describe('swapKeyValue', () => {
		it('should swap keys and values', () => {
			const obj = { a: 1, b: '2', c: 'three' };
			const result = converter.swapKeyValue(obj);

			expect(result['1']).toBe('a');
			expect(result['2']).toBe('b');
			expect(result['three']).toBe('c');
		});
	});

	describe('createElementWhitelist', () => {
		it('should create regex for allowed elements', () => {
			const regex = converter.createElementWhitelist('p|div|span');
			expect(regex.test('<h1>heading</h1>')).toBe(true); // should match (not whitelisted)
			expect(regex.test('<p>paragraph</p>')).toBe(false); // should not match (whitelisted)
		});
	});

	describe('createElementBlacklist', () => {
		it('should create regex for blocked elements', () => {
			const regex = converter.createElementBlacklist('script|style');
			expect(regex.test('<script>code</script>')).toBe(true); // should match (blacklisted)
			expect(regex.test('<p>paragraph</p>')).toBe(false); // should not match (not blacklisted)
		});
	});

	describe('isHexColor', () => {
		it('should validate hex colors', () => {
			expect(converter.isHexColor('#fff')).toBe(true);
			expect(converter.isHexColor('#ffffff')).toBe(true);
			expect(converter.isHexColor('#123abc')).toBe(true);
			expect(converter.isHexColor('rgb(255,255,255)')).toBe(false);
			expect(converter.isHexColor('red')).toBe(false);
			expect(converter.isHexColor('#gggggg')).toBe(false);
		});
	});

	describe('rgb2hex', () => {
		it('should convert RGB to hex', () => {
			expect(converter.rgb2hex('rgb(255, 255, 255)')).toBe('#ffffff');
			expect(converter.rgb2hex('rgb(0, 0, 0)')).toBe('#000000');
			expect(converter.rgb2hex('rgb(255, 0, 128)')).toBe('#ff0080');
		});

		it('should handle RGBA to hex with alpha', () => {
			// This test may need adjustment based on actual implementation
			const result = converter.rgb2hex('rgba(255, 0, 0, 0.5)');
			expect(result.startsWith('#ff0000')).toBe(true);
		});

		it('should return hex colors unchanged', () => {
			expect(converter.rgb2hex('#ffffff')).toBe('#ffffff');
		});

		it('should handle invalid colors', () => {
			expect(converter.rgb2hex('invalid')).toBe('invalid');
			expect(converter.rgb2hex('')).toBe('');
		});
	});

	describe('textToAnchor', () => {
		it('should convert URLs in text nodes to anchor elements', () => {
			const textNode = document.createTextNode('Visit https://example.com for more info');
			const parent = document.createElement('div');
			parent.appendChild(textNode);

			const result = converter.textToAnchor(textNode);

			expect(result).toBe(true);
			const anchor = parent.querySelector('a');
			expect(anchor).toBeTruthy();
			expect(anchor.href).toBe('https://example.com/');
			expect(anchor.target).toBe('_blank');
		});

		it('should not convert URLs inside anchor elements', () => {
			const anchor = document.createElement('a');
			const textNode = document.createTextNode('https://example.com');
			anchor.appendChild(textNode);

			const result = converter.textToAnchor(textNode);
			expect(result).toBe(false);
		});

		it('should handle non-text nodes', () => {
			const div = document.createElement('div');
			const result = converter.textToAnchor(div);
			expect(result).toBe(false);
		});
	});

	describe('addUrlQuery', () => {
		it('should add query to URL without existing query', () => {
			const result = converter.addUrlQuery('https://example.com', 'param=value');
			expect(result).toBe('https://example.com?param=value');
		});

		it('should add query to URL with existing query', () => {
			const result = converter.addUrlQuery('https://example.com?existing=true', 'new=param');
			expect(result).toBe('https://example.com?new=param&existing=true');
		});

		it('should handle empty query', () => {
			const result = converter.addUrlQuery('https://example.com', '');
			expect(result).toBe('https://example.com');
		});
	});

	describe('_setDefaultOptionStyle', () => {
		it('should categorize styles correctly', () => {
			const fo = new Map([
				['width', '100px'],
				['height', '200px'],
				['minHeight', '50px']
			]);
			const cssText = 'color: red; z-index: 100; font-size: 14px;';

			const result = converter._setDefaultOptionStyle(fo, cssText);

			expect(result.top).toContain('width:100px');
			expect(result.top).toContain('z-index: 100');
			expect(result.frame).toContain('height:200px');
			expect(result.frame).toContain('min-height:50px');
			expect(result.editor).toContain('color: red');
			expect(result.editor).toContain('font-size: 14px');
		});
	});

	describe('_setAutoHeightStyle', () => {
		it('should return auto height style for "auto" height', () => {
			const result = converter._setAutoHeightStyle('auto');
			expect(result).toContain('<style>');
			expect(result).toContain('height: min-content');
			expect(result).toContain('overflow: hidden');
		});

		it('should return empty string for non-auto height', () => {
			expect(converter._setAutoHeightStyle('400px')).toBe('');
			expect(converter._setAutoHeightStyle('100%')).toBe('');
		});
	});
});