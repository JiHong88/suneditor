const fs = require('fs');
const { join } = require('path');

const dtsFilePath = join(__dirname, '../types/typedef.d.ts');

// read
const content = fs.readFileSync(dtsFilePath, 'utf8');

// inject - export {} , wrap - declare global {}
const wrappedContent = `export {};\n\ndeclare global {\n${content}\n}\n`;

// file write
fs.writeFileSync(dtsFilePath, wrappedContent, 'utf8');

console.log('[wrap-dts]');
