import { env, converter, domUtils, numbers } from '../../src/helper';

describe('env', () => {
	it('_global', () => {
		expect(env._d).toBe(document);
		expect(env._w).toBe(window);
	});
	it('getValues', () => {
		expect(env.getValues({ a: 1, b: '2' }).toString()).toBe([1, '2'].toString());
	});
	it('Case style', () => {
		expect(env.camelToKebabCase('camelToKebabCase')).toBe('camel-to-kebab-case');
		expect(env.kebabToCamelCase('camel-to-kebab-case')).toBe('camelToKebabCase');
	});
});

describe('unicode', () => {
	it('Entity', () => {
		expect(converter.htmlToEntity(`<div class="se-test" data-test="test"><span style="color: #fdfdfd; background-color: #ccc;">123</span>abc</div>`)).toBe(
			'&lt;div class=&quot;se-test&quot; data-test=&quot;test&quot;&gt;&lt;span style=&quot;color: #fdfdfd; background-color: #ccc;&quot;&gt;123&lt;/span&gt;abc&lt;/div&gt;'
		);
		expect(
			converter.entityToHTML(
				'&lt;div class=&quot;se-test&quot; data-test=&quot;test&quot;&gt;&lt;span style=&quot;color: #fdfdfd; background-color: #ccc;&quot;&gt;123&lt;/span&gt;abc&lt;/div&gt;'
			)
		).toBe('&lt;div class="se-test" data-test="test"&gt;&lt;span style="color: #fdfdfd; background-color: #ccc;"&gt;123&lt;/span&gt;abc&lt;/div&gt;');
	});
	it('fontSize', () => {
		// px
		expect(converter.fontSize('em', '14px')).toBe('0.88em');
		expect(converter.fontSize('%', '14px')).toBe('88%');
		expect(converter.fontSize('pt', '14px')).toBe('10pt');
		// em
		expect(converter.fontSize('px', '1em')).toBe('16px');
		expect(converter.fontSize('rem', '1em')).toBe('1.00rem');
		expect(converter.fontSize('%', '1em')).toBe('100%');
		expect(converter.fontSize('pt', '1em')).toBe('12pt');
		// pt
		expect(converter.fontSize('px', '8pt')).toBe('11px');
		expect(converter.fontSize('em', '8pt')).toBe('0.69em');
		expect(converter.fontSize('%', '8pt')).toBe('69%');
		// %
		expect(converter.fontSize('px', '150%')).toBe('1.5px');
		expect(converter.fontSize('em', '150%')).toBe('0.09em');
		expect(converter.fontSize('pt', '150%')).toBe('1pt');
	});
	it('nodeListToArray', () => {
		const temp = document.createElement('div');
		const temp_1 = document.createElement('div');
		const temp_2 = document.createElement('div');
		temp.appendChild(temp_1);
		temp.appendChild(temp_2);
		expect(converter.nodeListToArray(temp.children)).toEqual([temp_1, temp_2]);
	});
	it('object func', () => {
		expect(JSON.stringify(swapKeyValue({ a: 1, b: '2' }))).toBe('{"1":"a","2":"b"}');
	});
});
