/**
 * @description Converts MS Word/Excel/OneNote clipboard HTML into clean.
 */

/** Matches MS conditional comments: <!--[if ...]>...<![endif]--> */
const _RE_CONDITIONAL_COMMENTS = /<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->/gi;

/** Matches Office namespace tags: <o:p>, </o:p>, <w:Sdt>, etc. */
const _RE_OFFICE_TAGS = /<\/?(?:\w+:)\w+[^>]*>/gi;

/** Matches <xml>...</xml> blocks */
const _RE_XML_BLOCKS = /<xml>[\s\S]*?<\/xml>/gi;

/** Matches <style>...</style> blocks */
const _RE_STYLE_BLOCKS = /<style[^>]*>[\s\S]*?<\/style>/gi;

/** Matches individual mso-* CSS declarations */
const _RE_MSO_STYLE = /\s*mso-[^:]+:[^;"]+;?/gi;

/** Matches mso-list value: l{id} level{n} lfo{order} */
const _RE_MSO_LIST = /l(\d+)\s+level(\d+)\s+lfo(\d+)/i;

/** Matches mso-list:Ignore markers */
const _RE_MSO_LIST_IGNORE = /mso-list:\s*Ignore/i;

/** Matches Mso* class names */
const _RE_MSO_CLASS = /\bMso\w+/g;

/** Matches Excel xl* class names */
const _RE_XL_CLASS = /\bxl\d+/g;

/** Matches tab-stops CSS declarations */
const _RE_TAB_STOPS = /\s*tab-stops:[^;"]+;?/gi;

/** Matches bullet-like characters at the start of text */
const _RE_BULLET_CHARS = /^[\s\u00a0]*[\u2022\u00b7\u00a7\u25cf\u25cb\u25aa\u25a0·o§]\s*/;

/** Matches ordered list marker patterns */
const _RE_ORDERED_MARKERS = [/^\s*[0-9]+[.)]\s/, /^\s*[a-z][.)]\s/i, /^\s*[ivxlmcd]+[.)]\s/i];

