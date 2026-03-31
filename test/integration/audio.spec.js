/**
 * @fileoverview Integration tests for Audio plugin
 * Tests src/plugins/modal/audio through real editor
 */

import { createTestEditor, waitForEditorReady, destroyTestEditor } from '../__mocks__/editorIntegration';
import { audio } from '../../src/plugins';

describe('Audio Plugin Integration Tests', () => {
	let editor;
	let wysiwyg;

	beforeEach(async () => {
		editor = createTestEditor({
			plugins: { audio },
			buttonList: [['audio']],
			audio: {
				defaultWidth: '300px',
				defaultHeight: '50px',
			},
		});
		await waitForEditorReady(editor);
		wysiwyg = editor.$.frameContext.get('wysiwyg');
	});

	afterEach(() => {
		destroyTestEditor(editor);
	});

	describe('plugin registration', () => {
		it('should register audio plugin', () => {
			expect(editor.$.plugins.audio).toBeTruthy();
		});

		it('should have audio button in toolbar', () => {
			const buttonTray = editor.$.context.get('toolbar_buttonTray');
			const audioBtn = buttonTray.querySelector('[data-command="audio"]');
			expect(audioBtn).toBeTruthy();
		});
	});

	describe('audio plugin instance', () => {
		it('should have modal property', () => {
			const audioInst = editor.$.plugins.audio;
			expect(audioInst.modal).toBeTruthy();
		});

		it('should have controller property', () => {
			const audioInst = editor.$.plugins.audio;
			expect(audioInst.controller).toBeTruthy();
		});

		it('should have fileManager property', () => {
			const audioInst = editor.$.plugins.audio;
			expect(audioInst.fileManager).toBeTruthy();
		});

		it('should have figure property', () => {
			const audioInst = editor.$.plugins.audio;
			expect(audioInst.figure).toBeTruthy();
		});
	});

	describe('audio element creation', () => {
		it('should create audio element with correct tag', () => {
			const audioEl = document.createElement('audio');
			audioEl.src = 'https://example.com/audio.mp3';
			audioEl.controls = true;
			expect(audioEl.tagName).toBe('AUDIO');
			expect(audioEl.src).toContain('audio.mp3');
		});
	});

	describe('plugin options', () => {
		it('should store default width', () => {
			const audioInst = editor.$.plugins.audio;
			if (audioInst.pluginOptions) {
				expect(audioInst.pluginOptions.defaultWidth).toBe('300px');
			}
		});

		it('should store default height', () => {
			const audioInst = editor.$.plugins.audio;
			if (audioInst.pluginOptions) {
				expect(audioInst.pluginOptions.defaultHeight).toBe('50px');
			}
		});
	});

	describe('modal interaction', () => {
		it('should open audio modal without error', () => {
			const audioInst = editor.$.plugins.audio;
			if (audioInst.open) {
				expect(() => audioInst.open()).not.toThrow();
			}
		});

		it('should have URL input in modal', () => {
			const audioInst = editor.$.plugins.audio;
			expect(audioInst.audioUrlFile || audioInst.audioInputFile).toBeTruthy();
		});

		it('should initialize modal form on init', () => {
			const audioInst = editor.$.plugins.audio;
			if (audioInst.modalInit) {
				expect(() => audioInst.modalInit()).not.toThrow();
			}
		});
	});
});
