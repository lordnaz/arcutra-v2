(() => {
    'use strict';
    const meter = document.querySelector('[data-scroll-meter]');
    const readout = meter?.querySelector('[data-scroll-percent]');
    if (!meter || !readout) return;
    const parts = meter.querySelectorAll('.scroll-meter-label, .scroll-meter-track, .scroll-meter-marker, .scroll-meter-current');
    const lightSections = '.company-section, .work-section, .catalog-section, .office-section';
    let frame = 0;
    let active = true;
    let previous = -1;
    let previousPercent = -1;

    const update = () => {
        frame = 0;
        if (!active || document.hidden) return;
        const range = Math.max(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
        const progress = range ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
        const percent = Math.round(progress * 100);
        meter.hidden = range === 0;
        if (progress !== previous) {
            meter.style.setProperty('--scroll-progress', String(progress));
            previous = progress;
        }
        if (percent !== previousPercent) {
            readout.textContent = `${percent}%`;
            meter.setAttribute('aria-valuenow', String(percent));
            previousPercent = percent;
        }
        // Sample each part separately so labels remain readable across section boundaries.
        for (const part of parts) {
            const rect = part.getBoundingClientRect();
            if (!rect.width || !rect.height) continue;
            const surface = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('[data-particles]');
            part.classList.toggle('is-over-light', Boolean(surface?.matches(lightSections)));
        }
    };
    const schedule = () => {
        if (active && !document.hidden && !frame) frame = requestAnimationFrame(update);
    };
    const pause = () => {
        cancelAnimationFrame(frame);
        frame = 0;
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule);
    window.addEventListener('pageshow', () => { active = true; schedule(); });
    window.addEventListener('pagehide', () => { active = false; pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else schedule(); });
    // Lazy images, expanding content, fonts, and viewport changes can alter the scroll range.
    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(schedule);
        observer.observe(document.body);
        observer.observe(document.documentElement);
    }
    if (document.fonts) document.fonts.ready.then(schedule);
    update();
})();
