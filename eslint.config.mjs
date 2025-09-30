import globals from 'globals';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import compatPlugin from 'eslint-plugin-compat';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import prettierConfig from 'eslint-config-prettier';

export default [
	{
		ignores: ['node_modules/', 'dist/', 'sample/', 'coverage/', 'test/', 'webpack/', 'jest.conf.js', '*.css']
	},

	js.configs.recommended,

	{
		plugins: {
			prettier: prettierPlugin,
			compat: compatPlugin,
			'simple-import-sort': simpleImportSortPlugin
		},
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				...globals.es2022,
				ActiveXObject: 'writable',
				Selection: 'writable',
				Node: 'writable',
				Range: 'writable'
			}
		},
		rules: {
			'compat/compat': 'error',
			eqeqeq: 'error',
			strict: ['error', 'safe'],
			'no-undef': 'off',
			'no-loop-func': 'off',
			'no-shadow': 'error',
			'no-unused-expressions': 'off',
			curly: 'off',
			'prefer-const': 'error',
			'no-var': 'error',
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '_'
				}
			]
		}
	},

	{
		files: ['**/*.ts', '**/*.tsx'],
		plugins: {
			'@typescript-eslint': tsPlugin
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2022
			}
		},
		rules: {
			...tsPlugin.configs['eslint-recommended'].rules,
			...tsPlugin.configs['recommended'].rules,
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '_'
				}
			]
		}
	},

	{
		files: ['**/*.d.ts'],
		rules: {
			'no-unused-vars': 'off',
			'no-unused-private-class-members': 'off',
			'no-redeclare': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error'
		}
	},

	prettierConfig,
	{
		files: ['**/*.{js,ts,jsx,tsx}'],
		plugins: {
			prettier: prettierPlugin
		},
		rules: {
			'prettier/prettier': [
				'error',
				{
					arrowParens: 'always',
					bracketSpacing: true,
					endOfLine: 'lf',
					htmlWhitespaceSensitivity: 'css',
					insertPragma: false,
					jsxBracketSameLine: false,
					jsxSingleQuote: true,
					printWidth: 240,
					proseWrap: 'preserve',
					quoteProps: 'as-needed',
					requirePragma: false,
					semi: true,
					singleQuote: true,
					tabWidth: 4,
					trailingComma: 'none',
					useTabs: true,
					vueIndentScriptAndStyle: false
				}
			]
		}
	}
];
