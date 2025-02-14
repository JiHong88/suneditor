export {};
import { NodeListOf } from 'dom';

declare global {
	// Comprehensive Node interface for web editor development.
	interface Node {
		// Basic properties
		length: number;
		innerText: string;
		data: string;

		// HTML-specific properties (optional)
		innerHTML?: string;
		className?: string;
		classList?: DOMTokenList;
		disabled?: boolean;
		value?: string;
		style?: CSSStyleDeclaration;
		children?: HTMLCollection;

		// Navigation
		nextElementSibling?: Node | null;
		previousElementSibling?: Node | null;
		nextSibling?: Node | null;
		previousSibling?: Node | null;
		firstElementChild?: Node | null;
		lastElementChild?: Node | null;

		// Attribute management
		attributes?: NamedNodeMap;
		getAttribute?(name: string): string | null;
		setAttribute?(name: string, value: string): void;
		hasAttribute?(name: string): boolean;
		removeAttribute?(name: string): void;

		// Node manipulation methods
		appendChild?(node: Node): Node;
		replaceChild?(newChild: Node, oldChild: Node): Node;
		insertBefore?(newNode: Node, referenceNode: Node | null): Node;
		querySelector<T extends Node = Node>(selectors: string): T | null;
		querySelectorAll<T extends Node = Node>(selectors: string): NodeListOf<T>;

		// Text node methods
		substringData?(offset: number, count: number): string;
		splitText?(index: number): Node;
		splice<T>(start: number, deleteCount?: number, ...items: T[]): T[];

		// Dimension properties (for HTMLElement)
		offsetWidth?: number;
		offsetHeight?: number;
	}
	/**
	 * Element interface extending Node.
	 * HTML 전용 속성과 요소 네비게이션, 그리고 속성(attribute) 관리 기능을 포함합니다.
	 */
	interface Element extends Node {
		// HTML-specific properties (optional)
		innerHTML?: string;
		className?: string;
		classList?: DOMTokenList;
		children?: HTMLCollection;

		// Navigation specific to Element (요소 간 네비게이션, 반환타입은 Element)
		nextElementSibling?: Element | null;
		previousElementSibling?: Element | null;
		firstElementChild?: Element | null;
		lastElementChild?: Element | null;

		// Attribute management (속성(attribute) 관리)
		attributes?: NamedNodeMap;
		getAttribute(name: string): string | null;
		setAttribute(name: string, value: string): void;
		hasAttribute(name: string): boolean;
		removeAttribute(name: string): void;
	}

	/**
	 * HTMLElement interface extending Element.
	 * HTML 요소(실제 화면에 표시되는 요소) 전용 속성을 포함합니다.
	 */
	interface HTMLElement extends Element {
		disabled?: boolean;
		value?: string;
		style?: CSSStyleDeclaration;
		offsetWidth?: number;
		offsetHeight?: number;
	}

	/**
	 * Text interface extending Node.
	 * 텍스트 노드 전용 메서드를 포함합니다.
	 */
	interface Text extends Node {
		substringData(offset: number, count: number): string;
		splitText(index: number): Text;
	}

	/**
	 * Extended RegExp interface.
	 */
	interface RegExp {
		test(str: string | number): boolean;
	}
}
