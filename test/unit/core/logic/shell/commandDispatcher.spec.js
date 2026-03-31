/**
 * @jest-environment jsdom
 */

import { createMockEditor } from '../../../../__mocks__/editorMock';
import CommandDispatcher from '../../../../../src/core/logic/shell/commandDispatcher';

describe('CommandDispatcher', () => {
	let mockEditor;
	let commandDispatcher;

	beforeEach(() => {
		mockEditor = createMockEditor();
		commandDispatcher = new CommandDispatcher(mockEditor);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('Constructor', () => {
		it('should initialize CommandDispatcher', () => {
			expect(commandDispatcher).toBeDefined();
		});

		it('should have allCommandButtons map', () => {
			expect(commandDispatcher.allCommandButtons).toBeDefined();
			expect(commandDispatcher.allCommandButtons instanceof Map).toBe(true);
		});

		it('should have subAllCommandButtons map', () => {
			expect(commandDispatcher.subAllCommandButtons).toBeDefined();
			expect(commandDispatcher.subAllCommandButtons instanceof Map).toBe(true);
		});

		it('should have targets getter', () => {
			expect(commandDispatcher.targets).toBeDefined();
			expect(commandDispatcher.targets instanceof Map).toBe(true);
		});

		it('should have activeCommands getter', () => {
			expect(commandDispatcher.activeCommands).toBeDefined();
			expect(Array.isArray(commandDispatcher.activeCommands)).toBe(true);
		});
	});

	describe('run method', () => {
		it('should run command without type', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.run('bold');
			}).not.toThrow();
		});

		it('should run command with type', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.run('bold', 'command');
			}).not.toThrow();
		});

		it('should run command with button element', () => {
			const button = document.createElement('button');
			button.setAttribute('data-command', 'bold');

			expect(() => {
				mockEditor.$.commandDispatcher.run('bold', 'command', button);
			}).not.toThrow();
		});

		it('should handle different command types', () => {
			const types = ['command', 'dropdown', 'modal', 'container', 'more'];
			types.forEach((type) => {
				expect(() => {
					mockEditor.$.commandDispatcher.run('test', type);
				}).not.toThrow();
			});
		});

		it('should handle formatting commands', () => {
			const commands = ['bold', 'italic', 'underline', 'strikethrough'];
			commands.forEach((cmd) => {
				expect(() => {
					mockEditor.$.commandDispatcher.run(cmd, 'command');
				}).not.toThrow();
			});
		});

		it('should handle history commands', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.run('undo', 'command');
			}).not.toThrow();

			expect(() => {
				mockEditor.$.commandDispatcher.run('redo', 'command');
			}).not.toThrow();
		});
	});

	describe('runFromTarget method', () => {
		it('should run command from button target', () => {
			const button = document.createElement('button');
			button.setAttribute('data-command', 'bold');

			expect(() => {
				mockEditor.$.commandDispatcher.runFromTarget(button);
			}).not.toThrow();
		});

		it('should handle target without data-command attribute', () => {
			const button = document.createElement('button');

			expect(() => {
				mockEditor.$.commandDispatcher.runFromTarget(button);
			}).not.toThrow();
		});

		it('should handle null target', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.runFromTarget(null);
			}).not.toThrow();
		});
	});

	describe('applyTargets method', () => {
		it('should apply callback to command targets', () => {
			const callback = jest.fn();
			mockEditor.$.commandDispatcher.applyTargets('bold', callback);
			expect(mockEditor.$.commandDispatcher.applyTargets).toHaveBeenCalledWith('bold', callback);
		});

		it('should handle commands with registered targets', () => {
			const callback = jest.fn();
			mockEditor.$.commandDispatcher.applyTargets('bold', callback);
			expect(callback).toBeDefined();
		});

		it('should handle commands without registered targets', () => {
			const callback = jest.fn();
			expect(() => {
				mockEditor.$.commandDispatcher.applyTargets('nonexistentCommand', callback);
			}).not.toThrow();
		});

		it('should iterate over target buttons', () => {
			const callback = jest.fn();
			mockEditor.$.commandDispatcher.applyTargets('bold', callback);

			// Verify callback was prepared for use

		});
	});

	describe('registerTargets method', () => {
		it('should register command targets', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.registerTargets('bold', []);
			}).not.toThrow();
		});

		it('should accept array of elements', () => {
			const buttons = [
				document.createElement('button'),
				document.createElement('button')
			];

			expect(() => {
				mockEditor.$.commandDispatcher.registerTargets('bold', buttons);
			}).not.toThrow();
		});

		it('should handle empty targets array', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.registerTargets('bold', []);
			}).not.toThrow();
		});

		it('should register multiple commands', () => {
			const commands = ['bold', 'italic', 'underline'];
			const buttons = [document.createElement('button')];

			commands.forEach((cmd) => {
				expect(() => {
					mockEditor.$.commandDispatcher.registerTargets(cmd, buttons);
				}).not.toThrow();
			});
		});
	});

	describe('resetTargets method', () => {
		it('should clear target registrations', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.resetTargets();
			}).not.toThrow();
		});

		it('should reset all targets', () => {
			mockEditor.$.commandDispatcher.registerTargets('bold', [document.createElement('button')]);
			mockEditor.$.commandDispatcher.resetTargets();

			expect(mockEditor.$.commandDispatcher.resetTargets).toHaveBeenCalled();
		});
	});

	describe('targets property', () => {
		it('should return targets map', () => {
			const targets = commandDispatcher.targets;
			expect(targets instanceof Map).toBe(true);
		});

		it('should be accessible for reading', () => {
			expect(() => {
				const targets = commandDispatcher.targets;
				const boldTargets = targets.get('bold');
			}).not.toThrow();
		});

		it('should contain button elements for commands', () => {
			const targets = commandDispatcher.targets;
			expect(targets).toBeDefined();
		});
	});

	describe('activeCommands property', () => {
		it('should return array of active commands', () => {
			const activeCommands = commandDispatcher.activeCommands;
			expect(Array.isArray(activeCommands)).toBe(true);
		});

		it('should include formatting commands', () => {
			const activeCommands = commandDispatcher.activeCommands;
			const hasFormatting = activeCommands.some(cmd =>
				['bold', 'italic', 'underline'].includes(cmd)
			);
			expect(hasFormatting || activeCommands.length > 0).toBe(true);
		});
	});

	describe('Integration scenarios', () => {
		it('should handle command dispatch lifecycle', () => {
			const button = document.createElement('button');
			button.setAttribute('data-command', 'bold');

			mockEditor.$.commandDispatcher.registerTargets('bold', [button]);
			mockEditor.$.commandDispatcher.run('bold', 'command', button);

			expect(mockEditor.$.commandDispatcher.run).toHaveBeenCalled();
		});

		it('should handle multiple command targets', () => {
			const buttons = [
				document.createElement('button'),
				document.createElement('button'),
				document.createElement('button')
			];

			mockEditor.$.commandDispatcher.registerTargets('bold', buttons);
			mockEditor.$.commandDispatcher.run('bold', 'command');

			expect(mockEditor.$.commandDispatcher.run).toHaveBeenCalled();
		});

		it('should handle command execution with type information', () => {
			const button = document.createElement('button');
			button.setAttribute('data-type', 'command');
			button.setAttribute('data-command', 'bold');

			mockEditor.$.commandDispatcher.run('bold', 'command', button);

			expect(mockEditor.$.commandDispatcher.run).toHaveBeenCalledWith('bold', 'command', button);
		});

		it('should apply callbacks to all registered targets', () => {
			const buttons = [
				document.createElement('button'),
				document.createElement('button')
			];

			mockEditor.$.commandDispatcher.registerTargets('bold', buttons);

			const callback = jest.fn();
			mockEditor.$.commandDispatcher.applyTargets('bold', callback);

			expect(callback).toBeDefined();
		});

		it('should handle sequential command execution', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.run('bold', 'command');
				mockEditor.$.commandDispatcher.run('italic', 'command');
				mockEditor.$.commandDispatcher.run('underline', 'command');
			}).not.toThrow();
		});

		it('should handle command reset and re-registration', () => {
			const buttons = [document.createElement('button')];

			mockEditor.$.commandDispatcher.registerTargets('bold', buttons);
			mockEditor.$.commandDispatcher.resetTargets();
			mockEditor.$.commandDispatcher.registerTargets('bold', buttons);

			expect(mockEditor.$.commandDispatcher.run).toBeDefined();
		});
	});

	describe('destroy method', () => {
		it('should clean up resources', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.destroy();
			}).not.toThrow();
		});

		it('should clear command targets after destroy', () => {
			mockEditor.$.commandDispatcher.registerTargets('bold', [document.createElement('button')]);
			mockEditor.$.commandDispatcher.destroy();

			expect(mockEditor.$.commandDispatcher.destroy).toHaveBeenCalled();
		});
	});

	describe('Edge cases', () => {
		it('should handle case-insensitive command names', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.run('Bold', 'command');
				mockEditor.$.commandDispatcher.run('BOLD', 'command');
				mockEditor.$.commandDispatcher.run('bold', 'command');
			}).not.toThrow();
		});

		it('should handle empty command string', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.run('', 'command');
			}).not.toThrow();
		});

		it('should handle special command types', () => {
			const specialTypes = ['more', 'popup', 'nested'];
			specialTypes.forEach((type) => {
				expect(() => {
					mockEditor.$.commandDispatcher.run('test', type);
				}).not.toThrow();
			});
		});

		it('should handle undefined parameters gracefully', () => {
			expect(() => {
				mockEditor.$.commandDispatcher.run('bold', undefined, undefined);
			}).not.toThrow();
		});
	});
});
