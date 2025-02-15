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

		// HTML-specific properties
		innerHTML: string;
		outerHTML: string;
		className: string;
		classList: DOMTokenList;
		disabled: boolean;
		value: string;
		style: CSSStyleDeclaration;
		children: HTMLCollection;

		// Navigation
		nextElementSibling: Element | null;
		previousElementSibling: Element | null;
		firstElementChild: Element | null;
		lastElementChild: Element | null;

		// Attribute management
		attributes: NamedNodeMap;
		getAttribute(name: string): string | null;
		setAttribute(name: string, value: string): void;
		hasAttribute(name: string): boolean;
		removeAttribute(name: string): void;

		// Node manipulation methods
		querySelector<T extends Node = Node>(selectors: string): T | null;
		querySelectorAll<T extends Node = Node>(selectors: string): NodeListOf<T>;

		// Text node methods
		substringData(offset: number, count: number): string;
		splitText(index: number): Node;
		splice<T>(start: number, deleteCount: number, ...items: T[]): T[];

		// Dimension properties (for HTMLElement)
		offsetTop: number;
		offsetLeft: number;
		offsetWidth: number;
		offsetHeight: number;
		scrollTop: number;
		scrollLeft: number;
		scrollWidth: number;
		scrollHeight: number;
		clientTop: number;
		clientLeft: number;
		clientHeight: number;
		clientWidth: number;
		offsetParent: Node | null;
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

		// Navigation specific to Element (요소 간 네비게이션, 반환타입은 Element)
		nextElementSibling: Element | null;
		previousElementSibling: Element | null;
		firstElementChild: Element | null;
		lastElementChild: Element | null;

		// Attribute management (속성(attribute) 관리)
		attributes: NamedNodeMap;
		getAttribute(name: string): string | null;
		setAttribute(name: string, value: string): void;
		hasAttribute(name: string): boolean;
		removeAttribute(name: string): void;
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
