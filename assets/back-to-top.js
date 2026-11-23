(() => {
    'use strict';
    const control = document.querySelector('[data-back-to-top]');
    const destination = document.querySelector('#page-top .brand');
    if (!control || !destination) return;

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const tokens = getComputedStyle(document.documentElement);
    const duration = name => {
        const value = tokens.getPropertyValue(name).trim();
        return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
    };
    const shortDuration = duration('--dur-showcase') || 650;
    const longDuration = Math.max(shortDuration, duration('--dur-editorial') || 900);
    let frame = 0;
    let returning = false;

    const updateVisibility = () => {
        const focused = document.activeElement;
        const editing = focused?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
        const visible = !editing && (returning || window.scrollY > Math.max(160, innerHeight / 2) || focused === control);
        control.classList.toggle('is-visible', visible);
        control.tabIndex = visible ? 0 : -1;
        if (visible) control.removeAttribute('aria-hidden');
        else control.setAttribute('aria-hidden', 'true');
    };
    const cancel = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        returning = false;
        control.classList.remove('is-returning');
        updateVisibility();
    };
    const finish = () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        destination.focus({ preventScroll: true });
        cancel();
    };
    control.addEventListener('click', event => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (returning) return;
        if (reduced.matches || window.scrollY <= 1) { finish(); return; }

        returning = true;
        control.classList.add('is-returning');
        updateVisibility();
        const start = window.scrollY;
        const began = performance.now();
        const length = Math.min(longDuration, shortDuration + start / 20);
        const step = now => {
            const progress = Math.min(1, (now - began) / length);
            // A bounded ease-in-out trip; only this explicit action controls the scroll.
            const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
            window.scrollTo({ top: start * (1 - eased), behavior: 'instant' });
            if (progress < 1) frame = requestAnimationFrame(step);
            else finish();
        };
        frame = requestAnimationFrame(step);
    });

    // User input takes priority, without preventing its normal scrolling or navigation.
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    document.addEventListener('pointerdown', event => {
        if (!control.contains(event.target)) cancel();
    }, { passive: true });
    document.addEventListener('keydown', event => {
        if (['Escape', 'Tab', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) cancel();
    });
    document.addEventListener('focusin', event => {
        if (returning && event.target !== control) cancel();
        else updateVisibility();
    });
    document.addEventListener('focusout', () => requestAnimationFrame(updateVisibility));
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', cancel, { passive: true });
    window.addEventListener('blur', cancel);
    window.addEventListener('pagehide', cancel);
    window.addEventListener('pageshow', cancel);
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
    reduced.addEventListener('change', () => {
        if (reduced.matches && returning) finish();
        else cancel();
    });
    control.classList.add('is-enhanced');
    updateVisibility();
})();
