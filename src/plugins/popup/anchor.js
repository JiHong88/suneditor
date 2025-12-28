import { PluginPopup } from '../../interfaces';
import { Controller } from '../../modules/contract';
import { dom, env } from '../../helper';

const { _w } = env;

/**
 * @class
 * @description Anchor plugin
 * - Allows you to create, edit, and delete elements that act as anchors (bookmarks) within a document.
 */
class Anchor extends PluginPopup {
	static key = 'anchor';
	static className = '';
	/**
	 * @this {Anchor}
	 * @param {HTMLElement} node - The node to check.
	 * @returns {HTMLElement|null} Returns a node if the node is a valid component.
	 */
	static component(node) {
		return dom.check.isAnchor(node) && node.hasAttribute('id') && node.hasAttribute('data-se-anchor') ? node : null;
	}

	#element = null;
	#range = null;

	/**
	 * @constructor
	 * @param {SunEditor.Core} editor - The root editor instance
	 */
	constructor(editor) {
		super(editor);
		// plugin basic properties
		this.title = this.lang.anchor;
		this.icon = 'bookmark_anchor';

		// members
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(this.icons.bookmark_anchor, 'image/svg+xml');
		this.bookmarkIcon = svgDoc.documentElement;

		// controller
		const controllerSelectEl = CreateHTML_controller_select(this);
		this.displayId = controllerSelectEl.querySelector('.se-controller-display');
		this.controllerSelect = new Controller(this, controllerSelectEl, { position: 'bottom', disabled: true }, Anchor.key);

		const controllerEl = CreateHTML_controller(this);
		this.inputEl = controllerEl.querySelector('input');
		this.controller = new Controller(this, controllerEl, { position: 'bottom', disabled: true, parents: [this.controllerSelect.form], parentsHide: true }, Anchor.key);
	}

	/**
	 * @override
	 * @type {PluginPopup['show']}
	 */
	show() {
		this.controller.open((this.#range = this.selection.getRange()));
		_w.setTimeout(() => {
			this.inputEl.focus();
		}, 0);
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Select}
	 */
	componentSelect(target) {
		this.#element = target;
		this.displayId.textContent = target.getAttribute('id');
		this.controllerSelect.open(target);
	}

	/**
	 * @hook Editor.Component
	 * @type {SunEditor.Hook.Component.Deselect}
	 */
	componentDeselect() {
		this.#init();
	}

	/**
	 * @hook Modules.Controller
	 * @type {SunEditor.Hook.Controller.Action}
	 */
	controllerAction(target) {
		const command = target.getAttribute('data-command');
		if (!command) return;
		const currentElement = this.#element;

		switch (command) {
			case 'submit': {
				this.controller.close();

				if (!currentElement) {
					const id = this.inputEl.value.trim();
					if (!id) {
						this.inputEl.focus();
						return;
					}

					const a = dom.utils.createElement('A', {
						id,
						'data-se-anchor': this.inputEl.value,
						'data-se-non-link': 'true',
						contenteditable: 'false',
						class: 'se-component se-inline-component',
					});

					this.component.insert(a, { insertBehavior: 'none', scrollTo: false });

					const r = this.selection.getNearRange(a);
					if (r) {
						this.selection.setRange(r.container, r.offset, r.container, r.offset);
					} else {
						this.component.select(a, Anchor.key);
					}

					this.#init();
				} else {
					currentElement.id = this.inputEl.value;
					this.component.select(currentElement, Anchor.key);
				}

				break;
			}
			case 'cancel': {
				this.controller.close(!currentElement);
				if (this.#range) {
					this.selection.setRange(this.#range);
				}

				this.#init();
				if (currentElement) {
					this.componentSelect(currentElement);
				}

				break;
			}
			case 'edit': {
				this.inputEl.value = this.displayId.textContent;
				this.controllerSelect.hide();
				this.controller.open(currentElement);
				this.inputEl.focus();

				break;
			}
			case 'delete': {
				const r = this.selection.getNearRange(currentElement);

				dom.utils.removeItem(currentElement);
				this.controllerSelect.close(true);

				if (r) {
					this.selection.setRange(r.container, r.offset, r.container, r.offset);
				}

				this.#init();

				break;
			}
		}
	}

	/**
	 * @description Initializes state variables.
	 * - called when the popup is closed
	 */
	#init() {
		this.#element = null;
		this.#range = null;
		this.inputEl.value = '';
		this.displayId.textContent = '';
	}
}

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

	return dom.utils.createElement('DIV', { class: 'se-controller se-controller-simple-input' }, html);
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

	return dom.utils.createElement('DIV', { class: 'se-controller se-controller-link' }, html);
}

export default Anchor;
