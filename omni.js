(() => {
    const OmniJS = {
        version: '1.1.0',

        cleanPage() {
            const selectors = [
                '[id*="ad-"]', '[id^="ad_"]', '[class*="advert"]',
                '[id*="advert"]', '[class*="sponsor"]', '[id*="sponsor"]',
                '[class*="cookie-banner"]', '[id*="cookie-banner"]',
                '[class*="cookie-consent"]', '[id*="cookie-consent"]',
                '[role="dialog"]', '[aria-modal="true"]'
            ].join(',');

            let removed = 0;
            document.querySelectorAll(selectors).forEach((element) => {
                if (element === document.body || element === document.documentElement) return;
                const rect = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                const looksLikeOverlay =
                    style.position === 'fixed' &&
                    (rect.width > innerWidth * 0.35 || rect.height > innerHeight * 0.2);
                const label = element.id + ' ' + (typeof element.className === 'string' ? element.className : '');
                const isKnownAnnoyance = /advert|sponsor|cookie-banner|cookie-consent|(?:^|[\s_-])ad(?:[\s_-]|$)/i.test(label);

                if (isKnownAnnoyance || looksLikeOverlay) {
                    element.remove();
                    removed++;
                }
            });

            if (document.body) document.body.style.overflow = '';
            console.log('🧼 OmniJS: removed ' + removed + ' likely ads or overlays.');
            return removed;
        },

        listLinks() {
            const links = [...new Set(
                Array.from(document.querySelectorAll('a[href]'))
                    .map((anchor) => anchor.href)
                    .filter((href) => /^https?:\/\//i.test(href))
            )];
            console.table(links.map((url) => ({ url })));
            console.log('🔗 Found ' + links.length + ' unique links.');
            return links;
        },

        listImages() {
            const images = [...new Set(
                Array.from(document.querySelectorAll('img'))
                    .map((image) => image.currentSrc || image.src)
                    .filter(Boolean)
            )];
            console.table(images.map((src) => ({ src })));
            console.log('🖼️ Found ' + images.length + ' unique images.');
            return images;
        },

        editorMode() {
            const enabled = document.designMode !== 'on';
            document.designMode = enabled ? 'on' : 'off';
            console.log('✏️ Editor mode ' + (enabled ? 'enabled.' : 'disabled.'));
            return enabled;
        },

        downloadText(fileName, content) {
            const safeName = String(fileName || 'download.txt').replace(/[\\/:*?"<>|]/g, '_');
            const blob = new Blob([String(content ?? '')], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = safeName;
            anchor.style.display = 'none';
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            console.log('⬇️ Download started: ' + safeName);
        },

        calculate(expression) {
            const source = String(expression);
            const tokenPattern = /\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|(\*\*|[()+\-*/%]))/iy;
            const tokens = [];
            let position = 0;

            while (position < source.length) {
                tokenPattern.lastIndex = position;
                const match = tokenPattern.exec(source);
                if (!match) {
                    if (/^\s*$/.test(source.slice(position))) break;
                    throw new SyntaxError('Only arithmetic expressions are allowed.');
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
                    if (take() !== ')') throw new SyntaxError('Missing closing parenthesis.');
                    return value;
                }
                throw new SyntaxError('Expected a number or parenthesis.');
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
                if (peek() === '+') {
                    take();
                    return unary();
                }
                if (peek() === '-') {
                    take();
                    return -unary();
                }
                return power();
            }

            function multiply() {
                let value = unary();
                while (['*', '/', '%'].includes(peek())) {
                    const operator = take();
                    const right = unary();
                    if ((operator === '/' || operator === '%') && right === 0) {
                        throw new RangeError('Cannot divide by zero.');
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

            try {
                if (!tokens.length) throw new SyntaxError('Enter an expression.');
                const result = addSub();
                if (index !== tokens.length) throw new SyntaxError('Unexpected token.');
                if (!Number.isFinite(result)) throw new RangeError('Result is not finite.');
                console.log('🔢 ' + source + ' = ' + result);
                return result;
            } catch (error) {
                console.error('❌ Calculation failed: ' + error.message);
                return null;
            }
        },

        help() {
            console.log('%c🌟 OmniJS v1.1.0', 'font-weight: bold; font-size: 16px; color: #00c896;');
            console.log('OmniJS.help()                   Show this menu');
            console.log('OmniJS.cleanPage()              Remove likely ads and overlays');
            console.log('OmniJS.listLinks()              List unique HTTP(S) links');
            console.log('OmniJS.listImages()             List unique image URLs');
            console.log('OmniJS.editorMode()             Toggle page editing');
            console.log('OmniJS.calculate("5 * (2 + 3)")  Safely calculate arithmetic');
            console.log('OmniJS.downloadText("note.txt", "Hello!")  Download a text file');
        }
    };

    window.OmniJS = OmniJS;
    OmniJS.help();
})();
