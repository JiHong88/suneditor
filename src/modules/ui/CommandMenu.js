import { dom, env } from '../../helper';
import SelectMenu from './SelectMenu.js';

const { _w } = env;

/**
 * @description Resolve an icon spec to an HTML string. Accepts a key from `$.icons`,
 * a raw HTML snippet (anything starting with `<`), or empty.
 * @param {string} icon
 * @param {Object} icons
 * @returns {string}
 */
export function resolveIconHTML(icon, icons) {
	if (!icon || typeof icon !== 'string') return '';
	if (icon.charAt(0) === '<') return icon;
	return icons[icon] || '';
}

/**
 * @description Build the canonical command-menu row HTML. Single source of truth for the
 * BlockHandle action menu and the SlashCommand menu, so they look identical.
 * @param {string} label
 * @param {string} iconHTML
 * @returns {string}
 */
export function buildRowHTML(label, iconHTML) {
	const inner = iconHTML
		? `<span class="se-block-menu-icon">${iconHTML}</span><span class="se-block-menu-label">${label}</span>`
		: `<span class="se-block-menu-label se-block-menu-label-full">${label}</span>`;
	return `<button type="button" class="se-cmd-row">${inner}</button>`;
}

/**
 * @typedef {Object} CommandMenuItem
 * @property {string} [key] - Optional identifier.
 * @property {string} title - Display label.
 * @property {string} [icon] - `$.icons` key or raw HTML snippet.
 * @property {string[]} [keywords] - Extra search terms (used by the filter).
 * @property {function(SunEditor.Deps, *): void | Promise<void>} action - Custom callback. The second
 *   argument is the host-supplied context (e.g. `{block}` for BlockHandle, `{triggerChar, query}` for SlashCommand).
 */

/**
 * @typedef {Object} SubmenuChild
 * @property {string} pluginName - Owning plugin key.
 * @property {HTMLElement} element - The original toolbar dropdown button element. Passed to `plugin.action(element)` on click.
 */

/**
 * @typedef {Object} ResolvedItem
 * @property {'custom'|'plugin'|'submenu'|'dropdownFree'} kind
 * @property {string} title
 * @property {string} iconHTML
 * @property {string} search   - Lower-cased haystack for substring filtering.
 * @property {CommandMenuItem} [raw]
 * @property {string} [name]   - Plugin key.
 * @property {string} [type]   - Plugin type (`'modal'`, `'command'`, etc.).
 * @property {string} [command]
 * @property {SubmenuChild[]} [children]   - For `kind: 'submenu'` — clickable child rows (one per dropdown item).
 * @property {string[]} [childMenus]       - For `kind: 'submenu'` — HTML for each child row.
 */

/**
 * @typedef {Object} CommandMenuParams
 * @property {Array<string | CommandMenuItem>} items - Raw menu entries.
 * @property {function(string, Object, *, Object, Object): ({title: string, icon: string, type: string, command: string} | null)} resolveButton
 *   Caller-provided plugin/button resolver. Inject `ResolveButton` from `core/section/constructor`.
 *   Injected (not imported) because this module lives under `src/modules/` and cannot import from `src/core/*`.
 * @property {Object} selectMenuParams - Base SelectMenu params (`position`, `minWidth`, `keydownTarget`, etc.).
 * @property {function(CommandMenuItem, { icons: Object }): string} [renderCustomItem] - Optional renderer
 *   applied to custom (object) items only. Plugin-string items always render with `buildRowHTML`.
 */

/**
 * @class
 * @description Shared command-menu module used by BlockHandle and SlashCommand.
 * - Owns the underlying `SelectMenu`, renders rows with the canonical BlockHandle row HTML.
 * - Supports four item kinds:
 *   - `'custom'` — user-defined `{title, icon?, action}` invoked with `($, hostContext)`.
 *   - `'plugin'` — plain plugin (modal/browser/command/popup) dispatched via `plugin.open/show/action`.
 *   - `'submenu'` — dropdown plugin auto-expanded inline (children come from `$.menu.itemsMap`).
 *   - `'dropdownFree'` — dropdown-free plugin (e.g. `fontColor`, `table`) shown with a submenu arrow
 *     and an attached hover flyout that reuses the plugin's toolbar dropdown DOM.
 * - Handles blur prevention on mousedown, hover flyout lifecycle, and click-to-toggle for dropdown-free.
 *
 * Host responsibilities (kept outside this module):
 * - Pre-dispatch side effects (BlockHandle: `expandRangeToFullLines`; SlashCommand: delete trigger text).
 * - Anchor element selection (BlockHandle anchors to the drag button; SlashCommand to a Controller wrapper).
 * - Context object for custom-item actions.
 */
