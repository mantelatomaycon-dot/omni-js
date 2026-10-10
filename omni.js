#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const OmniJS = {
    version: '2.0.0',

    help() {
        console.log('\n🌟 OmniJS v' + this.version + ' — CMD Edition\n');
        console.log('  help                         Show this menu');
        console.log('  calc <expression>            Calculate arithmetic safely');
        console.log('  links <html-file>            Extract unique links from an HTML file');
        console.log('  images <html-file>           Extract image URLs from an HTML file');
        console.log('  clean <html-file>            Save a copy with common ad/overlay elements removed');
        console.log('  write <file> <text>          Create a text file');
        console.log('  exit                         Close OmniJS\n');
        console.log('Examples:');
        console.log('  node omni.js calc "5 * (2 + 3)"');
        console.log('  node omni.js links page.html');
        console.log('  node omni.js write note.txt "Hello world"');
        console.log('  node omni.js                 Open interactive mode\n');
    },

    calculate(expression) {
        const source = String(expression || '');
        const tokenPattern = /\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|(\*\*|[()+\-*/%]))/iy;
        const tokens = [];
        let position = 0;

        while (position < source.length) {
            tokenPattern.lastIndex = position;
            const match = tokenPattern.exec(source);
            if (!match) {
                if (/^\s*$/.test(source.slice(position))) break;
                throw new Error('Only numbers and arithmetic operators (+ - * / % **) are allowed.');
            }
            tokens.push(match[1] !== undefined ? Number(match[0].trim()) : match[2]);
            position = tokenPattern.lastIndex;
        }

        let index = 0;
        const peek = () => tokens[index];
        const take = () => tokens[index++];

        function primary() {
            const token = take();
            if (typeof token === 'number' && Number.isFinite(token)) return token;
            if (token === '(') {
                const value = addSub();
                if (take() !== ')') throw new Error('Missing closing parenthesis.');
                return value;
            }
            throw new Error('Expected a number or parenthesis.');
        }

        function power() {
            const left = primary();
            if (peek() === '**') {
                take();
                return left ** unary();
            }
            return left;
        }

        function unary() {
            if (peek() === '+') { take(); return unary(); }
            if (peek() === '-') { take(); return -unary(); }
            return power();
        }

        function multiply() {
            let value = unary();
            while (['*', '/', '%'].includes(peek())) {
                const operator = take();
                const right = unary();
                if ((operator === '/' || operator === '%') && right === 0) {
                    throw new Error('Cannot divide by zero.');
                }
                if (operator === '*') value *= right;
                if (operator === '/') value /= right;
                if (operator === '%') value %= right;
            }
            return value;
        }

        function addSub() {
            let value = multiply();
            while (peek() === '+' || peek() === '-') {
                const operator = take();
                const right = multiply();
                value = operator === '+' ? value + right : value - right;
            }
            return value;
        }

        if (!tokens.length) throw new Error('Enter an arithmetic expression.');
        const result = addSub();
        if (index !== tokens.length) throw new Error('Unexpected token in expression.');
        if (!Number.isFinite(result)) throw new Error('Result is not a finite number.');
        return result;
    },

    readHtml(filePath) {
        if (!filePath) throw new Error('Please provide an HTML file path.');
        return fs.readFileSync(filePath, 'utf8');
    },

    listLinks(filePath) {
        const html = this.readHtml(filePath);
        const links = [...new Set(Array.from(
            html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi),
            match => match[1]
        ).filter(value => /^https?:\/\//i.test(value)))];

        if (!links.length) console.log('No absolute HTTP(S) links found.');
        else links.forEach((link, index) => console.log((index + 1) + '. ' + link));
        console.log('\nFound ' + links.length + ' unique link(s).');
        return links;
    },

    listImages(filePath) {
        const html = this.readHtml(filePath);
        const images = [...new Set(Array.from(
            html.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi),
            match => match[1]
        ))];

        if (!images.length) console.log('No image sources found.');
        else images.forEach((src, index) => console.log((index + 1) + '. ' + src));
        console.log('\nFound ' + images.length + ' unique image(s).');
        return images;
    },

    cleanPage(filePath) {
        const html = this.readHtml(filePath);
        const outputPath = filePath.replace(/\.html?$/i, '') + '.cleaned.html';
        const patterns = [
            /<([a-z][\w:-]*)\b[^>]*(?:id|class)\s*=\s*["'][^"']*(?:advert|sponsor|cookie-banner|cookie-consent|popup|pop-up)[^"']*["'][^>]*>[\s\S]*?<\/\1\s*>/gi
        ];
        let cleaned = html;
        for (const pattern of patterns) cleaned = cleaned.replace(pattern, '');
        fs.writeFileSync(outputPath, cleaned, 'utf8');
        console.log('Saved cleaned copy to: ' + outputPath);
        console.log('The original file was not changed.');
        return outputPath;
    },

    downloadText(fileName, content) {
        if (!fileName) throw new Error('Please provide a file name.');
        fs.writeFileSync(fileName, String(content ?? ''), 'utf8');
        console.log('Saved text file: ' + fileName);
    }
};

async function interactiveMode() {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    console.log('\n🌟 Welcome to OmniJS v' + OmniJS.version + ' — CMD Edition');
    console.log('Type help to see commands, or exit to quit.\n');

    try {
        while (true) {
            const input = (await rl.question('OmniJS> ')).trim();
            if (!input) continue;
            if (/^exit$/i.test(input)) break;
            if (/^help$/i.test(input)) { OmniJS.help(); continue; }

            const firstSpace = input.indexOf(' ');
            const command = (firstSpace < 0 ? input : input.slice(0, firstSpace)).toLowerCase();
            const args = firstSpace < 0 ? '' : input.slice(firstSpace + 1).trim();

            try {
                if (command === 'calc') console.log('Result: ' + OmniJS.calculate(args));
                else if (command === 'links') OmniJS.listLinks(args.replace(/^["']|["']$/g, ''));
                else if (command === 'images') OmniJS.listImages(args.replace(/^["']|["']$/g, ''));
                else if (command === 'clean') OmniJS.cleanPage(args.replace(/^["']|["']$/g, ''));
                else if (command === 'write') {
                    const match = args.match(/^(\S+)\s+([\s\S]*)$/);
                    if (!match) throw new Error('Usage: write <file> <text>');
                    OmniJS.downloadText(match[1], match[2].replace(/^["']|["']$/g, ''));
                } else console.log('Unknown command. Type help for commands.');
            } catch (error) {
                console.error('Error: ' + error.message);
            }
        }
    } finally {
        rl.close();
    }
    console.log('OmniJS closed.');
}

function runCommand(args) {
    const command = (args[0] || 'help').toLowerCase();
    const rest = args.slice(1);

    try {
        if (command === 'help' || command === '--help' || command === '-h') OmniJS.help();
        else if (command === 'calc') console.log(OmniJS.calculate(rest.join(' ')));
        else if (command === 'links') OmniJS.listLinks(rest.join(' '));
        else if (command === 'images') OmniJS.listImages(rest.join(' '));
        else if (command === 'clean') OmniJS.cleanPage(rest.join(' '));
        else if (command === 'write') {
            if (rest.length < 2) throw new Error('Usage: node omni.js write <file> <text>');
            OmniJS.downloadText(rest[0], rest.slice(1).join(' '));
        } else if (command === 'exit') process.exit(0);
        else throw new Error('Unknown command. Run node omni.js help to see commands.');
    } catch (error) {
        console.error('Error: ' + error.message);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    if (process.argv.length <= 2) interactiveMode().catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    });
    else runCommand(process.argv.slice(2));
}

module.exports = OmniJS;
