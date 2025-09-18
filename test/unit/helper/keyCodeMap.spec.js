import { keyCodeMap } from '../../../src/helper';

describe('keyCodeMap helper', () => {
	describe('meta key checks', () => {
		describe('isShift', () => {
			it('should detect shift key from shiftKey property', () => {
				const event = { shiftKey: true, keyCode: 0 };
				expect(keyCodeMap.isShift(event)).toBe(true);
			});

			it('should detect shift key from keyCode 16', () => {
				const event = { shiftKey: false, keyCode: 16 };
				expect(keyCodeMap.isShift(event)).toBe(true);
			});

			it('should return false when shift key is not pressed', () => {
				const event = { shiftKey: false, keyCode: 65 };
				expect(keyCodeMap.isShift(event)).toBe(false);
			});
		});

		describe('isCtrl', () => {
			it('should detect ctrl key from ctrlKey property', () => {
				const event = { ctrlKey: true, metaKey: false, code: 'KeyA' };
				expect(keyCodeMap.isCtrl(event)).toBe(true);
			});

			it('should detect meta key from metaKey property', () => {
				const event = { ctrlKey: false, metaKey: true, code: 'KeyA' };
				expect(keyCodeMap.isCtrl(event)).toBe(true);
			});

			it('should detect meta keys from code property', () => {
				expect(keyCodeMap.isCtrl({ ctrlKey: false, metaKey: false, code: 'MetaLeft' })).toBe(true);
				expect(keyCodeMap.isCtrl({ ctrlKey: false, metaKey: false, code: 'MetaRight' })).toBe(true);
			});

			it('should return false when ctrl/meta keys are not pressed', () => {
				const event = { ctrlKey: false, metaKey: false, code: 'KeyA' };
				expect(keyCodeMap.isCtrl(event)).toBe(false);
			});
		});

		describe('isAlt', () => {
			it('should detect alt key from altKey property', () => {
				const event = { altKey: true };
				expect(keyCodeMap.isAlt(event)).toBe(true);
			});

			it('should return false when alt key is not pressed', () => {
				const event = { altKey: false };
				expect(keyCodeMap.isAlt(event)).toBe(false);
			});
		});

		describe('isComposing', () => {
			it('should detect composition from isComposing property', () => {
				const event = { isComposing: true };
				expect(keyCodeMap.isComposing(event)).toBe(true);
			});

			it('should detect composition from Process key', () => {
				const event = { isComposing: false, key: 'Process' };
				expect(keyCodeMap.isComposing(event)).toBe(true);
			});

			it('should detect composition from keyCode 229', () => {
				const event = { isComposing: false, key: 'a', keyCode: 229 };
				expect(keyCodeMap.isComposing(event)).toBe(true);
			});

			it('should return false when not composing', () => {
				const event = { isComposing: false, key: 'a', keyCode: 65 };
				expect(keyCodeMap.isComposing(event)).toBe(false);
			});
		});
	});

	describe('specific key checks', () => {
		describe('isBackspace', () => {
			it('should detect Backspace code', () => {
				expect(keyCodeMap.isBackspace('Backspace')).toBe(true);
			});

			it('should return false for other codes', () => {
				expect(keyCodeMap.isBackspace('Delete')).toBe(false);
				expect(keyCodeMap.isBackspace('Enter')).toBe(false);
			});
		});

		describe('isTab', () => {
			it('should detect Tab code', () => {
				expect(keyCodeMap.isTab('Tab')).toBe(true);
			});

			it('should return false for other codes', () => {
				expect(keyCodeMap.isTab('Space')).toBe(false);
				expect(keyCodeMap.isTab('Enter')).toBe(false);
			});
		});

		describe('isEnter', () => {
			it('should detect Enter code', () => {
				expect(keyCodeMap.isEnter('Enter')).toBe(true);
			});

			it('should return false for other codes', () => {
				expect(keyCodeMap.isEnter('Tab')).toBe(false);
				expect(keyCodeMap.isEnter('Space')).toBe(false);
			});
		});

		describe('isEsc', () => {
			it('should detect Escape code', () => {
				expect(keyCodeMap.isEsc('Escape')).toBe(true);
			});

			it('should return false for other codes', () => {
				expect(keyCodeMap.isEsc('Enter')).toBe(false);
				expect(keyCodeMap.isEsc('Tab')).toBe(false);
			});
		});

		describe('isSpace', () => {
			it('should detect Space code', () => {
				expect(keyCodeMap.isSpace('Space')).toBe(true);
			});

			it('should return false for other codes', () => {
				expect(keyCodeMap.isSpace('Tab')).toBe(false);
				expect(keyCodeMap.isSpace('Enter')).toBe(false);
			});
		});
	});

	describe('key group checks', () => {
		describe('isDirectionKey', () => {
			it('should detect arrow keys', () => {
				expect(keyCodeMap.isDirectionKey('ArrowLeft')).toBe(true);
				expect(keyCodeMap.isDirectionKey('ArrowUp')).toBe(true);
				expect(keyCodeMap.isDirectionKey('ArrowRight')).toBe(true);
				expect(keyCodeMap.isDirectionKey('ArrowDown')).toBe(true);
			});

			it('should return false for non-direction keys', () => {
				expect(keyCodeMap.isDirectionKey('Enter')).toBe(false);
				expect(keyCodeMap.isDirectionKey('Space')).toBe(false);
				expect(keyCodeMap.isDirectionKey('KeyA')).toBe(false);
			});
		});

		describe('isRemoveKey', () => {
			it('should detect delete and backspace keys', () => {
				expect(keyCodeMap.isRemoveKey('Backspace')).toBe(true);
				expect(keyCodeMap.isRemoveKey('Delete')).toBe(true);
			});

			it('should return false for other keys', () => {
				expect(keyCodeMap.isRemoveKey('Enter')).toBe(false);
				expect(keyCodeMap.isRemoveKey('KeyA')).toBe(false);
			});
		});

		describe('isNonTextKey', () => {
			it('should detect non-text keys', () => {
				expect(keyCodeMap.isNonTextKey('Backspace')).toBe(true);
				expect(keyCodeMap.isNonTextKey('Tab')).toBe(true);
				expect(keyCodeMap.isNonTextKey('Enter')).toBe(true);
				expect(keyCodeMap.isNonTextKey('Escape')).toBe(true);
				expect(keyCodeMap.isNonTextKey('ArrowLeft')).toBe(true);
				expect(keyCodeMap.isNonTextKey('F1')).toBe(true);
				expect(keyCodeMap.isNonTextKey('NumLock')).toBe(true);
			});

			it('should return false for text keys', () => {
				expect(keyCodeMap.isNonTextKey('KeyA')).toBe(false);
				expect(keyCodeMap.isNonTextKey('Digit1')).toBe(false);
				expect(keyCodeMap.isNonTextKey('Space')).toBe(false);
			});
		});

		describe('isHistoryRelevantKey', () => {
			it('should detect history relevant keys', () => {
				expect(keyCodeMap.isHistoryRelevantKey('Backspace')).toBe(true);
				expect(keyCodeMap.isHistoryRelevantKey('Enter')).toBe(true);
				expect(keyCodeMap.isHistoryRelevantKey('Delete')).toBe(true);
			});

			it('should return false for other keys', () => {
				expect(keyCodeMap.isHistoryRelevantKey('KeyA')).toBe(false);
				expect(keyCodeMap.isHistoryRelevantKey('ArrowLeft')).toBe(false);
			});
		});

		describe('isDocumentTypeObserverKey', () => {
			it('should detect document type observer keys', () => {
				expect(keyCodeMap.isDocumentTypeObserverKey('Backspace')).toBe(true);
				expect(keyCodeMap.isDocumentTypeObserverKey('Enter')).toBe(true);
				expect(keyCodeMap.isDocumentTypeObserverKey('Delete')).toBe(true);
			});

			it('should return false for other keys', () => {
				expect(keyCodeMap.isDocumentTypeObserverKey('KeyA')).toBe(false);
				expect(keyCodeMap.isDocumentTypeObserverKey('Tab')).toBe(false);
			});
		});

		describe('isNonResponseKey', () => {
			it('should detect non-response keys', () => {
				expect(keyCodeMap.isNonResponseKey('ControlLeft')).toBe(true);
				expect(keyCodeMap.isNonResponseKey('ControlRight')).toBe(true);
				expect(keyCodeMap.isNonResponseKey('AltLeft')).toBe(true);
				expect(keyCodeMap.isNonResponseKey('Escape')).toBe(true);
				expect(keyCodeMap.isNonResponseKey('F1')).toBe(true);
				expect(keyCodeMap.isNonResponseKey('NumLock')).toBe(true);
			});

			it('should return false for response keys', () => {
				expect(keyCodeMap.isNonResponseKey('KeyA')).toBe(false);
				expect(keyCodeMap.isNonResponseKey('Enter')).toBe(false);
				expect(keyCodeMap.isNonResponseKey('Backspace')).toBe(false);
			});
		});
	});
});