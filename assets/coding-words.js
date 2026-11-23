(() => {
    'use strict';
    const vocabulary = [
        'if', 'in', 'is', 'do', 'as', 'or', 'int', 'let', 'var', 'for', 'try', 'new',
        'get', 'set', 'map', 'null', 'void', 'enum', 'else', 'case', 'this', 'true',
        'const', 'async', 'await', 'class', 'while', 'yield', 'throw', 'catch', 'false',
        'break', 'super', 'return', 'import', 'export', 'switch', 'typeof', 'static',
        'public', 'delete', 'default', 'extends', 'finally', 'function', 'continue',
        'private', 'boolean', 'interface', 'undefined', 'prototype', 'instanceof',
        'implements', 'constructor',
    ];

    window.createCodingWordScrambler = words => {
        const context = document.createElement('canvas').getContext('2d');
        const metrics = new Map();
        const choices = new Map();
        // Measure once per entrance, using the real font and each original word's slot.
        for (const word of words) {
            const style = getComputedStyle(word.lastElementChild);
            const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            const spacing = parseFloat(style.letterSpacing) || 0;
            const key = `${font}|${spacing}`;
            if (context && !metrics.has(key)) {
                context.font = font;
                metrics.set(key, vocabulary.map(value => ({
                    value,
                    width: context.measureText(value).width + spacing * value.length,
                })).sort((a, b) => b.width - a.width));
            }
            const width = word.getBoundingClientRect().width;
            const original = word.firstElementChild.textContent.toLowerCase().replace(/[^a-z]/g, '');
            const fitting = (metrics.get(key) || []).filter(item => item.width <= width - 0.5 && item.value !== original);
            // Prefer similarly sized keywords; short slots still get complete words like "if".
            choices.set(word, fitting.slice(0, 8).map(item => item.value));
        }
        return (word, unresolved) => {
            const cipher = word.lastElementChild;
            const pool = choices.get(word) || [];
            const decoding = unresolved && pool.length > 0;
            word.classList.toggle('is-decoding', decoding);
            if (!decoding) {
                cipher.removeAttribute('data-scramble');
                return;
            }
            const alternatives = pool.filter(value => value !== cipher.dataset.scramble);
            const available = alternatives.length ? alternatives : pool;
            cipher.dataset.scramble = available[Math.floor(Math.random() * available.length)];
        };
    };
})();
