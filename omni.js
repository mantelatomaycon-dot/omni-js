#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const MAX_HTML_BYTES = 5 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15000;

const OmniJS = {
    version: '3.0.0',

    help() {
        console.log('\n🌟 OmniJS v' + this.version + ' — 2026 CMD Edition\n');
        console.log('Usage: node omni.js <command> [arguments]\n');
        console.log('  help                         Show this menu');
        console.log('  calc "<expression>"          Safely calculate arithmetic');
        console.log('  links <URL-or-html-file>     Extract unique links');
        console.log('  images <URL-or-html-file>    Extract image URLs');
        console.log('  clean <URL-or-html-file>     Save a cleaned HTML copy');
        console.log('  write <file> "<text>"        Create a UTF-8 text file');
        console.log('  exit                         Close interactive mode\n');
        console.log('Examples:');
        console.log('  node omni.js calc "5 * (2 + 3)"');
        console.log('  node omni.js links "https://example.com"');
        console.log('  node omni.js images page.html');
        console.log('  node omni.js clean page.html');
        console.log('  node omni.js write note.txt "Hello world"');
        console.log('  node omni.js                 Start interactive mode\n');
        console.log('No third-party packages are required. URL commands need an internet connection.\n');
    },

    calculate(expression) {
        const source = String(expression ?? '');
        const tokenPattern = /\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|(\*\*|[()+\-*/%]))/iy;
        const tokens = [];
        let position = 0;

        while (position < source.length) {
            tokenPattern.lastIndex = position;
            const match = tokenPattern.exec(source);
            if (!match) {
                if (/^\s*$/.test(source.slice(position))) break;
                throw new Error('Only numbers, parentheses, and + - * / % ** operators are allowed.');
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

    async getHtml(source) {
        if (!source) throw new Error('Provide a URL or local HTML file.');
        if (/^https?:\/\//i.test(source)) {
            const response = await fetch(source, {
                headers: { 'user-agent': 'OmniJS/3.0.0 (HTML utility)' },
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            });
            if (!response.ok) throw new Error('Request failed: HTTP ' + response.status + ' ' + response.statusText);
            const html = await response.text();
            if (Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
                throw new Error('The page is larger than the 5 MB limit.');
            }
            return { html, baseUrl: response.url || source };
        }
        if (/^[a-z][a-z\d+.-]*:\/\//i.test(source)) {
            throw new Error('Only http:// and https:// URLs are supported.');
        }
        const html = fs.readFileSync(source, 'utf8');
        if (Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
            throw new Error('The HTML file is larger than the 5 MB limit.');
        }
        return { html, baseUrl: null };
    },

    resolveUrl(value, baseUrl) {
        try {
            const result = baseUrl ? new URL(value, baseUrl) : new URL(value);
            return ['http:', 'https:'].includes(result.protocol) ? result.href : null;
        } catch {
            return null;
        }
    },

    async listLinks(source) {
        const { html, baseUrl } = await this.getHtml(source);
        const found = Array.from(html.matchAll(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>\x60]+))/gi),
            match => match[1] ?? match[2] ?? match[3]);
        const links = [...new Set(found.map(value => this.resolveUrl(value, baseUrl)).filter(Boolean))];
        if (!links.length) console.log('No HTTP(S) links found.');
        else links.forEach((url, index) => console.log(String(index + 1).padStart(3, ' ') + '. ' + url));
        console.log('\nFound ' + links.length + ' unique link(s).');
        return links;
    },

    async listImages(source) {
        const { html, baseUrl } = await this.getHtml(source);
        const found = Array.from(html.matchAll(/<img\b[^>]*?\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>\x60]+))/gi),
            match => match[1] ?? match[2] ?? match[3]);
        const images = [...new Set(found.map(value => this.resolveUrl(value, baseUrl)).filter(Boolean))];
        if (!images.length) console.log('No image URLs found.');
        else images.forEach((url, index) => console.log(String(index + 1).padStart(3, ' ') + '. ' + url));
        console.log('\nFound ' + images.length + ' unique image(s).');
        return images;
    },

    async cleanPage(source) {
        const { html, baseUrl } = await this.getHtml(source);
        const pattern = /<([a-z][\w:-]*)\b(?=[^>]*(?:id|class)\s*=\s*["'][^"']*(?:advert|sponsor|cookie[-_ ]?(?:banner|consent|notice)|popup|pop-up|modal|ad-container)[^"']*["'])[^>]*>[\s\S]*?<\/\1\s*>/gi;
        const cleaned = html.replace(pattern, '');
        const outputPath = baseUrl
            ? path.resolve('omni-cleaned-' + new URL(baseUrl).hostname.replace(/[^a-z0-9.-]/gi, '_') + '.html')
            : path.resolve(source.replace(/\.html?$/i, '') + '.cleaned.html');
        fs.writeFileSync(outputPath, cleaned, 'utf8');
        console.log('Saved cleaned copy to: ' + outputPath);
        console.log('The original source was not changed. Review the output before using it.');
        return outputPath;
    },

    writeText(fileName, content) {
        if (!fileName) throw new Error('Provide a file name.');
        fs.writeFileSync(fileName, String(content ?? ''), 'utf8');
        console.log('Saved UTF-8 text file: ' + path.resolve(fileName));
    }
};

function tokenize(input) {
    const tokens = [];
    const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let match;
    while ((match = pattern.exec(input)) !== null) {
        tokens.push(match[1] ?? match[2] ?? match[3]);
    }
    return tokens;
}

async function execute(command, args) {
    switch (command.toLowerCase()) {
        case 'help':
        case '--help':
        case '-h':
            OmniJS.help();
            break;
        case 'calc':
            console.log('Result: ' + OmniJS.calculate(args.join(' ')));
            break;
        case 'links':
            await OmniJS.listLinks(args.join(' '));
            break;
        case 'images':
            await OmniJS.listImages(args.join(' '));
            break;
        case 'clean':
            await OmniJS.cleanPage(args.join(' '));
            break;
        case 'write':
            if (args.length < 2) throw new Error('Usage: node omni.js write <file> "<text>"');
            OmniJS.writeText(args[0], args.slice(1).join(' '));
            break;
        case 'exit':
            return false;
        default:
            throw new Error('Unknown command. Run node omni.js help.');
    }
    return true;
}

async function interactiveMode() {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    console.log('\n🌟 Welcome to OmniJS v' + OmniJS.version + ' — 2026 CMD Edition');
    console.log('Type help to see commands, or exit to quit.\n');

    try {
        while (true) {
            const input = (await rl.question('OmniJS> ')).trim();
            if (!input) continue;
            const [command, ...args] = tokenize(input);
            try {
                if (!await execute(command, args)) break;
            } catch (error) {
                console.error('Error: ' + error.message);
            }
        }
    } finally {
        rl.close();
    }
    console.log('OmniJS closed.');
}

async function main() {
    const args = process.argv.slice(2);
    if (!args.length) return interactiveMode();
    const [command, ...rest] = args;
    try {
        await execute(command, rest);
    } catch (error) {
        console.error('Error: ' + error.message);
        process.exitCode = 1;
    }
}

if (require.main === module) main();
module.exports = OmniJS;
