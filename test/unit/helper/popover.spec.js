import { hidePopoverIfOpen, isPopoverOpen, showPopoverUnlessOpen } from '../../../src/helper/dom/popover';

describe('popover open-state', () => {
	const originalMatches = Element.prototype.matches;

	afterEach(() => {
		Element.prototype.matches = originalMatches;
	});

	it('does not throw when :popover-open is not a valid selector', () => {
		Element.prototype.matches = function (selector) {
			if (String(selector).includes('popover-open')) {
				throw new DOMException("':popover-open' is not a valid selector.", 'SyntaxError');
			}
			return originalMatches.call(this, selector);
		};

		const el = document.createElement('div');
		el.showPopover = jest.fn();
		el.hidePopover = jest.fn(() => {
			throw new DOMException('not shown', 'InvalidStateError');
		});

		expect(isPopoverOpen(el)).toBe(false);
		expect(() => showPopoverUnlessOpen(el)).not.toThrow();
		expect(el.showPopover).toHaveBeenCalled();
		expect(() => hidePopoverIfOpen(el)).not.toThrow();
	});
});