import { dom } from '../../helper';
import { COPY_FORMAT, FONT_STYLE, PAGE_BREAK, SAVE, SELECT_ALL } from './actives';

/**
 * @description 명령어 실행 담당 서비스 (기존 commandHandler 대체)
 */
export default class CommandExecutor {
	/**
	 * @constructor
	 * @param {SunEditor.Instance} editor
	 */
	constructor(editor) {
		this.editor = editor;
		this.frameContext = editor.frameContext;
		this.options = editor.options;
	}

	get #selection() {
		return this.editor.selection;
	}

	get #format() {
		return this.editor.format;
	}

	get #inline() {
		return this.editor.inline;
	}

	get #html() {
		return this.editor.html;
	}

	get #viewer() {
		return this.editor.viewer;
	}

	get #history() {
		return this.editor.history;
	}

	/**
	 * @description Execute default command of command button
	 */
	async execute(command, button) {
		if (this.frameContext.get('isReadOnly') && !/copy|cut|selectAll|codeView|fullScreen|print|preview|showBlocks/.test(command)) return;

		switch (command) {
			case 'selectAll':
				SELECT_ALL(this.editor);
				break;
			case 'copy': {
				const range = this.#selection.getRange();
				if (range.collapsed) break;

				const container = dom.utils.createElement('div', null, range.cloneContents());
				await this.#html.copy(container.innerHTML);

				break;
			}
			case 'newDocument':
				this.#html.set(`<${this.options.get('defaultLine')}><br></${this.options.get('defaultLine')}>`);
				this.editor.focusManager.focus();
				this.#history.push(false);
				// document type
				if (this.frameContext.has('documentType_use_header')) {
					this.frameContext.get('documentType').reHeader();
				}
				break;
			case 'codeView':
				this.#viewer.codeView(!this.frameContext.get('isCodeView'));
				break;
			case 'fullScreen':
				this.#viewer.fullScreen(!this.frameContext.get('isFullScreen'));
				break;
			case 'indent':
				this.#format.indent();
				break;
			case 'outdent':
				this.#format.outdent();
				break;
			case 'undo':
				this.#history.undo();
				break;
			case 'redo':
				this.#history.redo();
				break;
			case 'removeFormat':
				this.#inline.remove();
				this.editor.focusManager.focus();
				break;
			case 'print':
				this.#viewer.print();
				break;
			case 'preview':
				this.#viewer.preview();
				break;
			case 'showBlocks':
				this.#viewer.showBlocks(!this.frameContext.get('isShowBlocks'));
				break;
			case 'dir':
				this.editor.setDir(this.options.get('_rtl') ? 'ltr' : 'rtl');
				break;
			case 'dir_ltr':
				this.editor.setDir('ltr');
				break;
			case 'dir_rtl':
				this.editor.setDir('rtl');
				break;
			case 'save':
				await SAVE(this.editor);
				break;
			case 'copyFormat':
				COPY_FORMAT(this.editor, button);
				break;
			case 'pageBreak':
				PAGE_BREAK(this.editor);
				break;
			case 'pageUp':
				this.frameContext.get('documentType').pageUp();
				break;
			case 'pageDown':
				this.frameContext.get('documentType').pageDown();
				break;
			default:
				FONT_STYLE(this.editor, command);
		}
	}
}