class CommandMenu {
	#$;
	#resolveButton;
	#rawItems;
	#resolved = null;
	#renderCustomItem;

	/** @type {Map<number, { name: string, plugin: any, li: HTMLElement }>} */
	#freeMap = new Map();
	/** @type {?{ dropdown: HTMLElement, plugin: any, originalParent: ?Node, anchorLi: HTMLElement, evClick: ?SunEditor.Event.Info }} */
	#flyoutState = null;

	/**
	 * @type {Array<{ name: string, idx: number }>}
	 */
	#pendingTargets = [];

	/**
	 * @type {Array<{ name: string, target: HTMLElement }>}
	 */
	#registered = [];

	/** @type {SelectMenu} */
	selectMenu;

	/**
	 * @constructor
	 * @param {*} _host - Reserved for future host-aware behavior (kept for API symmetry with `Modal`/`Controller`).
	 * @param {SunEditor.Deps} $ - Deps bag.
	 * @param {CommandMenuParams} params
	 */
	constructor(_host, $, params) {
		this.#$ = $;
		this.#resolveButton = params.resolveButton;
		this.#rawItems = Array.isArray(params.items) ? params.items : [];
		this.#renderCustomItem = typeof params.renderCustomItem === 'function' ? params.renderCustomItem : null;

		// Wrap the host's closeMethod so the flyout is always torn down with the menu.
		const userClose = params.selectMenuParams?.closeMethod;
		this.selectMenu = new SelectMenu($, {
			...params.selectMenuParams,
			closeMethod: () => {
				this.#closeFlyout();
				this.#unregisterAll();
				userClose?.();
			},
			subEscMethod: () => {
				if (!this.#flyoutState) return false;
				const anchorLi = this.#flyoutState.anchorLi;
				this.#closeFlyout();
				const idx = anchorLi ? Number(anchorLi.getAttribute('data-index')) : NaN;
				if (!Number.isNaN(idx)) this.selectMenu.setItem(idx);
				return true;
			},
		});
	}

	/**
	 * @description Bind the menu to a reference element and register the click handler.
	 * @param {HTMLElement} referElement
	 * @param {(item: ResolvedItem|null) => void} onSelect - Called with the resolved item picked by the user.
	 *   Hosts run their pre-dispatch hook here (delete trigger, etc.) and then call `dispatch(item, ctx)`.
	 * @param {{ class?: string, style?: string }} [attr]
	 */
	attach(referElement, onSelect, attr = {}) {
		this.selectMenu.on(referElement, /** @type {*} */ (onSelect), attr);

		this.#$.eventManager.addEvent(this.selectMenu.form, 'mousedown', (e) => {
			if (env.isMobile) {
				this.#$.store.set('_preventBlur', true);
			} else {
				e.preventDefault();
			}
		});

