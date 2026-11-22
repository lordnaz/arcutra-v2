(() => {
    'use strict';
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    const timing = getComputedStyle(document.documentElement);
    const duration = parseFloat(timing.getPropertyValue('--dur-editorial')) || 900;
    const stagger = parseFloat(timing.getPropertyValue('--dur-stagger')) || 90;
    const easing = timing.getPropertyValue('--ease-out').trim();
    const animate = (element, frames, options = {}) => {
        if (motion.matches || !element.animate) return;
        const animation = element.animate(frames, { duration, easing, ...options });
        animations.add(animation);
        animation.finished.catch(() => {}).finally(() => animations.delete(animation));
    };
    // One count from 1 up to the published figure when it first comes into view. The markup
    // holds the final value, so it stands without scripting and under reduced motion.
    const figure = document.querySelector('.fact-figure[data-count]');
    let countFrame = 0;
    const settleCount = () => {
        cancelAnimationFrame(countFrame);
        if (figure) figure.textContent = figure.dataset.count;
    };
    const count = () => {
        const target = Number(figure.dataset.count);
        if (motion.matches || !(target > 1)) return;
        const span = duration * 2;
        let start = 0;
        const step = now => {
            start ||= now;
            const progress = Math.min((now - start) / span, 1);
            const value = String(Math.round(1 + (target - 1) * (1 - (1 - progress) ** 3)));
            if (figure.textContent !== value) figure.textContent = value;
            if (progress < 1) countFrame = requestAnimationFrame(step);
        };
        figure.textContent = '1';
        countFrame = requestAnimationFrame(step);
    };
    const watchCount = () => {
        if (!figure || !('IntersectionObserver' in window)) return;
        const seen = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            seen.disconnect();
            count();
        });
        seen.observe(figure);
        window.addEventListener('pagehide', () => { seen.disconnect(); settleCount(); }, { once: true });
    };
    motion.addEventListener('change', () => {
        if (!motion.matches) return;
        animations.forEach(animation => animation.cancel());
        settleCount();
    });
    // One entrance, after the inherited loader. Content is never hidden at rest,
    // and nothing moves if the visitor has already started scrolling.
    const loader = document.getElementById('site-preloader');
    const entrance = () => {
        if (location.hash || window.scrollY > 24) return;
        document.querySelectorAll('.home-intro h1, .home-intro .lead, .hero-links .text-link, .field-image').forEach((element, index) => {
            animate(element, [{ transform: 'translateY(12px)', opacity: 0.8 }, { transform: 'none', opacity: 1 }],
                { delay: index * stagger, duration: duration - index * stagger });
        });
    };
    const afterLoader = () => { entrance(); watchCount(); };
    if (!loader || loader.hidden) afterLoader();
    else {
        const observer = new MutationObserver(() => {
            if (loader.hidden) { observer.disconnect(); afterLoader(); }
        });
        observer.observe(loader, { attributes: true, attributeFilter: ['hidden'] });
        window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
    }
    // One calm reveal per marked block as it first enters view; never tied to scroll position.
    if ('IntersectionObserver' in window) {
        const reveal = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                reveal.unobserve(entry.target);
                animate(entry.target, [{ transform: 'translateY(12px)', opacity: 0.8 }, { transform: 'none', opacity: 1 }]);
            });
        }, { threshold: 0.08 });
        document.querySelectorAll('[data-reveal]').forEach(element => reveal.observe(element));
        window.addEventListener('pagehide', () => reveal.disconnect(), { once: true });
    }
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