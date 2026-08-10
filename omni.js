const OmniJS = {
    cleanPage() {
        const annoyances = ['ads', 'banner', 'pop-up', 'modal', 'cookie', 'propaganda'];
        const selectors = annoyances.flatMap(word => [
            `[id*="${word}"]`, `[class*="${word}"]`, `[id*="${word.toUpperCase()}"]`, `[class*="${word.toUpperCase()}"]`
        ]).join(', ');
        document.querySelectorAll(selectors).forEach(el => el.remove());
        document.body.style.overflow = 'auto';
        console.log('🧼 Page cleaned successfully!');
    },

    listLinks() {
        const links = Array.from(document.querySelectorAll('a'))
            .map(a => a.href)
            .filter(href => href.startsWith('http'));
        console.table([...new Set(links)]);
    },

    listImages() {
        const images = Array.from(document.querySelectorAll('img'))
            .map(img => img.src)
            .filter(src => src);
        console.table([...new Set(images)]);
    },

    editorMode() {
        const active = document.designMode === 'on';
        document.designMode = active ? 'off' : 'on';
        console.log(`✏️ Editor mode: ${!active ? 'ENABLED' : 'DISABLED'}`);
    },

    downloadText(fileName, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    },

    calculate(expression) {
        try {
            const result = Function(`"use strict"; return (${expression})`)();
            console.log(`🔢 Result of [${expression}] =`, result);
        } catch {
            console.error('❌ Invalid mathematical expression.');
        }
    },

    help() {
        console.log('%c🌟 OMNIJS MENU 🌟', 'font-weight: bold; font-size: 14px; color: #00ff00;');
        console.log('OmniJS.cleanPage()');
        console.log('OmniJS.listLinks()');
        console.log('OmniJS.listImages()');
        console.log('OmniJS.editorMode()');
        console.log('OmniJS.calculate("5*5")');
        console.log('OmniJS.downloadText("note.txt", "text")');
    }
};

OmniJS.help();