		this.#$.eventManager.addEvent(this.selectMenu.form, 'mousemove', this.#onMenuMouseMove.bind(this));
	}

	/**
	 * @description Replace the items list (e.g. when host options change). Invalidates the resolved cache.
	 * @param {Array<string | CommandMenuItem>} items
	 */
	setItems(items) {
		this.#rawItems = Array.isArray(items) ? items : [];
		this.#resolved = null;
	}

	/**
	 * @description Lazily normalize raw items. Lazy because plugin instances (`$.plugins`) may not
	 * be available during the host's constructor.
	 * @returns {ResolvedItem[]}
	 */
	getItems() {
		if (this.#resolved) return this.#resolved;
		/** @type {ResolvedItem[]} */
		const out = [];
		for (const entry of this.#rawItems) {
			if (typeof entry === 'string') {
				const r = this.#resolveButton(entry, this.#$.plugins, this.#$.options, this.#$.icons, this.#$.lang);
				if (!r) continue;

				const type = r.type || '';

				// Dropdown-free
				if (/dropdown-free/.test(type)) {
					out.push({
						kind: 'dropdownFree',
						title: r.title,
						iconHTML: r.icon || '',
						search: (r.title + ' ' + entry).toLowerCase(),
						name: entry,
						type,
					});
					continue;
				}

				// Dropdown
				if (/dropdown/.test(type)) {
					const menuItems = this.#$.menu?.itemsMap?.[entry] || [];
					if (menuItems.length > 0) {
						out.push({
							kind: 'submenu',
							title: r.title,
							iconHTML: r.icon || '',
							search: (r.title + ' ' + entry).toLowerCase(),
							name: entry,
							children: menuItems.map((mi) => ({ pluginName: entry, element: mi._element })),
							childMenus: menuItems.map((mi) => {
								const iconEl =
									mi._element?.querySelector('.se-list-icon') || mi._element?.querySelector('svg');
								const icon = iconEl ? iconEl.outerHTML : '';
								const label = icon ? `${icon}<span>${mi.title}</span>` : mi.title;
								return `<span class="se-block-submenu-item">${label}</span>`;
							}),
						});
						continue;
					}
				}

				out.push({
					kind: 'plugin',
					title: r.title,
					iconHTML: r.icon || '',
					search: (r.title + ' ' + entry).toLowerCase(),
					name: entry,
					type,
					command: r.command,
				});
			} else if (entry && typeof entry === 'object' && typeof entry.action === 'function') {
				const title = entry.title || entry.key || '';
				const keywords = Array.isArray(entry.keywords) ? entry.keywords.join(' ') : '';
				out.push({
					kind: 'custom',
					title,
					iconHTML: resolveIconHTML(entry.icon, this.#$.icons),
					search: (title + ' ' + keywords).toLowerCase(),
					raw: entry,
				});
			}
		}
		this.#resolved = out;
		return out;
	}

	/**
	 * @description Case-insensitive substring filter on `title + keywords + plugin name`.
	 * Empty query returns all items (up to `limit`).
	 * @param {string} query
	 * @param {number} [limit=Infinity]
	 * @returns {ResolvedItem[]}
	 */
	filter(query, limit = Infinity) {
		const items = this.getItems();
		const q = (query || '').toLowerCase().trim();
		const out = [];
		for (const it of items) {
			if (!q || it.search.indexOf(q) !== -1) out.push(it);
			if (out.length >= limit) break;
		}
		return out;
	}

	/**
	 * @description Build row HTML for a list of resolved items.
	 * @param {ResolvedItem[]} items
	 * @returns {string[]}
	 */
	renderRows(items) {
		const ctx = { icons: this.#$.icons };
		const arrow = `<span class="se-submenu-arrow">${this.#$.icons.menu_arrow_right}</span>`;
		return items.map((it) => {
			if (it.kind === 'custom' && this.#renderCustomItem) return this.#renderCustomItem(it.raw, ctx);
			const row = buildRowHTML(it.title, it.iconHTML);
			return it.kind === 'dropdownFree' ? row + arrow : row;
		});
	}

	/**
	 * @description Populate the SelectMenu rows.
	 * @param {ResolvedItem[]} items
	 */
	createRows(items) {
		// SlashCommand rebuilds rows on every keystroke; previous `li`s become detached. Drop their
		// registrations before the SelectMenu rewrite so toolbar map never points at orphaned nodes.
		this.#unregisterAll();

		const selectItems = items.map((it) =>
			it.kind === 'submenu' ? { children: it.children, childMenus: it.childMenus } : it,
		);
		this.selectMenu.create(selectItems, this.renderRows(items));

		this.#freeMap.clear();
		this.#pendingTargets.length = 0;
		items.forEach((it, i) => {
			if (it.kind === 'dropdownFree') {
				this.#freeMap.set(i, {
					name: it.name,
					plugin: this.#$.plugins[it.name],
					li: this.selectMenu.menus[i],
				});
			}
			if (it.kind === 'plugin' || it.kind === 'dropdownFree') {
				this.#pendingTargets.push({ name: it.name, idx: i });
			}
		});

		// SlashCommand stays "open" across createRows calls — re-register immediately so the freshly
		// built `li` set takes over from the discarded one without waiting for the next open().
		if (this.selectMenu.isOpen) this.#registerAll();
	}

	/**
	 * @description Open the SelectMenu. Lazily (re-)registers menu rows into
	 * `commandDispatcher.targets` so `selectionState.update` paints the `active` class on them through
	 * @param {string} [position]
	 */
	open(position) {
		this.selectMenu.open(position);
		if (this.#registered.length === 0) this.#registerAll();
	}

	/**
	 * @description Close the SelectMenu. Also unregisters menu rows from `commandDispatcher.targets`
	 */
	close() {
		this.#unregisterAll();
		this.selectMenu.close();
	}

	/**
	 * @description Whether a sub-panel (native submenu or dropdown-free flyout) is currently open.
	 * Lets an owning Controller keep the menu open on ESC and close only the sub-panel.
	 * @returns {boolean}
	 */
	hasOpenSubPanel() {
		return this.selectMenu.hasOpenSubmenu() || !!this.#flyoutState;
	}

	/**
	 * @description Push every `#pendingTargets` row's inner `<button>` into the toolbar target map
	 */
	#registerAll() {
		const cd = this.#$.commandDispatcher;
		for (const { name, idx } of this.#pendingTargets) {
			const btn = this.#resolveButtonTarget(idx);
			if (!btn) continue;
			cd.registerTargets(name, btn);
			this.#registered.push({ name, target: btn });
		}
		// Bust the dedup cache so applyTagEffect re-runs even when the selection node is unchanged.
		this.#$.store.set('_lastSelectionNode', null);
		this.#$.eventManager.applyTagEffect();
	}

	/**
	 * @description Drop every `(cmd, target)` pair this instance registered. Safe to call repeatedly.
	 */
	#unregisterAll() {
		if (this.#registered.length === 0) return;
		const cd = this.#$.commandDispatcher;
		for (const { name, target } of this.#registered) cd.unregisterTargets(name, target);
		this.#registered.length = 0;
	}

	/**
	 * @description Resolve the registration target for menu index `idx`.
	 * (defensive — should always exist after {@link buildRowHTML}).
	 * @param {number} idx
	 * @returns {?HTMLButtonElement}
	 */
	#resolveButtonTarget(idx) {
		const li = this.selectMenu.menus[idx];
		if (!li) return null;
		return /** @type {?HTMLButtonElement} */ (li.querySelector('button.se-cmd-row') || li);
	}

	/**
	 * @description Highlight a row.
	 * @param {number} index
	 */
	setItem(index) {
		this.selectMenu.setItem(index);
	}

	/**
	 * @description Soft-hide / soft-show without changing open state. Pass-through.
	 * @param {boolean} hidden
	 */
	setHidden(hidden) {
		this.selectMenu.setHidden(hidden);
	}

	get isOpen() {
		return this.selectMenu.isOpen;
	}

	/**
	 * @description Dispatch a resolved item. For custom items, calls `raw.action($, ctx)`. For plugin
	 * items, routes to `plugin.open/show/action` or `commandDispatcher.run` (built-ins). For dropdown-free
	 * items, toggles the hover flyout
	 * @param {ResolvedItem | SubmenuChild | null} item
	 * @param {*} [ctx] - Context passed to custom-item `action` (host-specific shape).
	 * @returns {boolean} `true` if a plugin was dispatched
	 */
	dispatch(item, ctx) {
		if (!item) return false;
		const asChild = /** @type {SubmenuChild} */ (/** @type {unknown} */ (item));
		if (asChild.pluginName && asChild.element) {
			const plugin = this.#$.plugins[asChild.pluginName];
			plugin?.action?.(asChild.element);
			this.#$.history.push(false);
			return true;
		}
		const resolved = /** @type {ResolvedItem} */ (item);
		if (resolved.kind === 'custom') {
			try {
				resolved.raw.action(this.#$, ctx);
			} catch (e) {
				console.error('[SUNEDITOR.commandMenu.customAction]', e);
			}
			return false;
		}
		if (resolved.kind === 'dropdownFree') {
			const plugin = this.#$.plugins[resolved.name];
			if (!plugin) return false;
			if (this.#flyoutState?.plugin === plugin) {
				this.#closeFlyout();
				return false;
			}
			const idx = this.selectMenu.items.indexOf(/** @type {*} */ (resolved));
			const anchorLi = idx >= 0 ? this.selectMenu.menus[idx] : null;
			if (anchorLi) this.#openFlyout(resolved.name, plugin, anchorLi);
			return false;
		}
		const plugin = resolved.name ? this.#$.plugins[resolved.name] : null;
		if (plugin) {
			const type = resolved.type || '';
			if (/modal/.test(type)) plugin.open?.();
			else if (/browser/.test(type)) plugin.open?.(null);
			else if (/popup/.test(type)) plugin.show?.();
			else plugin.action?.(dom.utils.createElement('BUTTON', { type: 'button', 'data-command': resolved.name }));
			this.#$.history.push(false);
			return true;
		}
		if (resolved.command) {
			this.#$.commandDispatcher.run(resolved.command, null, null);
		}
		return false;
	}

	/**
	 * @description Mousemove handler on the menu form. For dropdown-free rows.
	 * @param {MouseEvent} e
	 */
	#onMenuMouseMove(e) {
		if (this.#freeMap.size === 0) return;
		const target = /** @type {HTMLElement} */ (e.target);
		if (this.#flyoutState?.dropdown?.contains(target)) return;

		const li = target.closest?.('li[data-index]');
		if (!li) return;

		const idx = Number(li.getAttribute('data-index'));
		const free = this.#freeMap.get(idx);
		if (free) {
			if (this.#flyoutState?.plugin !== free.plugin) {
				this.#openFlyout(free.name, free.plugin, free.li);
			}
		} else if (this.#flyoutState) {
			this.#closeFlyout();
		}
	}

	/**
	 * @description Open a dropdown-free plugin's flyout.
	 * @param {string} name
	 * @param {*} plugin
	 * @param {HTMLElement} anchorLi
	 */
	#openFlyout(name, plugin, anchorLi) {
		if (this.#flyoutState) this.#closeFlyout();
		const dropdown = this.#$.menu?.targetMap?.[name];
		if (!dropdown || !this.selectMenu.form) return;

		const originalParent = dropdown.parentNode;
		this.selectMenu.form.appendChild(dropdown);
		this.#positionFlyout(dropdown, anchorLi, this.selectMenu.form);

		dom.utils.addClass(anchorLi, 'se-submenu-open');
		plugin.on?.(anchorLi);

		// Clicking inside the flyout's dropdown should dismiss both the flyout and the parent menu —
		// matches the toolbar behavior where a click commits the selection.
		const evClick = this.#$.eventManager.addEvent(dropdown, 'click', () =>
			_w.setTimeout(() => {
				this.#closeFlyout();
				this.selectMenu.close();
			}, 0),
		);

		this.#flyoutState = { dropdown, plugin, originalParent, anchorLi, evClick };
	}

	/**
	 * @description Close the open flyout (if any). Restores the dropdown DOM to its original parent
	 * (the menuTray) so the toolbar can use it again.
	 */
	#closeFlyout() {
		const s = this.#flyoutState;
		if (!s) return;
		this.#flyoutState = null;

		this.#$?.eventManager.removeEvent(s.evClick);
		s.dropdown.style.cssText = '';
		s.dropdown.style.display = 'none';

		if (s.anchorLi) dom.utils.removeClass(s.anchorLi, 'se-submenu-open');

		if (s.originalParent && s.originalParent !== s.dropdown.parentNode) {
			s.originalParent.appendChild(s.dropdown);
		}

		s.plugin?.off?.();
	}

	/**
	 * @description Place `el` next to `anchor`, coordinates relative to `container`. Mirrors
	 * `SelectMenu.#openSubmenu`: prefers the text-direction side, flips on overflow, shifts on
	 * double overflow.
	 * @param {HTMLElement} el
	 * @param {HTMLElement} anchor
	 * @param {HTMLElement} container
	 */
	#positionFlyout(el, anchor, container) {
		const a = anchor.getBoundingClientRect();
		const c = container.getBoundingClientRect();
		const isRtl = !!this.#$.options.get('_rtl');

		el.style.position = 'absolute';
		el.style.right = '';
		el.style.visibility = 'hidden';
		el.style.display = 'block';

		const elW = el.offsetWidth;
		const elH = el.offsetHeight;
		const vpW = _w.innerWidth;
		const vpH = _w.innerHeight;
		const gap = 4;

		// Horizontal: preferred side follows text direction. Flip if it overflows; if both overflow,
		// keep the smaller-overflow side and shift inward by the missing amount.
		const rightVP = a.right + gap;
		const leftVP = a.left - elW - gap;
		const rightOverflow = Math.max(0, rightVP + elW - vpW);
		const leftOverflow = Math.max(0, -leftVP);
		const prefer = isRtl ? 'left' : 'right';
		let leftPx;
		if (prefer === 'right') {
			if (rightOverflow === 0) leftPx = rightVP;
			else if (leftOverflow === 0) leftPx = leftVP;
			else if (rightOverflow <= leftOverflow) leftPx = rightVP - rightOverflow;
			else leftPx = leftVP + leftOverflow;
		} else {
			if (leftOverflow === 0) leftPx = leftVP;
			else if (rightOverflow === 0) leftPx = rightVP;
			else if (leftOverflow <= rightOverflow) leftPx = leftVP + leftOverflow;
			else leftPx = rightVP - rightOverflow;
		}
		el.style.left = leftPx - c.left + 'px';

		// Vertical: top-aligned with anchor, flip on overflow.
		const topVP = a.top;
		const bottomVP = a.bottom - elH;
		const downOverflow = Math.max(0, topVP + elH - vpH);
		const upOverflow = Math.max(0, -bottomVP);
		let topPx;
		if (downOverflow === 0) topPx = topVP;
		else if (upOverflow === 0) topPx = bottomVP;
		else if (downOverflow <= upOverflow) topPx = topVP - downOverflow;
		else topPx = bottomVP + upOverflow;
		el.style.top = topPx - c.top + 'px';

		el.style.visibility = '';
	}
}

export default CommandMenu;
