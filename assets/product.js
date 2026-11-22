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
    motion.addEventListener('change', () => {
        if (motion.matches) animations.forEach(animation => animation.cancel());
    });
    // One entrance, after the inherited loader. Content is never hidden at rest,
    // and nothing moves if the visitor has already started scrolling.
    const loader = document.getElementById('site-preloader');
    const entrance = () => {
        if (location.hash || window.scrollY > 24) return;
        document.querySelectorAll('.product-intro h1, .product-intro .lead, .hero-actions .text-link, .field-image').forEach((element, index) => {
            animate(element, [{ transform: 'translateY(12px)', opacity: 0.8 }, { transform: 'none', opacity: 1 }],
                { delay: index * stagger, duration: duration - index * stagger });
        });
    };
    if (!loader || loader.hidden) entrance();
    else {
        const observer = new MutationObserver(() => {
            if (loader.hidden) { observer.disconnect(); entrance(); }
        });
        observer.observe(loader, { attributes: true, attributeFilter: ['hidden'] });
        window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
    }
    // One calm reveal per plate as it first enters view; never tied to scroll position.
    const plates = [...document.querySelectorAll('[data-plate]')];
    if ('IntersectionObserver' in window) {
        const reveal = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                reveal.unobserve(entry.target);
                animate(entry.target, [{ transform: 'translateY(12px)', opacity: 0.8 }, { transform: 'none', opacity: 1 }]);
            });
        }, { threshold: 0.08 });
        plates.forEach(plate => reveal.observe(plate));
        // The ledger index tracks the plate in the reading band; state feedback, not motion.
        const links = [...document.querySelectorAll('.index-link')];
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const link = links.find(candidate => candidate.getAttribute('href') === '#' + entry.target.id);
                if (!link) return;
                if (entry.isIntersecting) {
                    links.forEach(candidate => candidate.removeAttribute('aria-current'));
                    link.setAttribute('aria-current', 'true');
                } else if (link.getAttribute('aria-current') === 'true') {
                    link.removeAttribute('aria-current');
                }
            });
        }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
        plates.forEach(plate => spy.observe(plate));
        window.addEventListener('pagehide', () => { reveal.disconnect(); spy.disconnect(); }, { once: true });
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