(() => {
    'use strict';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    const timing = getComputedStyle(document.documentElement);
    const duration = parseFloat(timing.getPropertyValue('--dur-showcase')) || 650;
    const stagger = parseFloat(timing.getPropertyValue('--dur-micro')) || 120;
    const lineDuration = parseFloat(timing.getPropertyValue('--dur-long')) || 420;
    const easing = timing.getPropertyValue('--ease-out').trim();
    const animate = (element, frames, options = {}) => {
        if (motion.matches || document.hidden || !element?.animate) return;
        const animation = element.animate(frames, { duration, easing, fill: 'backwards', ...options });
        animations.add(animation);
        animation.finished.catch(() => {}).finally(() => animations.delete(animation));
        return animation;
    };
    const lift = [{ transform: 'translateY(12px)', opacity: 0.7 }, { transform: 'none', opacity: 1 }];
    const visible = element => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < innerHeight;
    };
    const revealImage = frame => {
        const image = frame.querySelector('img');
        const play = () => {
            if (!visible(frame)) return;
            const scale = frame.closest('.specimen') ? 0.98 : 1.04;
            animate(image, [{ transform: `scale(${scale})` }, { transform: 'none' }]);
            frame.querySelectorAll('.technical-corner').forEach(corner => {
                animate(corner, [{ transform: 'scale(0.7)', opacity: 0 }, { transform: 'none', opacity: 1 }]);
            });
        };
        if (image.complete) { if (image.naturalWidth) play(); }
        else image.addEventListener('load', play, { once: true });
    };
    // Original word nodes remain selectable and accessible; only decorative overlays scramble.
    const description = document.querySelector('[data-product-description]');
    const words = [];
    const content = document.createDocumentFragment();
    for (const part of description.textContent.match(/\S+|\s+/g) || []) {
        if (/^\s+$/.test(part)) { content.append(document.createTextNode(part)); continue; }
        const word = document.createElement('span');
        word.className = 'product-word';
        const text = document.createElement('span');
        text.className = 'product-word-text';
        text.textContent = part;
        const cipher = document.createElement('span');
        cipher.className = 'product-cipher';
        cipher.setAttribute('aria-hidden', 'true');
        word.append(text, cipher);
        content.append(word);
        words.push(word);
    }
    description.replaceChildren(content);
    let decodeFrame = 0;
    const settleText = () => {
        cancelAnimationFrame(decodeFrame);
        decodeFrame = 0;
        words.forEach(word => {
            word.classList.remove('is-decoding');
            word.lastElementChild.removeAttribute('data-scramble');
        });
        description.dataset.textState = 'complete';
    };
    const decodeText = () => {
        if (motion.matches || !description.animate || document.hidden || !visible(description) || !window.createCodingWordScrambler) return;
        description.dataset.textState = 'running';
        const scrambleWord = window.createCodingWordScrambler(words);
        const start = performance.now();
        const total = 1080;
        let lastTick = -1;
        const step = now => {
            const elapsed = now - start;
            if (elapsed >= total || !visible(description)) { settleText(); return; }
            const tick = Math.floor(elapsed / 45);
            if (tick !== lastTick) {
                lastTick = tick;
                words.forEach((word, index) => {
                    const progress = Math.max(0, Math.min(1, (elapsed - 135 - 630 * index / Math.max(1, words.length - 1)) / 315));
                    scrambleWord(word, progress < 1);
                });
            }
            decodeFrame = requestAnimationFrame(step);
        };
        step(start);
    };
    settleText();
    const settleMotion = () => {
        animations.forEach(animation => animation.cancel());
        animations.clear();
        settleText();
    };
    motion.addEventListener('change', () => { if (motion.matches) settleMotion(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) settleMotion(); });
    window.addEventListener('pagehide', settleMotion);
    window.addEventListener('pageshow', event => { if (event.persisted) settleMotion(); });
    // One entrance, after the inherited loader. Content is never hidden at rest,
    // and nothing moves if the visitor has already started scrolling.
    const loader = document.getElementById('site-preloader');
    const entrance = () => {
        if (location.hash || window.scrollY > 24) return;
        const mask = document.querySelector('.product-title-mask');
        animate(mask, [{ transform: 'translateX(-100%)' }, { transform: 'none' }]);
        animate(mask.firstElementChild, [{ transform: 'translateX(100%)' }, { transform: 'none' }]);
        decodeText();
        animate(document.querySelector('.hero-actions .text-link'), lift, { delay: stagger });
        revealImage(document.querySelector('.field-image .technical-frame'));
    };
    if (!loader || loader.hidden) entrance();
    else {
        const observer = new MutationObserver(() => {
            if (loader.hidden) { observer.disconnect(); entrance(); }
        });
        observer.observe(loader, { attributes: true, attributeFilter: ['hidden'] });
        window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
    }
    // Each visible piece enters once; model text and links never scramble or wait for scrolling.
    if ('IntersectionObserver' in window) {
        const reveal = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.intersectionRatio < 0.15) return;
                const target = entry.target;
                reveal.unobserve(target);
                if (target.matches('.technical-frame')) revealImage(target);
                else if (target.matches('.ask-line')) {
                    animate(target.firstElementChild, [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: lineDuration });
                } else animate(target, lift, { delay: target.closest('.ask-section') ? lineDuration : stagger });
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.plate-figure .technical-frame, .plate-details, .ask-line, .ask-title h2, .ask-title p, .ask-side').forEach(element => reveal.observe(element));
    }
    // Native anchors remain the navigation. The compact picker is an enhancement of an open list.
    const plates = [...document.querySelectorAll('[data-plate]')];
    const links = [...document.querySelectorAll('.index-link')];
    const index = document.querySelector('.catalog-index');
    const picker = document.querySelector('.catalog-picker');
    const compact = matchMedia('(max-width: 60rem)');
    const meter = document.querySelector('.catalog-meter');
    const position = document.querySelector('[data-catalog-position]');
    const progress = document.querySelector('.catalog-progress > span');
    let current = -2;
    let indexFrame = 0;
    const updateIndex = () => {
        indexFrame = 0;
        const readingLine = compact.matches ? Math.max(144, innerHeight * 0.4) : innerHeight * 0.45;
        const active = plates.findIndex(plate => {
            const rect = plate.getBoundingClientRect();
            return rect.top <= readingLine && rect.bottom > readingLine;
        });
        if (active === current) return;
        current = active;
        links.forEach((link, number) => {
            if (number === active) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
        position.textContent = `${active < 0 ? '—' : String(active + 1).padStart(2, '0')} / ${String(plates.length).padStart(2, '0')}`;
        progress.style.transform = `scaleX(${(active + 1) / plates.length})`;
    };
    const scheduleIndex = () => { if (!indexFrame) indexFrame = requestAnimationFrame(updateIndex); };
    const sizePicker = () => { picker.open = !compact.matches; scheduleIndex(); };
    index.classList.add('is-enhanced');
    meter.hidden = false;
    sizePicker();
    compact.addEventListener('change', sizePicker);
    picker.addEventListener('click', event => {
        const link = event.target.closest('.index-link');
        if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (compact.matches) picker.open = false;
        document.querySelector(link.getAttribute('href'))?.focus({ preventScroll: true });
    });
    picker.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !compact.matches || !picker.open) return;
        picker.open = false;
        picker.querySelector('summary').focus();
    });
    window.addEventListener('scroll', scheduleIndex, { passive: true });
    window.addEventListener('resize', scheduleIndex);
    window.addEventListener('pageshow', scheduleIndex);
    window.addEventListener('pagehide', () => { cancelAnimationFrame(indexFrame); indexFrame = 0; });
    if (document.fonts) document.fonts.ready.then(scheduleIndex);
    updateIndex();
    const training = document.querySelector('.training-nav');
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && training.open) {
            training.open = false;
            training.querySelector('summary').focus();
        }
    });
    document.addEventListener('click', event => {
        if (!training.contains(event.target)) training.open = false;
    });
})();