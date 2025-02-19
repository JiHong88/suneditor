export {};
import { NodeListOf, ChildNode, ScrollIntoViewOptions, FocusOptions } from 'dom';

declare global {
	interface Window {
		getComputedStyle(element: Node, pseudoElt?: string): CSSStyleDeclaration;
		mimeType?: string;
		StyleMedia?: boolean;
	}

	interface ShadowRoot {
		getSelection(): Selection;
		getComposedRanges(): Selection;
	}

	// --- Comprehensive Node interface for web editor development.
	interface Node {
		// Basic properties
		length: number;
		innerText: string;
		data: string;
		tagName: string;
		id: string;
		name: string;

		// HTML-specific properties
		innerHTML: string;
		outerHTML: string;
		className: string;
		classList: DOMTokenList;
		disabled: boolean;
		value: string;
		style: CSSStyleDeclaration;
		children: HTMLCollection;
		checked: boolean;
		download: string;
		href: string;
		src: string;
		target: string;
		title: string;
		rel: string;

		// Navigation
		nextElementSibling: Element | null;
		previousElementSibling: Element | null;
		firstElementChild: Element | null;
		lastElementChild: Element | null;

		// Attribute management
		attributes: NamedNodeMap;
		getAttribute(name: string): string | null;
		setAttribute(name: string, value: string | number): void;
		hasAttribute(name: string): boolean;
		removeAttribute(name: string): void;

		// Node manipulation methods
		querySelector<T extends Element = Element>(selectors: string): T | null;
		querySelectorAll<T extends Element = Element>(selectors: string): NodeListOf<T>;

		// Text node methods
		substringData(offset: number, count: number): string;
		splitText(index: number): Node;
		splice<T>(start: number, deleteCount: number, ...items: T[]): T[];

		// Dimension properties (for HTMLElement)
		offsetTop: number;
		offsetLeft: number;
		offsetWidth: number;
		offsetHeight: number;
		naturalWidth: number;
		naturalHeight: number;
		scrollTop: number;
		scrollLeft: number;
		scrollWidth: number;
		scrollHeight: number;
		clientTop: number;
		clientLeft: number;
		clientHeight: number;
		clientWidth: number;
		offsetParent: Node | null;
		width: number | string;
		height: number | string;
		getBoundingClientRect(): DOMRect;
		scrollIntoView(arg?: boolean | ScrollIntoViewOptions): void;
		focus(options?: FocusOptions, debug?: boolean): void;
	}
	/**
	 * Element interface extending Node.
	 */
	interface Element {
		// HTML-specific properties (optional)
		innerHTML: string;
		className: string;
		classList: DOMTokenList;
		children: HTMLCollection;

		// Navigation specific to Element
		nextElementSibling: Element | null;
		previousElementSibling: Element | null;
		firstElementChild: Element | null;
		lastElementChild: Element | null;

		// Attribute management
		attributes: NamedNodeMap;
		getAttribute(name: string): string | null;
		setAttribute(name: string, value: string | number): void;
		hasAttribute(name: string): boolean;
		removeAttribute(name: string): void;
		click(): void;
	}

	interface Text extends Node {
		substringData(offset: number, count: number): string;
		splitText(index: number): Text;
	}

	interface RegExp {
		test(str: string | number): boolean;
	}

	interface Element extends ChildNode {}
	interface HTMLElement extends ChildNode {}
}
