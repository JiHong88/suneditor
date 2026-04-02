import { dom, env } from '../../../helper';
import { CreateToolBar, UpdateButton } from '../../section/constructor';

const { _w } = env;

/**
 * @description Toolbar class
 */
class Toolbar {
	#kernel;
	#$;
	#store;

	#icons;
	#lang;
	#context;
	#frameContext;
	#options;
	#eventManager;

	#originRes;
	#rButtonArray;
	#isViewPortSize;

	#responsiveCurrentSize = 'default';
	#rButtonsInfo = null;
	#rButtonsize = null;

	#useCSSSticky = false;
	#_isStickyFlag = false;
	#_cssStickyShifted = false;

	/**
	 * @constructor
	 * @param {SunEditor.Kernel} kernel
	 * @param {Object} options - Toolbar options
	 * @param {"toolbar"|"toolbar_sub"} options.keyName - Toolbar key name
	 * @param {boolean} options.balloon - Balloon toolbar
	 * @param {boolean} options.inline - Inline toolbar
	 * @param {boolean} options.balloonAlways - Balloon toolbar always show
	 * @param {Array<Node>} options.res - Responsive toolbar button list
	 */
	constructor(kernel, { keyName, balloon, inline, balloonAlways, res }) {
		this.#kernel = kernel;
		this.#$ = kernel.$;
		this.#store = kernel.store;

		this.#icons = this.#$.icons;
		this.#lang = this.#$.lang;
		this.#context = this.#$.context;
		this.#frameContext = this.#$.frameContext;
		this.#options = this.#$.options;
		this.#eventManager = this.#$.eventManager;

		// members
		this.isSub = keyName === 'toolbar_sub';

		/**
		 * @type {Object}
		 * @description Key names for the toolbar elements.
		 * @property {"toolbar_sub_main"|"toolbar_main"} main - Main toolbar key name
		 * @property {"toolbar_sub_buttonTray"|"toolbar_buttonTray"} buttonTray - Button tray key name
		 * @property {"toolbar_sub_width"|"toolbar_width"} width - Toolbar width key name
		 */
		this.keyName = {
			main: this.isSub ? 'toolbar_sub_main' : 'toolbar_main',
			buttonTray: this.isSub ? 'toolbar_sub_buttonTray' : 'toolbar_buttonTray',
			width: this.isSub ? 'toolbar_sub_width' : 'toolbar_width',
		};

		this.currentMoreLayerActiveButton = null;
		this.isBalloonMode = balloon;
		this.isInlineMode = inline;
		this.isBalloonAlwaysMode = balloonAlways;

		this.inlineToolbarAttr = {
			top: '',
			width: '',
			isShow: false,
		};
		this.balloonOffset = {
			top: 0,
			left: 0,
		};

		this.#originRes = res;
		this.#rButtonArray = res;
		this.#isViewPortSize = 'visualViewport' in _w;

		// CSS sticky: non-balloon, non-inline, non-container, sticky enabled
		const isStickyPosible = !this.isSub && !balloon && !inline;
		const stickyTop = this.#options.get('_toolbar_sticky');

		this.#useCSSSticky = isStickyPosible && stickyTop >= 0 && !this.#options.get('toolbar_container') && typeof CSS !== 'undefined' && CSS.supports('position', 'sticky');

		this.isBottomMode = this.#store.mode.isBottom;

		if (this.#useCSSSticky) {
			// CSS sticky: browser handles positioning natively
			const toolbar = this.#context.get(this.keyName.main);
			if (this.isBottomMode) {
				toolbar.style.bottom = stickyTop + 'px';
				toolbar.style.top = 'auto';
			} else if (stickyTop > 0) {
				toolbar.style.top = stickyTop + 'px';
			}
		} else if (isStickyPosible) {
			// JS fallback (toolbar_container) or sticky disabled (-1):
			dom.utils.addClass(this.#context.get(this.keyName.main), 'se-toolbar-relative');
		}

		this._setResponsive();
	}

	/**
	 * @description Whether the toolbar is currently in a sticky (fixed) state.
	 * For CSS sticky mode, computed from the element's viewport position.
	 * For JS sticky mode (toolbar_container), uses a manual flag.
	 * @type {boolean}
	 */
	get isSticky() {
		if (this.isSub) return false;
		const stickyTop = this.#options.get('_toolbar_sticky');
		if (stickyTop < 0) return false;

		if (this.#useCSSSticky) {
			const toolbar = this.#context.get(this.keyName.main);
			if (!toolbar || toolbar.offsetWidth === 0 || toolbar.style.display === 'none') return false;
			if (this.isBottomMode) {
				const viewportHeight = this.#isViewPortSize ? _w.visualViewport.height : _w.innerHeight;
				return toolbar.getBoundingClientRect().bottom >= viewportHeight - stickyTop - 1;
			}
			return toolbar.getBoundingClientRect().top <= stickyTop + 1;
		}

		return this.#_isStickyFlag;
	}

	/**
	 * @description Whether the toolbar uses native CSS `position: sticky`.
	 * - When `false`, the JS-based sticky fallback (`position: fixed`) is active.
	 * @type {boolean}
	 */
	get isCSSSticky() {
		return this.#useCSSSticky;
	}

	/**
	 * @description Disables all toolbar buttons.
	 */
	disable() {
		/** off menus */
		this._moreLayerOff();
		this.#$.menu.dropdownOff();
		this.#$.menu.containerOff();
		dom.utils.setDisabled(this.#context.get(this.keyName.buttonTray).querySelectorAll('.se-menu-list .se-toolbar-btn[data-type]'), true);
	}

	/**
	 * @description Enables all toolbar buttons.
	 */
	enable() {
		dom.utils.setDisabled(this.#context.get(this.keyName.buttonTray).querySelectorAll('.se-menu-list .se-toolbar-btn[data-type]'), false);
	}

	/**
	 * @description Shows the toolbar.
	 */
	show() {
		if (this.isInlineMode) {
			this._showInline();
		} else if (this.isBalloonMode) {
			this._showBalloon();
		} else {
			this.#context.get(this.keyName.main).style.display = '';
			if (!this.isSub) this.#frameContext.get('_stickyDummy').style.display = '';
		}

		if (!this.isSub) this.resetResponsiveToolbar();
	}

	/**
	 * @description Hides the toolbar.
	 */
	hide() {
		if (this.isInlineMode) {
			this.#context.get(this.keyName.main).style.display = 'none';
			this.#context.get(this.keyName.main).style.top = '0px';
			this.inlineToolbarAttr.isShow = false;
		} else {
			this.#context.get(this.keyName.main).style.display = 'none';
			if (!this.isSub) this.#frameContext.get('_stickyDummy').style.display = 'none';
			if (this.isBalloonMode) {
				this.balloonOffset = {
					top: 0,
					left: 0,
				};
			}
		}
	}

	/**
	 * @description Reset buttons of the responsive toolbar.
	 */
	resetResponsiveToolbar() {
		this.#$.menu.containerOff();

		const responsiveSize = this.#rButtonsize;
		if (responsiveSize) {
			let w = 0;
			if (((this.isBalloonMode || this.isInlineMode) && this.#options.get('toolbar_width') === 'auto') || (this.#store.mode.isSubBalloon && this.#options.get('toolbar_sub_width') === 'auto')) {
				w = this.#frameContext.get('topArea').offsetWidth;
			} else {
				w = this.#context.get(this.keyName.main).offsetWidth;
			}

			let responsiveWidth = 'default';
			for (let i = 1, len = responsiveSize.length; i < len; i++) {
				if (w < responsiveSize[i]) {
					responsiveWidth = responsiveSize[i] + '';
					break;
				}
			}

			if (this.#responsiveCurrentSize !== responsiveWidth) {
				this.#responsiveCurrentSize = responsiveWidth;
				this.setButtons(this.#rButtonsInfo[responsiveWidth]);
			}
		}
	}

	/**
	 * @description Reset the buttons on the toolbar. (Editor is not reloaded.)
	 * - You cannot set a new plugin for the button.
	 * @param {Array} buttonList Button list
	 */
	setButtons(buttonList) {
		this._moreLayerOff();
		this.#$.menu.dropdownOff();
		this.#$.menu.containerOff();

		const newToolbar = CreateToolBar(buttonList, this.#$.plugins, this.#options, this.#icons, this.#lang, true);

		newToolbar.updateButtons.forEach((v) => UpdateButton(v.button, v.plugin, this.#icons, this.#lang));

		this.#context.get(this.keyName.main).replaceChild(newToolbar.buttonTray, this.#context.get(this.keyName.buttonTray));
		this.#context.set(this.keyName.buttonTray, newToolbar.buttonTray);

		this.#resetButtonInfo();

		this.#eventManager.triggerEvent('onSetToolbarButtons', { buttonTray: newToolbar.buttonTray, frameContext: this.#frameContext });
	}

	/**
	 * @internal
	 * @description Reset the sticky toolbar position based on the editor state.
	 */
	_resetSticky() {
		if (this.#useCSSSticky) {
			this.#resetCSSStickyOffset();
			return;
		}

		const wrapper = this.#frameContext.get('wrapper');
		if (!wrapper) return;

		const toolbar = this.#context.get(this.keyName.main);
		const stickyTop = this.#options.get('_toolbar_sticky');
		if (this.#frameContext.get('isFullScreen') || toolbar.offsetWidth === 0 || stickyTop < 0) return;

		const currentScrollY = this.#isViewPortSize ? _w.visualViewport.pageTop : _w.scrollY;

		const minHeight = this.#frameContext.get('_minHeight');
		const editorHeight = wrapper.offsetHeight;
		const editorOffset = this.#$.offset.getGlobal(this.#frameContext.get('topArea'));
		const inlineOffset = 1;

		if (this.isBottomMode) {
			const viewportBottom = currentScrollY + _w.innerHeight;
			const editorBottom = editorOffset.top + editorHeight;
			const y = viewportBottom - stickyTop - (this.isInlineMode ? toolbar.offsetHeight : 0);

			const offSticky = !this.#options.get('toolbar_container') ? y - editorOffset.top - minHeight : viewportBottom - stickyTop - editorOffset.top - minHeight - toolbar.offsetHeight;
			if (y > editorBottom) {
				this.#offSticky();
			} else if (offSticky < 0) {
				if (!this.isSticky) this.#onSticky(inlineOffset);
				toolbar.style.bottom = inlineOffset + offSticky + this.#getViewportTop() + 'px';
				toolbar.style.top = 'auto';
			} else {
				this.#onSticky(inlineOffset);
			}
		} else {
			const y = currentScrollY + stickyTop;
			const t = (this.isBalloonMode || this.isInlineMode ? editorOffset.top : this.#$.offset.getGlobal(this.#options.get('toolbar_container')).top) - (this.isInlineMode ? toolbar.offsetHeight : 0);

			const offSticky = !this.#options.get('toolbar_container') ? editorHeight + t + stickyTop - y - minHeight : editorOffset.top - currentScrollY + editorHeight - minHeight - stickyTop - toolbar.offsetHeight;
			if (y < t) {
				this.#offSticky();
			} else if (offSticky < 0) {
				if (!this.isSticky) this.#onSticky(inlineOffset);
				toolbar.style.top = inlineOffset + offSticky + this.#getViewportTop() + 'px';
			} else {
				this.#onSticky(inlineOffset);
			}
		}
	}

	/**
	 * @description Reset the common buttons info.
	 */
	#resetButtonInfo() {
		this.#$.shortcuts._registerShortcuts();
		this.#$.commandDispatcher.resetTargets();
		this.#$.ui._initToggleButtons();

		this.#$.history.resetButtons(this.#frameContext.get('key'), null);
		this._resetSticky();

		this.#store.set('_lastSelectionNode', null);
		this.#$.viewer._setButtonsActive();
		if (this.#store.get('hasFocus')) this.#kernel._eventOrchestrator.applyTagEffect();
		if (this.#frameContext.get('isReadOnly')) this.#$.ui.setControllerOnDisabledButtons(true);
	}

	/**
	 * @internal
	 * @description Set up responsive behavior for the toolbar buttons.
	 */
	_setResponsive() {
		if (this.#rButtonArray?.length === 0) {
			this.#rButtonArray = null;
			return;
		}

		this.#responsiveCurrentSize = 'default';
		const _rButtonsize = (this.#rButtonsize = []);
		const _responsiveButtons = this.#originRes;
		const buttonsObj = (this.#rButtonsInfo = {
			default: _responsiveButtons[0],
		});

		for (let i = 1, len = _responsiveButtons.length, size, buttonGroup; i < len; i++) {
			buttonGroup = _responsiveButtons[i];
			size = buttonGroup[0] * 1;
			_rButtonsize.push(size);
			buttonsObj[size] = buttonGroup[1];
		}

		_rButtonsize.sort((a, b) => a - b).unshift('default');
	}

	/**
	 * @internal
	 * @description Show the `balloon` toolbar based on the current selection.
	 * @param {?Range} [rangeObj] - Selection range
	 */
	_showBalloon(rangeObj) {
		if (!this.isBalloonMode) {
			return;
		}
		if (this.isSub) this.resetResponsiveToolbar();

		const range = rangeObj || this.#$.selection.getRange();
		const toolbar = this.#context.get(this.keyName.main);
		const selection = this.#$.selection.get();

		let isDirTop;
		if (this.isBalloonAlwaysMode && range.collapsed) {
			isDirTop = true;
		} else if (selection.focusNode === selection.anchorNode) {
			isDirTop = selection.focusOffset < selection.anchorOffset;
		} else {
			const childNodes = dom.query.getListChildNodes(range.commonAncestorContainer, null, null);
			isDirTop = dom.utils.getArrayIndex(childNodes, selection.focusNode) < dom.utils.getArrayIndex(childNodes, selection.anchorNode);
		}

		this._setBalloonOffset(isDirTop, range);

		this.#eventManager.triggerEvent('onShowToolbar', { toolbar, mode: 'balloon', frameContext: this.#frameContext });
	}

	/**
	 * @internal
	 * @description Adjust the `balloon` toolbar's position.
	 * @param {boolean} positionTop - Whether the toolbar should be positioned above the selection
	 * @param {Range} [range] - Selection range
	 */
	_setBalloonOffset(positionTop, range) {
		const toolbar = this.#context.get(this.keyName.main);
		const topArea = this.#frameContext.get('topArea');
		const offsets = this.#$.offset.getGlobal(topArea);
		const stickyTop = offsets.top;

		if (!this.#$.offset.setRangePosition(toolbar, range, { position: positionTop ? 'top' : 'bottom', addTop: stickyTop })) {
			this.hide();
			return;
		}

		if (this.#options.get('toolbar_container')) {
			const editorParent = topArea.parentElement;

			let container = this.#options.get('toolbar_container');
			let left = container.offsetLeft;
			let top = container.offsetTop;

			while (!container.parentElement.contains(editorParent) && !/^(BODY|HTML)$/i.test(container.parentElement.nodeName)) {
				container = /** @type {HTMLElement} */ (container.offsetParent);
				left += container.offsetLeft;
				top += container.offsetTop;
			}

			toolbar.style.left = toolbar.offsetLeft - left + topArea.offsetLeft + 'px';
			toolbar.style.top = toolbar.offsetTop - top + topArea.offsetTop + 'px';
		}

		const wwScroll = this.#$.offset.getWWScroll();
		this.balloonOffset = {
			top: toolbar.offsetTop + wwScroll.top,
			left: toolbar.offsetLeft + wwScroll.left,
			position: positionTop ? 'top' : 'bottom',
		};
	}

	/**
	 * @internal
	 * @description Show the `inline` toolbar mode.
	 */
	_showInline() {
		if (!this.isInlineMode) return;

		const toolbar = this.#context.get(this.keyName.main);
		toolbar.style.visibility = 'hidden';
		toolbar.style.display = 'block';
		this.#offSticky();

		toolbar.style.top = '0px';
		this.inlineToolbarAttr.width = toolbar.style.width = this.#options.get(this.keyName.width);
		if (this.isBottomMode) {
			const topArea = this.#frameContext.get('topArea');
			this.inlineToolbarAttr.top = toolbar.style.top = this.#$.offset.getGlobal(topArea).top + topArea.offsetHeight - this.#$.offset.getGlobal(toolbar).top + 'px';
		} else {
			this.inlineToolbarAttr.top = toolbar.style.top = -1 + (this.#$.offset.getGlobal(this.#frameContext.get('topArea')).top - this.#$.offset.getGlobal(toolbar).top - toolbar.offsetHeight) + 'px';
		}

		this._resetSticky();
		this.inlineToolbarAttr.isShow = true;

		this.#eventManager.triggerEvent('onShowToolbar', { toolbar, mode: 'inline', frameContext: this.#frameContext });

		toolbar.style.visibility = '';
	}

	/**
	 * @internal
	 * @description Show a more options layer for toolbar buttons.
	 * @param {Node} button - Button element
	 * @param {Node} layer - More options layer element
	 */
	_moreLayerOn(button, layer) {
		this._moreLayerOff();
		this.currentMoreLayerActiveButton = /** @type {HTMLButtonElement} */ (button);
		/** @type {HTMLElement} */ (layer).style.display = 'block';
	}

	/**
	 * @internal
	 * @description Hide the currently active more options layer.
	 */
	_moreLayerOff() {
		if (this.currentMoreLayerActiveButton) {
			/** @type {HTMLElement} */
			const layer = this.#context.get(this.keyName.main).querySelector('.' + this.currentMoreLayerActiveButton.getAttribute('data-command'));
			layer.style.display = 'none';
			dom.utils.removeClass(this.currentMoreLayerActiveButton, 'on');
			this.currentMoreLayerActiveButton = null;
		}
	}

	/**
	 * @description Enable `sticky` toolbar mode and adjust position.
	 */
	#onSticky(inlineOffset) {
		const toolbar = this.#context.get(this.keyName.main);

		if (!this.isInlineMode) {
			const stickyDummy = !this.#options.get('toolbar_container') ? this.#frameContext.get('_stickyDummy') : this.#context.get('_stickyDummy');
			stickyDummy.style.height = toolbar.offsetHeight + 'px';
			stickyDummy.style.display = 'block';
		}

		if (this.isBottomMode) {
			const toolbarBottomPosition = this.#options.get('_toolbar_sticky') + this.#getViewportTop();
			toolbar.style.bottom = `${toolbarBottomPosition}px`;
			toolbar.style.top = 'auto';
		} else {
			const toolbarTopPosition = this.#options.get('_toolbar_sticky') + inlineOffset + this.#getViewportTop();
			toolbar.style.top = `${toolbarTopPosition}px`;
		}
		toolbar.style.width = this.isInlineMode ? this.inlineToolbarAttr.width : toolbar.offsetWidth + 'px';
		dom.utils.addClass(toolbar, 'se-toolbar-sticky');
		this.#_isStickyFlag = true;
	}

	/**
	 * @description Get the viewport's top offset.
	 * @returns {number}
	 */
	#getViewportTop() {
		if (this.#isViewPortSize) {
			return _w.visualViewport.offsetTop;
		}
		return 0;
	}

	/**
	 * @description Adjust CSS sticky toolbar position when the mobile virtual keyboard changes the visual viewport.
	 */
	#resetCSSStickyOffset() {
		if (!this.#isViewPortSize) return;
		// When the editor is inside a scrollable container (e.g., modal),
		// position:sticky is relative to that container, not the viewport.
		if (this.#kernel._eventOrchestrator.scrollparents.length > 0) return;

		const viewportOffset = Math.round(_w.visualViewport.offsetTop);
		if (viewportOffset === 0 && !this.#_cssStickyShifted) return;

		const toolbar = this.#context.get(this.keyName.main);
		const stickyOffset = this.#options.get('_toolbar_sticky_offset');

		if (viewportOffset > 0) {
			this.#_cssStickyShifted = true;
			if (this.isBottomMode) {
				const viewportBottom = Math.round(_w.innerHeight - _w.visualViewport.height - viewportOffset);
				toolbar.style.bottom = stickyOffset + viewportBottom + 'px';
				toolbar.style.top = 'auto';
			} else {
				toolbar.style.top = stickyOffset + viewportOffset + 'px';
			}
		} else {
			// restore original CSS sticky value
			this.#_cssStickyShifted = false;
			const stickyTop = this.#options.get('_toolbar_sticky');
			if (this.isBottomMode) {
				toolbar.style.bottom = stickyTop + 'px';
				toolbar.style.top = 'auto';
			} else {
				toolbar.style.top = stickyTop > 0 ? stickyTop + 'px' : '';
			}
		}
	}

	/**
	 * @description Disable `sticky` toolbar mode.
	 */
	#offSticky() {
		const stickyDummy = !this.#options.get('toolbar_container') ? this.#frameContext.get('_stickyDummy') : this.#context.get('_stickyDummy');
		stickyDummy.style.display = 'none';

		const toolbar = this.#context.get(this.keyName.main);
		if (this.isBottomMode) {
			toolbar.style.bottom = this.isInlineMode ? `${-toolbar.offsetHeight}px` : '';
			toolbar.style.top = 'auto';
			this.#frameContext.get('wrapper').style.marginBottom = '';
		} else {
			toolbar.style.top = this.isInlineMode ? this.inlineToolbarAttr.top : '';
			this.#frameContext.get('wrapper').style.marginTop = '';
		}
		toolbar.style.width = this.isInlineMode ? this.inlineToolbarAttr.width : '';

		dom.utils.removeClass(toolbar, 'se-toolbar-sticky');
		this.#_isStickyFlag = false;
	}

	/**
	 * @internal
	 * @description Destroy the Toolbar instance and release memory
	 */
	_destroy() {
		this._moreLayerOff();
	}
}

export default Toolbar;
