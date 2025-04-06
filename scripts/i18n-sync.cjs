#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const args = require('minimist')(process.argv.slice(2));

const LANG_DIR = path.join(__dirname, '../src/langs');
const TYPE_FILE = path.join(__dirname, '../types/langs/_Lang.d.ts');

const BASE_LANG = args.base || 'en';
const targets = args.target ? args.target.split(',') : null;
const autoTranslate = args['auto-translate'] || false;
const fillEmpty = args['fill-empty'] || false;

const { TranslationServiceClient } = require('@google-cloud/translate').v3;
const translationClient = new TranslationServiceClient();

const googleTranslate = async (text, from, to) => {
	const projectId = await translationClient.getProjectId();
	const request = {
		parent: `projects/${projectId}/locations/global`,
		contents: [text],
		mimeType: 'text/plain',
		sourceLanguageCode: from,
		targetLanguageCode: to
	};

	const [response] = await translationClient.translateText(request);
	return response.translations[0]?.translatedText || text;
};

// https://cloud.google.com/translate/docs/languages?hl=ko
const langMap = {
	pt_br: 'pt',
	zh_cn: 'zh-CN',
	zh_tw: 'zh-TW',
	se: 'sv',
	ua: 'uk',
	fr_ca: 'fr-CA',
	ms_arab: 'ms-Arab',
	mni_mtei: 'mni-Mtei',
	pa_arab: 'pa-Arab'
};

const getLangObject = (fileContent) => {
	const match = fileContent.match(/const lang = ({[\s\S]*?});/);
	if (!match) return null;
	return eval('(' + match[1] + ')');
};

const injectKeys = async (filePath, langCode, baseLangObj) => {
	if (langCode === BASE_LANG) return;

	let file = fs.readFileSync(filePath, 'utf8');
	const langObj = getLangObject(file);
	if (!langObj) return;

	const keyOrder = Object.keys(baseLangObj);
	const existingKeys = new Set(Object.keys(langObj));

	const googleLangCode = langMap[langCode] || langCode.replace('_', '-');

	const missingMap = new Map();
	for (const key of keyOrder) {
		if (!existingKeys.has(key)) {
			let value = '';
			const baseValue = baseLangObj[key];
			if (autoTranslate) {
				try {
					// eslint-disable-next-line no-console
					console.log(`[↻] Translating (${BASE_LANG} → ${googleLangCode}) ${key}: ${baseValue}`);
					value = await googleTranslate(baseValue, BASE_LANG, googleLangCode);
					// eslint-disable-next-line no-console
					console.log(`[✓] Translated (${langCode}:${key}) → ${value}`);
				} catch (e) {
					console.warn(`[WARN] Auto-translate failed for ${langCode}:${key}`, e);
					value = fillEmpty ? '' : baseValue;
				}
			} else {
				value = fillEmpty ? '' : baseValue;
			}
			missingMap.set(key, value.replace(/'/g, "\\'").trim());
		}
	}

	if (missingMap.size === 0) return;

	file = file.replace(/(const lang = {)([\s\S]*?)(\n\t\};)/, (match, p1, body, p3) => {
		const lines = body.trim().split('\n');
		const keyLineMap = new Map();

		lines.forEach((line, i) => {
			const m = line.match(/^\s*(\w+):/);
			if (m) keyLineMap.set(m[1], i);
		});

		if (lines.length > 0 && !lines[lines.length - 1].trim().endsWith(',')) {
			lines[lines.length - 1] += ',';
		}

		for (const key of keyOrder) {
			if (!missingMap.has(key)) continue;
			let insertIdx = -1;

			for (let i = keyOrder.indexOf(key) - 1; i >= 0; i--) {
				if (keyLineMap.has(keyOrder[i])) {
					insertIdx = keyLineMap.get(keyOrder[i]) + 1;
					break;
				}
			}

			const newLine = `\t\t${key}: '${missingMap.get(key)}',`;
			if (insertIdx >= 0 && insertIdx < lines.length) {
				lines.splice(insertIdx, 0, newLine);
				for (const [k, idx] of keyLineMap.entries()) {
					if (idx >= insertIdx) keyLineMap.set(k, idx + 1);
				}
				keyLineMap.set(key, insertIdx);
			} else {
				lines.push(newLine);
				keyLineMap.set(key, lines.length - 1);
			}
		}

		return `${p1}\n${lines.join('\n')}${p3}`;
	});

	fs.writeFileSync(filePath, file, 'utf8');

	// eslint-disable-next-line no-console
	console.log(`[✔] Updated ${langCode}`);
};

const updateTypeDef = (baseLangObj) => {
	let typeFile = fs.readFileSync(TYPE_FILE, 'utf8');
	const existingKeys = new Set((typeFile.match(/\b(\w+): string;/g) || []).map((k) => k.split(':')[0]));
	const keyOrder = Object.keys(baseLangObj);
	const toInsert = keyOrder.filter((k) => !existingKeys.has(k)).map((k) => `\t${k}: string;`);
	if (toInsert.length === 0) return;

	typeFile = typeFile.replace(/(interface _Lang\s*{)([\s\S]*?)(\n?})/, (match, p1, body, p3) => {
		const existingLines = body.trimEnd().split('\n').filter(Boolean);
		const existingLineMap = new Map(existingLines.map((line) => [line.trim().split(':')[0], line]));
		const sorted = keyOrder.map((k) => existingLineMap.get(k) || `\t${k}: string;`);
		return `${p1}\n${sorted.join('\n')}\n${p3}`;
	});

	fs.writeFileSync(TYPE_FILE, typeFile, 'utf8');

	// eslint-disable-next-line no-console
	console.log(`[✔] Updated _Lang.d.ts`);
};

(async () => {
	const files = fs.readdirSync(LANG_DIR);
	const baseFilePath = path.join(LANG_DIR, `${BASE_LANG}.js`);
	const baseFile = fs.readFileSync(baseFilePath, 'utf8');
	const baseLangObj = getLangObject(baseFile);

	for (const file of files) {
		const langCode = file.replace(/\.js$/, '');
		if (langCode === BASE_LANG) continue;
		if (targets && !targets.includes(langCode)) continue;
		await injectKeys(path.join(LANG_DIR, file), langCode, baseLangObj);
	}

	updateTypeDef(baseLangObj);
})();