/** Matches mso-spacerun spans */
const _RE_SPACERUN = /<span\s+style\s*=\s*["']?\s*mso-spacerun:\s*yes\s*;?\s*["']?\s*>([\s\u00a0]*)<\/span>/gi;

/** Matches mso-tab-count spans */
const _RE_TAB_COUNT = /<span\s+style\s*=\s*["'][^"']*mso-tab-count:\s*\d+[^"']*["']\s*>[^<]*<\/span>/gi;

/** Matches mso-outline-level value */
const _RE_OUTLINE_LEVEL = /mso-outline-level:\s*(\d+)/i;

/** Matches mso-highlight value */
const _RE_MSO_HIGHLIGHT = /mso-highlight:\s*([^;"]+)/i;

/** Matches mso-level-number-format value */
const _RE_LEVEL_NUMBER_FORMAT = /mso-level-number-format:\s*([^;\s]+)/i;

/** Matches mso-level-start-at value */
const _RE_LEVEL_START_AT = /mso-level-start-at:\s*(\d+)/i;

/** Matches mso-level-text value */
const _RE_LEVEL_TEXT = /mso-level-text:\s*([^;\s]+)/i;

/** Word number format → CSS list-style-type */
const _LEVEL_STYLE_MAP = {
	decimal: 'decimal',
	'alpha-upper': 'upper-alpha',
	'alpha-lower': 'lower-alpha',
	'roman-upper': 'upper-roman',
	'roman-lower': 'lower-roman',
	'arabic-leading-zero': 'decimal-leading-zero',
};

/** Matches zero-value margin shorthand (3 values) */
const _RE_ZERO_MARGIN = /\s*margin:\s*0[a-z]*\s+0[a-z]*\s+0[a-z]*\s*;?/gi;

/** Matches text-indent CSS declarations */
const _RE_TEXT_INDENT = /\s*text-indent:\s*-?[\d.]+[a-z]*\s*;?/gi;

/** Matches line-height: normal */
const _RE_LINE_HEIGHT_NORMAL = /\s*line-height:\s*normal\s*;?/gi;

/** Matches MsoHeading class names */
const _RE_MSO_HEADING = /MsoHeading(\d)/i;

/** Matches file:/// protocol */
const _RE_FILE_PROTOCOL = /^file:\/\/\//i;

/** Matches Word bookmark anchor names (_Toc*, _Ref*, _Hlt*, _Hlk*) */
const _RE_BOOKMARK_NAME = /^_(Toc|Ref|Hlt|Hlk)\d+$/i;

/** Matches Word bookmark href targets (#_Toc*, etc.) */
const _RE_BOOKMARK_HREF = /^#_(Toc|Ref|Hlt|Hlk)\d+$/i;

/** Matches page-break-before: always */
const _RE_PAGE_BREAK = /page-break-before\s*:\s*always/i;

/** Matches mso-break-type: section-break */
const _RE_SECTION_BREAK = /mso-break-type\s*:\s*section-break/i;

/** Matches mso-column-break-before: always */
const _RE_COLUMN_BREAK = /mso-column-break-before\s*:\s*always/i;

/** Matches Word/WordSection div class names */
const _RE_SECTION_CLASS = /^(?:Word)?Section\d+$/i;

// ---------- internal helpers ----------

/**
 * @description Extracts `@list` rules from Word's <style> block for list type detection.
 * @param {string} html Raw Word HTML
 * @returns {Map<string, Object>} Map of "l{id}:level{n}" -> { type: 'ol'|'ul', listStyleType: string }
 */
function _extractListStyles(html) {
	const map = new Map();
	const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
	if (!styleMatch) return map;

	const css = styleMatch[1];
	const listRuleRe = /@list\s+l(\d+):level(\d+)\s*\{([^}]*)\}/gi;
	let m;
	while ((m = listRuleRe.exec(css)) !== null) {
		const id = m[1];
		const level = m[2];
		const body = m[3];
		const key = `l${id}:level${level}`;

		const fmt = _RE_LEVEL_NUMBER_FORMAT.exec(body);
		const startAt = _RE_LEVEL_START_AT.exec(body);
		const text = _RE_LEVEL_TEXT.exec(body);

		let type = 'ol';
		let listStyleType = '';

		if (fmt) {
			const fmtVal = fmt[1].toLowerCase();
			if (fmtVal === 'bullet' || fmtVal === 'image') {
				type = 'ul';
				if (text) {
					const t = text[1].replace(/["%\\]/g, '');
					if (t === '\u00b7' || t === '·') listStyleType = 'disc';
					else if (t === 'o') listStyleType = 'circle';
					else if (t === '\u00a7' || t === '§') listStyleType = 'square';
				}
			} else {
				listStyleType = _LEVEL_STYLE_MAP[fmtVal] || '';
			}
		}

		map.set(key, {
			type,
			listStyleType,
			startAt: startAt ? parseInt(startAt[1], 10) : 1,
		});
	}

	return map;
}

/**
 * @description Detects whether a list item is ordered or unordered by inspecting its marker text content.
 * @param {string} text The marker text (from mso-list:Ignore span)
 * @returns {'ol'|'ul'}
 */
function _detectListTypeFromText(text) {
	const trimmed = text.replace(/[\s\u00a0]+/g, ' ').trim();
	if (_RE_BULLET_CHARS.test(trimmed)) return 'ul';
	for (const re of _RE_ORDERED_MARKERS) {
		if (re.test(trimmed)) return 'ol';
	}
	return 'ul';
}

/**
 * @description Removes bullet/number marker spans (mso-list:Ignore) and conditional comments from a list item element.
 * @param {Element} el
 */
function _removeListMarkers(el) {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_COMMENT, null);
	const commentsToRemove = [];
	while (walker.nextNode()) {
		commentsToRemove.push(walker.currentNode);
	}
	for (const c of commentsToRemove) {
		/** @type {Element} */ (c)?.remove();
	}

	const spans = el.querySelectorAll('span');
	for (const span of spans) {
		const style = span.getAttribute('style') || '';
		if (_RE_MSO_LIST_IGNORE.test(style)) {
			span.remove();
		}
	}

	if (el.firstChild && el.firstChild.nodeType === 3) {
		el.firstChild.nodeValue = el.firstChild.nodeValue.replace(/^[\s\u00a0]+/, '');
	}
}

/**
 * @description Cleans inline style attributes: strips mso-*, tab-stops, converts mso-highlight to background-color.
 * @param {Element} el
 */
function _cleanStyles(el) {
	const style = el.getAttribute('style');
	if (!style) return;

	let cleaned = style;

	// Convert mso-highlight to background-color before stripping mso-*
	const highlightMatch = _RE_MSO_HIGHLIGHT.exec(cleaned);
	if (highlightMatch && !/background-color/i.test(cleaned) && !/background\s*:/i.test(cleaned)) {
		cleaned += ';background-color:' + highlightMatch[1].trim();
	}

	cleaned = cleaned.replace(_RE_MSO_STYLE, '').replace(_RE_TAB_STOPS, '').replace(_RE_ZERO_MARGIN, '').replace(_RE_TEXT_INDENT, '').replace(_RE_LINE_HEIGHT_NORMAL, '').trim();

	// Remove trailing/leading semicolons
	cleaned = cleaned
		.replace(/^;+|;+$/g, '')
		.replace(/;{2,}/g, ';')
		.trim();

	if (cleaned) {
		el.setAttribute('style', cleaned);
	} else {
		el.removeAttribute('style');
	}
}

/**
 * @description Removes Mso- and xl- class names from an element. Removes class attr if empty.
 * @param {Element} el
 */
function _cleanClasses(el) {
	const cls = el.getAttribute('class');
	if (!cls) return;

	const cleaned = cls.replace(_RE_MSO_CLASS, '').replace(_RE_XL_CLASS, '').trim();
	if (cleaned) {
		el.setAttribute('class', cleaned);
	} else {
		el.removeAttribute('class');
	}
}

/**
 * @description Unwraps spans that have no attributes left after cleanup.
 * @param {Element} container
 */
function _unwrapEmptySpans(container) {
	const spans = container.querySelectorAll('span');
	for (let i = spans.length - 1; i >= 0; i--) {
		const span = spans[i];
		if (!span.attributes.length || (!span.getAttribute('style') && !span.getAttribute('class'))) {
			const parent = span.parentNode;
			if (parent) {
				while (span.firstChild) {
					parent.insertBefore(span.firstChild, span);
				}
				parent.removeChild(span);
			}
		}
	}
}

// ---------- list conversion ----------

/**
 * @description Transforms flat MsoListParagraph paragraphs into nested ol/ul/li structure.
 * @param {Document} doc Parsed DOM document
 * @param {Map<string, Object>} listStyles Extracted @list CSS rules
 */
function _convertLists(doc, listStyles) {
	const body = doc.body;
	const items = [];

	const allElements = body.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
	for (const el of allElements) {
		const style = el.getAttribute('style') || '';
		const cls = el.getAttribute('class') || '';
		const msoListMatch = _RE_MSO_LIST.exec(style);

		if (msoListMatch || /MsoListParagraph/i.test(cls)) {
			items.push({
				el,
				listId: msoListMatch ? msoListMatch[1] : '0',
				level: msoListMatch ? parseInt(msoListMatch[2], 10) : 1,
				lfo: msoListMatch ? msoListMatch[3] : '1',
			});
		}
	}

	if (items.length === 0) return;

	const groups = [];
	let currentGroup = null;

	for (const item of items) {
		const prevSibling = _getPrevSiblingElement(item.el);
		const isConsecutive = currentGroup && currentGroup.length > 0 && prevSibling === currentGroup[currentGroup.length - 1].el;

		if (isConsecutive) {
			currentGroup.push(item);
		} else {
			currentGroup = [item];
			groups.push(currentGroup);
		}
	}

	for (const group of groups) {
		_buildListFromGroup(group, listStyles);
	}
}

/**
 * @description Gets the previous element sibling, skipping text nodes.
 * @param {Element} el
 * @returns {Element|null}
 */
function _getPrevSiblingElement(el) {
	let prev = el.previousSibling;
	while (prev) {
		if (prev.nodeType === 1) return /** @type {Element} */ (prev);
		if (prev.nodeType === 3 && prev.nodeValue.trim()) return null;
		prev = prev.previousSibling;
	}
	return null;
}

/**
 * @description Builds a proper list (ol/ul with li) from a consecutive group of Word list paragraphs.
 * @param {Array<Object>} group Array of { el, listId, level, lfo }
 * @param {Map<string, Object>} listStyles
 */
function _buildListFromGroup(group, listStyles) {
	for (const item of group) {
		const styleKey = `l${item.listId}:level${item.level}`;
		const styleDef = listStyles.get(styleKey);

		if (styleDef) {
			item.type = styleDef.type;
			item.listStyleType = styleDef.listStyleType;
			item.startAt = styleDef.startAt;
		} else {
			const markerText = _extractMarkerText(item.el);
			item.type = _detectListTypeFromText(markerText);
			item.listStyleType = '';
			item.startAt = 1;
		}
	}

	const parent = group[0].el.parentNode;
	// Save anchor before the loop removes elements from the DOM
	const anchor = group[group.length - 1].el.nextSibling;

	const stack = [];
	let rootList = null;

	for (const item of group) {
		const { el, level, type, listStyleType, startAt } = item;

		_removeListMarkers(el);
		_cleanStyles(el);
		_cleanClasses(el);

		const li = el.ownerDocument.createElement('li');
		while (el.firstChild) {
			li.appendChild(el.firstChild);
		}

		if (el.getAttribute('style')) {
			li.setAttribute('style', el.getAttribute('style'));
		}

		if (stack.length === 0) {
			rootList = _createListElement(el.ownerDocument, type, listStyleType, startAt);
			rootList.appendChild(li);
			stack.push({ listEl: rootList, level });
		} else {
			const currentLevel = stack[stack.length - 1].level;

			if (level > currentLevel) {
				const prevLi = stack[stack.length - 1].listEl.lastElementChild;
				const childList = _createListElement(el.ownerDocument, type, listStyleType, startAt);
				childList.appendChild(li);

				if (prevLi) {
					prevLi.appendChild(childList);
				} else {
					stack[stack.length - 1].listEl.appendChild(childList);
				}

				stack.push({ listEl: childList, level });
			} else if (level < currentLevel) {
				while (stack.length > 1 && stack[stack.length - 1].level > level) {
					stack.pop();
				}
				stack[stack.length - 1].listEl.appendChild(li);
			} else {
				stack[stack.length - 1].listEl.appendChild(li);
			}
		}

		el.remove();
	}

	if (rootList) {
		parent.insertBefore(rootList, anchor);
	}
}

/**
 * @description Creates an <ol> or <ul> element with optional list-style-type and start attributes.
 * @param {Document} doc
 * @param {'ol'|'ul'} type
 * @param {string} listStyleType
 * @param {number} startAt
 * @returns {Element}
 */
function _createListElement(doc, type, listStyleType, startAt) {
	const list = doc.createElement(type);
	if (listStyleType) {
		list.style.listStyleType = listStyleType;
	}
	if (type === 'ol' && startAt > 1) {
		list.setAttribute('start', String(startAt));
	}
	return list;
}

/**
 * @description Extracts the marker text from a Word list paragraph (the mso-list:Ignore span content).
 * @param {Element} el
 * @returns {string}
 */
function _extractMarkerText(el) {
	const spans = el.querySelectorAll('span');
	for (const span of spans) {
		const style = span.getAttribute('style') || '';
		if (_RE_MSO_LIST_IGNORE.test(style)) {
			return span.textContent || '';
		}
	}
	return el.textContent?.substring(0, 10) || '';
}

// ---------- heading conversion ----------

/**
 * @description Converts `<p>` elements with `mso-outline-level` to semantic `<h1>`-`<h6>` headings.
 *   Also normalizes existing heading elements that have MsoHeading* classes.
 * @param {Document} doc
 */
function _convertHeadings(doc) {
	const paragraphs = doc.body.querySelectorAll('p');
	for (const p of paragraphs) {
		const style = p.getAttribute('style') || '';
		const cls = p.getAttribute('class') || '';

		let level = 0;

		// Check mso-outline-level
		const outlineMatch = _RE_OUTLINE_LEVEL.exec(style);
		if (outlineMatch) {
			level = parseInt(outlineMatch[1], 10);
		}

		// Check MsoHeading* class
		if (!level) {
			const headingClassMatch = _RE_MSO_HEADING.exec(cls);
			if (headingClassMatch) {
				level = parseInt(headingClassMatch[1], 10);
			}
		}

		if (level >= 1 && level <= 6) {
			const heading = doc.createElement('h' + level);
			while (p.firstChild) {
				heading.appendChild(p.firstChild);
			}
			if (style) heading.setAttribute('style', style);

			p.replaceWith(heading);
		}
	}
}

// ---------- table cleanup ----------

/**
 * @description Cleans Word/Excel table markup.
 *   - Removes mso-yfti-*, mso-border-*, mso-padding-alt, mso-cellspacing, mso-table-layout-alt.
 *   - Strips MsoTableGrid/MsoNormalTable classes.
 *   - Removes Excel-specific <col> elements.
 *   - Preserves border, colspan, rowspan, and basic styling.
 * @param {Document} doc
 */
function _cleanTables(doc) {
	const tables = doc.body.querySelectorAll('table');
	for (const table of tables) {
		_cleanClasses(table);

		// Remove cellspacing/cellpadding attributes (handle via CSS)
		table.removeAttribute('cellspacing');
		table.removeAttribute('cellpadding');

		// Remove Excel <col> elements
		const cols = table.querySelectorAll('col');
		for (const col of cols) {
			col.remove();
		}

		// Remove <colgroup> if empty after col removal
		const colgroups = table.querySelectorAll('colgroup');
		for (const cg of colgroups) {
			if (!cg.children.length) cg.remove();
		}
	}

	// Clean rows
	const rows = doc.body.querySelectorAll('tr');
	for (const tr of rows) {
		// Remove height attribute (keep style-based height if meaningful)
		tr.removeAttribute('height');
	}

	// Clean cells
	const cells = doc.body.querySelectorAll('td, th');
	for (const cell of cells) {
		// Remove valign attribute (use CSS vertical-align instead if present)
		const valign = cell.getAttribute('valign');
		if (valign) {
			cell.removeAttribute('valign');
			const existingStyle = cell.getAttribute('style') || '';
			if (!/vertical-align/i.test(existingStyle)) {
				cell.setAttribute('style', (existingStyle ? existingStyle + ';' : '') + 'vertical-align:' + valign);
			}
		}

		// Unwrap single MsoNormal <p> inside cells → inline content
		const children = cell.children;
		if (children.length === 1 && children[0].tagName === 'P') {
			const p = children[0];
			const cls = p.getAttribute('class') || '';
			if (/MsoNormal/i.test(cls) || !cls) {
				while (p.firstChild) {
					cell.insertBefore(p.firstChild, p);
				}
				p.remove();
			}
		}
	}
}

// ---------- track changes & comments ----------

/**
 * @description Removes track changes and comment markup.
 *   - `<del>` / `msoDel`: remove entirely (deleted content should not appear)
 *   - `<ins>` / `msoIns`: unwrap (keep the inserted content)
 *   - `MsoCommentReference` / `MsoCommentText`: remove
 *   - `mso-element:comment` divs: remove
 * @param {Document} doc
 */
function _cleanTrackChanges(doc) {
	// Remove deletions
	const dels = doc.body.querySelectorAll('del, .msoDel');
	for (const del of dels) {
		del.remove();
	}

	// Unwrap insertions (keep content)
	const inses = doc.body.querySelectorAll('ins, .msoIns');
	for (let i = inses.length - 1; i >= 0; i--) {
		const ins = inses[i];
		const parent = ins.parentNode;
		if (parent) {
			while (ins.firstChild) {
				parent.insertBefore(ins.firstChild, ins);
			}
			ins.remove();
		}
	}

	// Remove comment references
	const commentRefs = doc.body.querySelectorAll('.MsoCommentReference, [style*="mso-comment-reference"]');
	for (const ref of commentRefs) {
		ref.remove();
	}

	// Remove comment text blocks
	const commentTexts = doc.body.querySelectorAll('.MsoCommentText');
	for (const ct of commentTexts) {
		ct.remove();
	}

	// Remove mso-element:comment divs
	const commentDivs = doc.body.querySelectorAll('div[style*="mso-element:comment"]');
	for (const div of commentDivs) {
		div.remove();
	}

	// Remove comment anchor names
	const commentAnchors = doc.body.querySelectorAll('a[name^="_msocom"], a[name^="_msoanchor"]');
	for (const anchor of commentAnchors) {
		anchor.remove();
	}
}

// ---------- link cleanup ----------

/**
 * @description Cleans up Word-specific link patterns.
 *   - Removes `file:///` protocol links (converts to plain text)
 *   - Removes internal bookmark anchors (_Toc, _Ref, _Hlt targets)
 *   - Keeps mailto: and http(s): links intact
 * @param {Document} doc
 */
function _cleanLinks(doc) {
	const anchors = doc.body.querySelectorAll('a');
	for (let i = anchors.length - 1; i >= 0; i--) {
		const a = anchors[i];
		const href = a.getAttribute('href') || '';
		const name = a.getAttribute('name') || '';

		// Remove file:/// protocol links (meaningless outside source machine)
		if (_RE_FILE_PROTOCOL.test(href)) {
			const parent = a.parentNode;
			if (parent) {
				while (a.firstChild) {
					parent.insertBefore(a.firstChild, a);
				}
				a.remove();
			}
			continue;
		}

		// Remove bookmark anchor targets (_Toc, _Ref, _Hlt, _Hlk)
		if (_RE_BOOKMARK_NAME.test(name)) {
			// If it has content, unwrap; if empty anchor, remove
			const parent = a.parentNode;
			if (parent) {
				if (a.childNodes.length) {
					while (a.firstChild) {
						parent.insertBefore(a.firstChild, a);
					}
				}
				a.remove();
			}
			continue;
		}

		// Remove bookmark links pointing to internal anchors
		if (_RE_BOOKMARK_HREF.test(href)) {
			const parent = a.parentNode;
			if (parent) {
				while (a.firstChild) {
					parent.insertBefore(a.firstChild, a);
				}
				a.remove();
			}
			continue;
		}

		// Clean v:shapes attribute from regular links
		a.removeAttribute('v:shapes');
	}
}

// ---------- image cleanup ----------

/**
 * @description Cleans Word-specific image patterns.
 *   - Removes `v:shapes` attribute
 *   - Removes images with `file:///` src (broken temp file paths)
 * @param {Document} doc
 */
function _cleanImages(doc) {
	const images = doc.body.querySelectorAll('img');
	for (let i = images.length - 1; i >= 0; i--) {
		const img = images[i];
		const src = img.getAttribute('src') || '';

		// Remove broken file:/// protocol images
		if (_RE_FILE_PROTOCOL.test(src)) {
			img.remove();
			continue;
		}

		// Remove v:shapes attribute
		img.removeAttribute('v:shapes');
	}
}

// ---------- break handling ----------

/**
 * @description Handles Word page breaks, section breaks, and manual line breaks.
 *   - Page breaks (`mso-special-character:line-break` + `page-break-before:always`): remove
 *   - Section break `<br>` + `<div class=SectionN>`: unwrap section divs, remove break
 *   - Column breaks: remove
 *   - Manual line breaks (Shift+Enter): keep as `<br>`
 * @param {Document} doc
 */
function _cleanBreaks(doc) {
	const brs = doc.body.querySelectorAll('br');
	for (let i = brs.length - 1; i >= 0; i--) {
		const br = brs[i];
		const style = br.getAttribute('style') || '';

		// Page break or section break: remove
		if (_RE_PAGE_BREAK.test(style) || _RE_SECTION_BREAK.test(style)) {
			br.remove();
			continue;
		}

		// Column break: remove
		if (_RE_COLUMN_BREAK.test(style)) {
			br.remove();
			continue;
		}

		// Clean clear attribute and style from regular line breaks
		br.removeAttribute('style');
		br.removeAttribute('clear');
	}

	// Unwrap Section divs (Section1, Section2, etc.)
	const sectionDivs = doc.body.querySelectorAll('div[class*="Section"]');
	for (let i = sectionDivs.length - 1; i >= 0; i--) {
		const div = sectionDivs[i];
		const cls = div.getAttribute('class') || '';
		if (_RE_SECTION_CLASS.test(cls.trim())) {
			const parent = div.parentNode;
			if (parent) {
				while (div.firstChild) {
					parent.insertBefore(div.firstChild, div);
				}
				div.remove();
			}
		}
	}
}

// ---------- public API ----------

/**
 * @description Converts MS Word/Excel/OneNote HTML clipboard data to clean, standards-compliant HTML.
 * @param {string} html Raw HTML string from MS Office clipboard
 * @returns {string} Cleaned HTML string
 */
export function cleanHTML(html) {
	if (!html) return '';

	// 1. Extract list style definitions from <style> blocks before removing them
	const listStyles = _extractListStyles(html);

	// 2. String-level cleanup (before DOM parsing)
	let cleaned = html;

	// Remove <style> blocks
	cleaned = cleaned.replace(_RE_STYLE_BLOCKS, '');

	// Remove <xml>...</xml> blocks
	cleaned = cleaned.replace(_RE_XML_BLOCKS, '');

	// Remove conditional comments
	cleaned = cleaned.replace(_RE_CONDITIONAL_COMMENTS, '');

	// Remove Office namespace tags (<o:p>, <w:Sdt>, etc.)
	cleaned = cleaned.replace(_RE_OFFICE_TAGS, '');

	// Remove <!--StartFragment--> / <!--EndFragment-->
	cleaned = cleaned.replace(/<!--(?:Start|End)Fragment-->/gi, '');

	// Remove <meta> and <link> tags
	cleaned = cleaned.replace(/<(?:meta|link)[^>]*>/gi, '');

	// Normalize mso-spacerun spans → single space
	cleaned = cleaned.replace(_RE_SPACERUN, ' ');

	// Normalize mso-tab-count spans → single space
	cleaned = cleaned.replace(_RE_TAB_COUNT, ' ');

	// Normalize &nbsp; sequences (Word uses excessive &nbsp;)
	cleaned = cleaned.replace(/(&nbsp;){2,}/g, ' ');

	// Remove soft hyphens
	cleaned = cleaned.replace(/\u00AD/g, '');

	// 3. DOM-level cleanup
	const doc = new DOMParser().parseFromString(cleaned, 'text/html');

	// 3a. Remove track changes & comments first (before structural changes)
	_cleanTrackChanges(doc);

	// 3b. Convert Word fake lists to proper <ol>/<ul>/<li>
	_convertLists(doc, listStyles);

	// 3c. Convert outline-level paragraphs to semantic headings
	_convertHeadings(doc);

	// 3d. Clean tables
	_cleanTables(doc);

	// 3e. Clean links
	_cleanLinks(doc);

	// 3f. Clean images
	_cleanImages(doc);

	// 3g. Clean page/section/column breaks
	_cleanBreaks(doc);

	// 3h. Clean all elements (styles, classes, attributes)
	const allElements = doc.body.querySelectorAll('*');
	for (const el of allElements) {
		_cleanStyles(el);
		_cleanClasses(el);

		// Remove Word-specific attributes
		if (el.getAttribute('lang')) el.removeAttribute('lang');
		el.removeAttribute('v:shapes');

		// Remove width/height from non-media, non-table elements
		const tag = el.tagName.toLowerCase();
		if (tag !== 'img' && tag !== 'video' && tag !== 'iframe' && tag !== 'table' && tag !== 'td' && tag !== 'th') {
			el.removeAttribute('width');
			el.removeAttribute('height');
		}
	}

	// 3i. Unwrap empty spans
	_unwrapEmptySpans(doc.body);

	// 3j. Remove completely empty paragraphs
	const paragraphs = doc.body.querySelectorAll('p');
	for (const p of paragraphs) {
		if (!p.textContent.trim() && !p.querySelector('img, video, iframe, br, table')) {
			p.remove();
		}
	}

	return doc.body.innerHTML;
}

export default {
	cleanHTML,
};
