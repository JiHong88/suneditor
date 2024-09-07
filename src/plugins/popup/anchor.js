import EditorInjector from '../../editorInjector';
import { Controller } from '../../modules';
import { domUtils, env } from '../../helper';

const { _w } = env;

const Anchor = function (editor) {
	EditorInjector.call(this, editor);
	// plugin basic properties
	this.title = this.lang.anchor;
	this.icon = 'bookmark_anchor';

	// members
	const parser = new DOMParser();
	const svgDoc = parser.parseFromString(this.icons.bookmark_anchor, 'image/svg+xml');
	this.bookmarkIcon = svgDoc.documentElement;
	this._element = null;
	this._range = null;

	// controller
	const controllerSelectEl = CreateHTML_controller_select(this);
	this.displayId = controllerSelectEl.querySelector('.se-controller-display');
	this.controllerSelect = new Controller(this, controllerSelectEl, { position: 'bottom', disabled: true }, this.kind);

	const controllerEl = CreateHTML_controller(this);
	this.inputEl = controllerEl.querySelector('input');
	this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: true, parents: [this.controllerSelect.form], parentsHide: true }, this.kind);
};

Anchor.key = 'anchor';
Anchor.type = 'popup';
Anchor.component = function (node) {
	return domUtils.isAnchor(node) && node.hasAttribute('id') && node.hasAttribute('data-se-anchor') ? node : null;
};
Anchor.className = '';
Anchor.prototype = {
	/**
	 * @override popup
	 */
	show() {
		this.controller.open((this._range = this.selection.getRange()));
		_w.setTimeout(() => {
			this.inputEl.focus();
		}, 0);
	},

	/**
	 * @override component
	 * @param {Element} target Target element
	 */
	select(target) {
		this._element = target;
		this.displayId.textContent = target.getAttribute('id');
		this.controllerSelect.open(target);
	},

	/**
	 * @override component
	 */
	deselect() {
		this.init();
	},

	/**
	 * @override controller
	 * @param {Element} target Target button element
	 * @returns
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		if (!command) return;

		switch (command) {
			case 'submit': {
				if (!this._element) {
					const id = this.inputEl.value.trim();
					if (!id) {
						this.inputEl.focus();
						return;
					}

					const a = domUtils.createElement('A', {
						id,
						'data-se-anchor': this.inputEl.value,
						'data-se-non-link': 'true',
						contenteditable: 'false',
						class: 'se-component se-inline-component'
					});

					this.component.insert(a, { skipCharCount: false, skipSelection: true, skipHistory: false });

					const r = this.selection.getNearRange(a);
					if (r) {
						this.selection.setRange(r.container, r.offset, r.container, r.offset);
					} else {
						this.component.select(a, Anchor.key, false);
					}
					this.init();
				} else {
					this._element.id = this.inputEl.value;
					this.select(this._element);
				}
				break;
			}
			case 'cancel': {
				this.controller.close(!this._element);
				if (this._range) {
					this.selection.setRange(this._range);
				}
				break;
			}
			case 'edit': {
				this.inputEl.value = this.displayId.textContent;
				this.controller.open(this._element);
				break;
			}
			case 'delete': {
				const r = this.selection.getNearRange(this._element);

				domUtils.removeItem(this._element);
				this.controllerSelect.close(true);

				if (r) {
					this.selection.setRange(r.container, r.offset, r.container, r.offset);
				}

				break;
			}
		}
	},

	init() {
		this._element = null;
		this._range = null;
		this.inputEl.value = '';
		this.displayId.textContent = '';
	},

	constructor: Anchor
};

function CreateHTML_controller({ lang, icons }) {
	const html = /*html*/ `
		<div class="se-arrow se-arrow-up"></div>
		<form>
			<div class="se-controller-display">${lang.id}</div>
			<div class="se-btn-group se-form-group">
				<input type="text" required />
				<button type="submit" data-command="submit" class="se-btn se-tooltip se-btn-success">
					${icons.checked}
					<span class="se-tooltip-inner"><span class="se-tooltip-text">${lang.save}</span></span>
				</button>
				<button type="button" data-command="cancel" class="se-btn se-tooltip se-btn-danger">
					${icons.cancel}
					<span class="se-tooltip-inner"><span class="se-tooltip-text">${lang.cancel}</span></span>
				</button>
			</div>
		</form>
		`;

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-simple-input' }, html);
}

function CreateHTML_controller_select({ lang, icons }) {
	const html = /*html*/ `
	<div class="se-arrow se-arrow-up"></div>
	<div class="link-content">
		<div class="se-controller-display"></div>
		<div class="se-btn-group">
			<button type="button" data-command="edit" tabindex="-1" class="se-btn se-tooltip">
				${icons.edit}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${lang.edit}</span>
				</span>
			</button>
			<button type="button" data-command="delete" tabindex="-1" class="se-btn se-tooltip">
				${icons.delete}
				<span class="se-tooltip-inner">
					<span class="se-tooltip-text">${lang.remove}</span>
				</span>
			</button>
		</div>
	</div>`;

	return domUtils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
}

export default Anchor;
