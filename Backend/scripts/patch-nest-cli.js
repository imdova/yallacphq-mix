/**
 * Patches @nestjs/cli start.action.js so Node is run with dist/main.js (not dist/main).
 * Required on Windows with Node 24 where extension-less paths may not resolve.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname,
  '..',
  'node_modules',
  '@nestjs',
  'cli',
  'actions',
  'start.action.js'
);

if (!fs.existsSync(file)) {
  process.exit(0);
}

let content = fs.readFileSync(file, 'utf8');
const marker = `if (!outputFilePath.endsWith('.js')) {
            outputFilePath = outputFilePath + '.js';
        }`;

if (content.includes(marker)) {
  process.exit(0);
}

const find = `if (!fs.existsSync(outputFilePath + '.js')) {
            outputFilePath = (0, path_1.join)(outDirName, entryFile);
        }
        let childProcessArgs = [];`;

const replace = `if (!fs.existsSync(outputFilePath + '.js')) {
            outputFilePath = (0, path_1.join)(outDirName, entryFile);
        }
        if (!outputFilePath.endsWith('.js')) {
            outputFilePath = outputFilePath + '.js';
        }
        let childProcessArgs = [];`;

if (!content.includes(find)) {
  process.exit(0);
}

content = content.replace(find, replace);
fs.writeFileSync(file, content);
console.log('Applied Nest CLI patch: node entry path now includes .js');
