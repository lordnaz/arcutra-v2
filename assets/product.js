(() => {
    'use strict';
    const motion = window.scrollMotion;
    if (motion) {
        motion.wipe(document.querySelector('.product-title-mask'));
        window.createScrollCodingText?.(document.querySelector('[data-product-description]'), 'product', { hero: true });
        motion.lift(document.querySelector('.hero-actions .text-link'), { hero: true, index: 1, count: 2 });
        motion.image(document.querySelector('.field-image .technical-frame'), { hero: true });
        document.querySelectorAll('[data-plate]').forEach(plate => {
            const frame = plate.querySelector('.technical-frame');
            motion.image(frame, { anchor: plate, scale: frame.closest('.specimen') ? 0.98 : 1.04, index: 0, count: 2 });
            motion.lift(plate.querySelector('.plate-details'), { anchor: plate, index: 1, count: 2 });
        });
        const anchor = document.querySelector('.ask-section');
        const elements = [...document.querySelectorAll('.ask-title h2, .ask-title p, .ask-side')];
        motion.line(document.querySelector('.ask-line > span'), { anchor, index: 0, count: elements.length + 1 });
        elements.forEach((element, index) => motion.lift(element, { anchor, index: index + 1, count: elements.length + 1 }));
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