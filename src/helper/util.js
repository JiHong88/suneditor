/*
 * wysiwyg web editor
 *
 * suneditor.js
 * Copyright 2017 JiHong Lee.
 * MIT license.
 */
"use strict";

/**
 * @description utility function
 */
const util = {
	/**
	 * @description Unicode Character 'ZERO WIDTH SPACE' (\u200B)
	 */
	zeroWidthSpace: String.fromCharCode(8203),

	/**
	 * @description Regular expression to find 'zero width space' (/\u200B/g)
	 */
	zeroWidthRegExp: new RegExp(String.fromCharCode(8203), "g"),

	/**
	 * @description Regular expression to find only 'zero width space' (/^\u200B+$/)
	 */
	onlyZeroWidthRegExp: new RegExp("^" + String.fromCharCode(8203) + "+$"),

	/**
	 * @description A method that checks If the text is blank or to see if it contains 'ZERO WIDTH SPACE' or empty (util.zeroWidthSpace)
	 * @param {String|Node} text String value or Node
	 * @returns {Boolean}
	 */
	onlyZeroWidthSpace: function (text) {
		if (typeof text !== "string") text = text.textContent;
		return text === "" || this.onlyZeroWidthRegExp.test(text);
	},

	/**
	 * @description Gets XMLHttpRequest object
	 * @returns {XMLHttpRequest|ActiveXObject}
	 */
	getXMLHttpRequest: function () {
		/** IE */
		if (this._w.ActiveXObject) {
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e1) {
					return null;
				}
			}
		} else if (this._w.XMLHttpRequest) {
		/** netscape */
			return new XMLHttpRequest();
		} else {
		/** fail */
			return null;
		}
	},

	/**
	 * @description Create Element node
	 * @param {String} elementName Element name
	 * @returns {Element}
	 */
	createElement: function (elementName) {
		return this._d.createElement(elementName);
	},

	/**
	 * @description Create text node
	 * @param {String} text text contents
	 * @returns {Node}
	 */
	createTextNode: function (text) {
		return this._d.createTextNode(text || "");
	},

	/**
	 * @description This method run Object.prototype.hasOwnProperty.call(obj, key)
	 * @param {Object} obj Object
	 * @param {String} key obj.key
	 * @returns {Boolean}
	 */
	hasOwn: function (obj, key) {
		return this._hasOwn.call(obj, key);
	},
	_hasOwn: Object.prototype.hasOwnProperty,

	/**
	 * @deprecated
	 * @description Get the the tag path of the arguments value
	 * If not found, return the first found value
	 * @param {Array} nameArray File name array
	 * @param {String} extension js, css
	 * @returns {String}
	 */
	getIncludePath: function (nameArray, extension) {
		let path = "";
		const pathList = [];
		const tagName = extension === "js" ? "script" : "link";
		const src = extension === "js" ? "src" : "href";

		let fileName = "(?:";
		for (let i = 0, len = nameArray.length; i < len; i++) {
			fileName += nameArray[i] + (i < len - 1 ? "|" : ")");
		}

		const regExp = new this._w.RegExp(
			"(^|.*[\\/])" + fileName + "(\\.[^\\/]+)?." + extension + "(?:\\?.*|;.*)?$",
			"i"
		);
		const extRegExp = new this._w.RegExp(".+\\." + extension + "(?:\\?.*|;.*)?$", "i");

		for (let c = this._d.getElementsByTagName(tagName), i = 0; i < c.length; i++) {
			if (extRegExp.test(c[i][src])) {
				pathList.push(c[i]);
			}
		}

		for (let i = 0; i < pathList.length; i++) {
			let editorTag = pathList[i][src].match(regExp);
			if (editorTag) {
				path = editorTag[0];
				break;
			}
		}

		if (path === "") path = pathList.length > 0 ? pathList[0][src] : "";

		-1 === path.indexOf(":/") &&
			"//" !== path.slice(0, 2) &&
			(path =
				0 === path.indexOf("/")
					? location.href.match(/^.*?:\/\/[^\/]*/)[0] + path
					: location.href.match(/^[^\?]*\/(?:)/)[0] + path);

		if (!path)
			throw (
				"[SUNEDITOR.util.getIncludePath.fail] The SUNEDITOR installation path could not be automatically detected. (name: +" +
				name +
				", extension: " +
				extension +
				")"
			);

		return path;
	},

	/**
	 * @deprecated
	 * @description Returns the CSS text that has been applied to the current page.
	 * @param {Document|null} doc To get the CSS text of an document(core._wd). If null get the current document.
	 * @returns {String} Styles string
	 */
	getPageStyle: function (doc) {
		let cssText = "";
		const sheets = (doc || this._d).styleSheets;

		for (let i = 0, len = sheets.length, rules; i < len; i++) {
			try {
				rules = sheets[i].cssRules;
			} catch (e) {
				continue;
			}

			if (rules) {
				for (let c = 0, cLen = rules.length; c < cLen; c++) {
					cssText += rules[c].cssText;
				}
			}
		}

		return cssText;
	},

	/**
	 * @description Checks for "__se__uneditable" in the class list.
	 * Components with class "__se__uneditable" cannot be modified.
	 * @param {Element} element The element to check
	 * @returns {Boolean}
	 */
	isUneditableComponent: function (element) {
		return element && this.hasClass(element, "__se__uneditable");
	},

	/**
	 * @description It is judged whether it is the component [img, iframe] cover(class="se-component")
	 * @param {Node} element The node to check
	 * @returns {Boolean}
	 */
	isMediaComponent: function (element) {
		return element && /se-component/.test(element.className);
	},

	/**
	 * @description Add style and className of copyEl to originEl
	 * @param {Element} originEl Origin element
	 * @param {Element} copyEl Element to copy
	 */
	copyTagAttributes: function (originEl, copyEl) {
		if (copyEl.style.cssText) {
			originEl.style.cssText += copyEl.style.cssText;
		}

		const classes = copyEl.classList;
		for (let i = 0, len = classes.length; i < len; i++) {
			this.addClass(originEl, classes[i]);
		}

		if (!originEl.style.cssText) originEl.removeAttribute("style");
		if (!originEl.className.trim()) originEl.removeAttribute("class");
	},

	/**
	 * @description Copy and apply attributes of format tag that should be maintained. (style, class) Ignore "__se__format__" class
	 * @param {Element} originEl Origin element
	 * @param {Element} copyEl Element to copy
	 */
	copyFormatAttributes: function (originEl, copyEl) {
		copyEl = copyEl.cloneNode(false);
		copyEl.className = copyEl.className.replace(/(\s|^)__se__format__[^\s]+/g, "");
		this.copyTagAttributes(originEl, copyEl);
	},

	/**
	 * @description Get the item from the array that matches the condition.
	 * @param {Array|HTMLCollection|NodeList} array Array to get item
	 * @param {Function|null} validation Conditional function
	 * @param {Boolean} multi If true, returns all items that meet the criteria otherwise, returns an empty array.
	 * If false, returns only one item that meet the criteria otherwise return null.
	 * @returns {Array|Node|null}
	 */
	getArrayItem: function (array, validation, multi) {
		if (!array || array.length === 0) return null;

		validation =
			validation ||
			function () {
				return true;
			};
		const arr = [];

		for (let i = 0, len = array.length, a; i < len; i++) {
			a = array[i];
			if (validation(a)) {
				if (!multi) return a;
				else arr.push(a);
			}
		}

		return !multi ? null : arr;
	},

	/**
	 * @description Get the index of the argument value in the element array
	 * @param {Array|HTMLCollection|NodeList} array element array
	 * @param {Node} element The element to find index
	 * @returns {Number}
	 */
	getArrayIndex: function (array, element) {
		let idx = -1;
		for (let i = 0, len = array.length; i < len; i++) {
			if (array[i] === element) {
				idx = i;
				break;
			}
		}

		return idx;
	},

	/**
	 * @description Get the next index of the argument value in the element array
	 * @param {Array|HTMLCollection|NodeList} array element array
	 * @param {Node} item The element to find index
	 * @returns {Number}
	 */
	nextIdx: function (array, item) {
		let idx = this.getArrayIndex(array, item);
		if (idx === -1) return -1;
		return idx + 1;
	},

	/**
	 * @description Get the previous index of the argument value in the element array
	 * @param {Array|HTMLCollection|NodeList} array Element array
	 * @param {Node} item The element to find index
	 * @returns {Number}
	 */
	prevIdx: function (array, item) {
		let idx = this.getArrayIndex(array, item);
		if (idx === -1) return -1;
		return idx - 1;
	},

	/**
	 * @description Check the line element is empty.
	 * @param {Element} element Format element node
	 * @returns {Boolean}
	 */
	isEmptyLine: function (element) {
		return (
			!element ||
			!element.parentNode ||
			(!element.querySelector("IMG, IFRAME, AUDIO, VIDEO, CANVAS, TABLE") &&
				this.onlyZeroWidthSpace(element.textContent))
		);
	},

	/**
	 * @description Checks for numeric (with decimal point).
	 * @param {String|Number} text Text string or number
	 * @returns {Boolean}
	 */
	isNumber: function (text) {
		return !!text && /^-?\d+(\.\d+)?$/.test(text + "");
	},

	/**
	 * @description Get a number.
	 * @param {String|Number} text Text string or number
	 * @param {Number} maxDec Maximum number of decimal places (-1 : Infinity)
	 * @returns {Number}
	 */
	getNumber: function (text, maxDec) {
		if (!text) return 0;

		let number = (text + "").match(/-?\d+(\.\d+)?/);
		if (!number || !number[0]) return 0;

		number = number[0];
		return maxDec < 0
			? number * 1
			: maxDec === 0
			? this._w.Math.round(number * 1)
			: (number * 1).toFixed(maxDec) * 1;
	},

	/**
	 * @description Returns the position of the left and top of argument. {left:0, top:0}
	 * @param {Node} element Target node
	 * @param {Element|null} wysiwygFrame When use iframe option, iframe object should be sent (context.element.wysiwygFrame)
	 * @returns {Object}
	 */
	getOffset: function (element, wysiwygFrame) {
		let offsetLeft = 0;
		let offsetTop = 0;
		let offsetElement = element.nodeType === 3 ? element.parentElement : element;
		const wysiwyg = this.getParentElement(element, this.isWysiwygDiv.bind(this));

		while (offsetElement && !this.hasClass(offsetElement, "se-container") && offsetElement !== wysiwyg) {
			offsetLeft += offsetElement.offsetLeft;
			offsetTop += offsetElement.offsetTop;
			offsetElement = offsetElement.offsetParent;
		}

		const iframe = wysiwygFrame && /iframe/i.test(wysiwygFrame.nodeName);

		return {
			left: offsetLeft + (iframe ? wysiwygFrame.parentElement.offsetLeft : 0),
			top: offsetTop - (wysiwyg ? wysiwyg.scrollTop : 0) + (iframe ? wysiwygFrame.parentElement.offsetTop : 0)
		};
	},

	/**
	 * @description It compares the start and end indexes of "a" and "b" and returns the number of overlapping indexes in the range.
	 * ex) 1, 5, 4, 6 => "2" (4 ~ 5)
	 * @param {Number} aStart Start index of "a"
	 * @param {Number} aEnd End index of "a"
	 * @param {Number} bStart Start index of "b"
	 * @param {Number} bEnd Start index of "b"
	 * @returns {Number}
	 */
	getOverlapRangeAtIndex: function (aStart, aEnd, bStart, bEnd) {
		if (aStart <= bEnd ? aEnd < bStart : aEnd > bStart) return 0;

		const overlap = (aStart > bStart ? aStart : bStart) - (aEnd < bEnd ? aEnd : bEnd);
		return (overlap < 0 ? overlap * -1 : overlap) + 1;
	},

	/**
	 * @description In the predefined code view mode, the buttons except the executable button are changed to the 'disabled' state.
	 * core.codeViewDisabledButtons (An array of buttons whose class name is not "se-code-view-enabled")
	 * core.resizingDisabledButtons (An array of buttons whose class name is not "se-resizing-enabled")
	 * @param {Boolean} disabled Disabled value
	 * @param {Array|HTMLCollection|NodeList} buttonList Button array
	 */
	setDisabledButtons: function (disabled, buttonList) {
		for (let i = 0, len = buttonList.length; i < len; i++) {
			buttonList[i].disabled = disabled;
		}
	},

	/**
	 * @description Remove whitespace between tags in HTML string.
	 * @param {String} html HTML string
	 * @returns {String}
	 */
	htmlRemoveWhiteSpace: function (html) {
		if (!html) return "";
		return html
			.trim()
			.replace(
				/<\/?(?!strong|span|font|b|var|i|em|u|ins|s|strike|del|sub|sup|mark|a|label|code|summary)[^>^<]+>\s+(?=<)/gi,
				function (m) {
					return m.trim();
				}
			);
	},

	/**
	 * @description Sort a element array by depth of element.
	 * @param {Array} array Array object
	 * @param {Boolean} des true: descending order / false: ascending order
	 */
	sortByDepth: function (array, des) {
		const t = !des ? -1 : 1;
		const f = t * -1;

		array.sort(
			function (a, b) {
				if (!this.isListCell(a) || !this.isListCell(b)) return 0;
				a = this.getElementDepth(a);
				b = this.getElementDepth(b);
				return a > b ? t : a < b ? f : 0;
			}.bind(this)
		);
	},

	/**
	 * @description Create whitelist RegExp object.
	 * Return RegExp format: new RegExp("<\\/?\\b(?!" + list + ")\\b[^>^<]*+>", "gi")
	 * @param {String} list Tags list ("br|p|div|pre...")
	 * @returns {RegExp}
	 */
	createTagsWhitelist: function (list) {
		return new RegExp("<\\/?\\b(?!\\b" + list.replace(/\|/g, "\\b|\\b") + "\\b)[^>]*>", "gi");
	},

	_setDefaultOptionStyle: function (options, defaultStyle) {
		let optionStyle = "";
		if (options.height) optionStyle += "height:" + options.height + ";";
		if (options.minHeight) optionStyle += "min-height:" + options.minHeight + ";";
		if (options.maxHeight) optionStyle += "max-height:" + options.maxHeight + ";";
		if (options.position) optionStyle += "position:" + options.position + ";";
		if (options.width) optionStyle += "width:" + options.width + ";";
		if (options.minWidth) optionStyle += "min-width:" + options.minWidth + ";";
		if (options.maxWidth) optionStyle += "max-width:" + options.maxWidth + ";";

		let top = "",
			frame = "",
			editor = "";
		defaultStyle = optionStyle + defaultStyle;
		const styleArr = defaultStyle.split(";");
		for (let i = 0, len = styleArr.length, s; i < len; i++) {
			s = styleArr[i].trim();
			if (!s) continue;
			if (/^(min-|max-)?width\s*:/.test(s) || /^(z-index|position)\s*:/.test(s)) {
				top += s + ";";
				continue;
			}
			if (/^(min-|max-)?height\s*:/.test(s)) {
				if (/^height/.test(s) && s.split(":")[1].trim() === "auto") {
					options.height = "auto";
				}
				frame += s + ";";
				continue;
			}
			editor += s + ";";
		}

		return {
			top: top,
			frame: frame,
			editor: editor
		};
	},

	_setIframeDocument: function (frame, options) {
		frame.setAttribute("scrolling", "auto");
		frame.contentDocument.head.innerHTML =
			"" +
			'<meta charset="utf-8" />' +
			'<meta name="viewport" content="width=device-width, initial-scale=1">' +
			this._setIframeCssTags(options);
		frame.contentDocument.body.className = options._editableClass;
		frame.contentDocument.body.setAttribute("contenteditable", true);
	},

	_setIframeCssTags: function (options) {
		const linkNames = options.iframeCSSFileName;
		const wRegExp = this._w.RegExp;
		let tagString = "";

		for (let f = 0, len = linkNames.length, path; f < len; f++) {
			path = [];

			if (/(^https?:\/\/)|(^data:text\/css,)/.test(linkNames[f])) {
				path.push(linkNames[f]);
			} else {
				const CSSFileName = new wRegExp("(^|.*[\\/])" + linkNames[f] + "(\\..+)?\\.css(?:\\?.*|;.*)?$", "i");
				for (let c = document.getElementsByTagName("link"), i = 0, len = c.length, styleTag; i < len; i++) {
					styleTag = c[i].href.match(CSSFileName);
					if (styleTag) path.push(styleTag[0]);
				}
			}

			if (!path || path.length === 0)
				throw '[SUNEDITOR.constructor.iframe.fail] The suneditor CSS files installation path could not be automatically detected. Please set the option property "iframeCSSFileName" before creating editor instances.';

			for (let i = 0, len = path.length; i < len; i++) {
				tagString += '<link href="' + path[i] + '" rel="stylesheet">';
			}
		}

		return (
			tagString +
			(options.height === "auto"
				? "<style>\n/** Iframe height auto */\nbody{height: min-content; overflow: hidden;}\n</style>"
				: "")
		);
	}
};

export default util;
