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

    window.createCodingWordScrambler = (words, seed = 0) => {
        let context;
        try { context = document.createElement('canvas').getContext('2d'); } catch { context = null; }
        const metrics = new Map();
        const choices = new Map();
        // Measure on layout changes, using the real font and each original word's slot.
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
            const pool = fitting.slice(0, 8).map(item => item.value);
            let state = (seed + words.indexOf(word) * 2654435761) >>> 0;
            for (let i = pool.length - 1; i > 0; i--) {
                state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
                const j = state % (i + 1);
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }
            choices.set(word, pool);
        }
        return (word, unresolved, tick = 0) => {
            const cipher = word.lastElementChild;
            const pool = choices.get(word) || [];
            const decoding = unresolved && pool.length > 0;
            if (word.classList.contains('is-decoding') !== decoding) word.classList.toggle('is-decoding', decoding);
            if (!decoding) {
                cipher.removeAttribute('data-scramble');
                return;
            }
            const value = pool[Math.max(0, tick) % pool.length];
            if (cipher.dataset.scramble !== value) cipher.dataset.scramble = value;
        };
    };

    // One scroll clock per paragraph; original text nodes and whitespace never change.
    window.createScrollCodingText = (description, prefix, options = {}) => {
        if (!description || !window.scrollMotion) return null;
        const motion = window.scrollMotion;
        const original = description.textContent;
        const specialties = prefix === 'company' ? [...original.matchAll(/industrial tank cleaning|authorised gas tester|working at height|rope access technique/g)] : [];
        const words = [];
        const content = document.createDocumentFragment();
        for (const match of original.matchAll(/\S+|\s+/g)) {
            if (/^\s+$/.test(match[0])) { content.append(document.createTextNode(match[0])); continue; }
            const word = document.createElement('span');
            word.className = `${prefix}-word`;
            const ink = document.createElement('span');
            ink.className = `${prefix}-word-text`;
            ink.textContent = match[0];
            const cipher = document.createElement('span');
            cipher.className = `${prefix}-cipher`;
            cipher.setAttribute('aria-hidden', 'true');
            word.append(ink, cipher);
            if (specialties.some(phrase => match.index >= phrase.index && match.index < phrase.index + phrase[0].length)) word.classList.add('is-specialty');
            words.push(word);
            content.append(word);
        }
        description.replaceChildren(content);
        const seed = Math.floor(Math.random() * 0x100000000);
        let scramble;
        let pointer = false;
        let last = '';
        const reset = () => {
            words.forEach(word => {
                word.classList.remove('is-decoding');
                word.lastElementChild.removeAttribute('data-scramble');
            });
            description.dataset.textState = 'complete';
            last = '';
        };
        const blocked = () => {
            const selection = window.getSelection();
            return pointer || description.contains(document.activeElement) || options.blocked?.()
                || (selection && !selection.isCollapsed && selection.containsNode(description, true));
        };
        const measure = () => {
            scramble = window.createCodingWordScrambler(words, seed);
            last = '';
            return { y: motion.top(description) };
        };
        const paint = p => {
            const tick = Math.floor(p * 1080 / 45);
            const key = `${tick}:${p === 0 || p === 1}`;
            if (key === last) return;
            last = key;
            const elapsed = tick * 45;
            words.forEach((word, index) => {
                const start = 135 + 630 * index / Math.max(1, words.length - 1);
                scramble?.(word, p > 0 && p < 1 && elapsed >= start && elapsed < start + 315, tick);
            });
            description.dataset.textState = p > 0 && p < 1 ? 'scrubbing' : p === 0 ? 'idle' : 'complete';
        };
        description.addEventListener('pointerdown', () => { pointer = true; reset(); motion.schedule(); });
        const release = () => { pointer = false; motion.schedule(); };
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', release);
        window.addEventListener('blur', release);
        document.addEventListener('selectionchange', motion.schedule);
        description.addEventListener('focusin', () => { reset(); motion.schedule(); });
        description.addEventListener('focusout', motion.schedule);
        reset();
        motion.add({ anchor: description, hero: options.hero, measure, progress: options.progress, blocked, paint, reset });
        return { reset };
    };
})();
