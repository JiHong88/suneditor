import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dtsFilePath = join(__dirname, '../types/typedef.d.ts');

// read
const content = fs.readFileSync(dtsFilePath, 'utf8');

// inject - export {} , wrap - declare global {}
const wrappedContent = `export {};\n\ndeclare global {\n${content}\n}\n`;

// file write
fs.writeFileSync(dtsFilePath, wrappedContent, 'utf8');
