(() => {
    'use strict';
    if (!window.requestAnimationFrame || !window.matchMedia) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const tracks = [];
    const loader = document.getElementById('site-preloader');
    let frame = 0;
    let dirty = true;
    let active = true;
    let settled = false;
    let environment;
    const clamp = value => Math.max(0, Math.min(1, value));
    const style = (element, property, value) => {
        if (element && element.style.getPropertyValue(property) !== value) element.style.setProperty(property, value);
    };
    // Layout offsets exclude transforms, including transforms on animated ancestors.
    const top = element => {
        let value = 0;
        for (let node = element; node; node = node.offsetParent) value += node.offsetTop || 0;
        return value;
    };
    const entry = (y, env) => {
        const start = Math.max(0, Math.min(env.max, y - env.height * 0.9));
        const end = Math.max(0, Math.min(env.max, y - env.height * 0.45));
        return end > start ? clamp((env.scroll - start) / (end - start)) : 1;
    };
    const stagger = (p, index, count) => clamp((p - 0.25 * index / Math.max(1, count - 1)) / 0.75);
    const curve = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').match(/[\d.]+/g)?.map(Number) || [0.16, 1, 0.3, 1];
    const bezier = (t, a, b) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
    const ease = p => {
        if (p <= 0 || p >= 1) return clamp(p);
        let low = 0, high = 1;
        for (let i = 0; i < 18; i++) {
            const t = (low + high) / 2;
            if (bezier(t, curve[0], curve[2]) < p) low = t; else high = t;
        }
        return bezier((low + high) / 2, curve[1], curve[3]);
    };
    const enabled = () => active && !document.hidden && !reduced.matches && (!loader || loader.hidden);
    const fail = track => {
        track.failed = true;
        try { track.reset?.(); } catch { /* Default markup remains the fallback. */ }
    };
    const settle = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        dirty = true;
        if (settled) return;
        settled = true;
        tracks.forEach(track => { try { track.reset?.(); } catch { fail(track); } });
    };
    const paint = () => {
        frame = 0;
        if (!enabled()) { settle(); return; }
        settled = false;
        if (dirty) {
            dirty = false;
            // Pinning is a layout decision. Apply it before the batched measurements.
            tracks.forEach(track => { if (!track.failed) { try { track.prepare?.(); } catch { fail(track); } } });
            environment = { height: innerHeight, max: Math.max(0, document.documentElement.scrollHeight - innerHeight), scroll: scrollY };
            tracks.forEach(track => {
                if (track.failed) return;
                try { track.geometry = track.measure ? track.measure(environment) : { y: top(track.anchor) }; }
                catch { fail(track); }
            });
        }
        const env = { ...environment, scroll: scrollY };
        // Read interaction state for all effects before writing any visual state.
        const updates = tracks.filter(track => !track.failed).map(track => {
            try {
                const geometry = track.geometry;
                const p = track.progress ? track.progress(geometry, env)
                    : track.hero && geometry.y < env.height
                        ? (env.max ? clamp(env.scroll / Math.min(env.height * 0.25, env.max)) : 1)
                        : entry(geometry.y, env);
                return [track, track.blocked?.() ? 1 : p];
            } catch { fail(track); return [track, 1]; }
        });
        updates.forEach(([track, p]) => { if (!track.failed) { try { track.paint(p, env); } catch { fail(track); } } });
    };
    const schedule = () => {
        if (!enabled()) { settle(); return; }
        if (!frame) frame = requestAnimationFrame(paint);
    };
    const invalidate = () => { dirty = true; schedule(); };
    const sizing = 'ResizeObserver' in window ? new ResizeObserver(invalidate) : null;
    const add = track => {
        if (!track.anchor) return;
        tracks.push(track);
        sizing?.observe(track.anchor);
        settled = false;
        invalidate();
    };
    // Each helper owns only the properties it changes, so reset never erases other styling.
    const effect = (elements, options, render) => {
        elements = elements.filter(Boolean);
        const originals = elements.map(element => ['transform', 'opacity'].map(property => [property, element.style.getPropertyValue(property)]));
        add({ ...options, paint: p => render(p), reset: () => elements.forEach((element, i) => originals[i].forEach(([property, value]) => {
            if (value) style(element, property, value); else element.style.removeProperty(property);
        })) });
    };
    const lift = (element, options = {}) => {
        if (!element) return;
        effect([element], { anchor: element, ...options }, p => {
            const q = ease(options.index === undefined ? p : stagger(p, options.index, options.count));
            style(element, 'transform', `translateY(${(12 * (1 - q)).toFixed(4)}px)`);
            style(element, 'opacity', String((options.opacity ?? 0.7) + (1 - (options.opacity ?? 0.7)) * q));
        });
    };
    const line = (element, options = {}) => {
        if (!element) return;
        effect([element], { anchor: element.parentElement, ...options }, p => {
            const q = options.index === undefined ? p : stagger(p, options.index, options.count);
            style(element, 'transform', `scaleX(${q.toFixed(5)})`);
        });
    };
    const image = (anchor, options = {}) => {
        if (!anchor) return;
        const photo = anchor.querySelector('img');
        const corners = [...anchor.querySelectorAll('.technical-corner, .team-corner')];
        const caption = options.caption ? anchor.querySelector('figcaption') : null;
        effect([photo, ...corners, caption], { anchor, ...options }, p => {
            const q = ease(options.index === undefined ? p : stagger(p, options.index, options.count));
            // An unloaded/error image never traps the other effects or schedules an idle loop.
            const ready = photo?.complete && photo.naturalWidth;
            style(photo, 'transform', `scale(${(1 + ((options.scale ?? 1.04) - 1) * (1 - (ready ? q : 1))).toFixed(5)})`);
            corners.forEach(corner => {
                style(corner, 'transform', `scale(${(0.7 + 0.3 * q).toFixed(5)})`);
                style(corner, 'opacity', String(q));
            });
            if (caption) {
                style(caption, 'transform', `translateY(${(12 * (1 - q)).toFixed(4)}px)`);
                style(caption, 'opacity', String(0.6 + 0.4 * q));
            }
        });
    };
    const wipe = (mask, options = {}) => {
        if (!mask) return;
        effect([mask, mask.firstElementChild], { anchor: mask.parentElement, hero: true, ...options }, p => {
            style(mask, 'transform', `translateX(${(-100 * (1 - p)).toFixed(4)}%)`);
            style(mask.firstElementChild, 'transform', `translateX(${(100 * (1 - p)).toFixed(4)}%)`);
        });
    };
    window.scrollMotion = { add, invalidate, schedule, clamp, top, entry, stagger, ease, style, lift, line, image, wipe };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', invalidate);
    window.addEventListener('pageshow', () => { active = true; invalidate(); });
    window.addEventListener('pagehide', () => { active = false; settle(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); else invalidate(); });
    document.addEventListener('load', invalidate, true);
    document.addEventListener('error', invalidate, true);
    reduced.addEventListener('change', invalidate);
    sizing?.observe(document.body);
    if (document.fonts) {
        document.fonts.ready.then(invalidate);
        document.fonts.addEventListener('loadingdone', invalidate);
    }
    if (loader) new MutationObserver(invalidate).observe(loader, { attributes: true, attributeFilter: ['hidden'] });
})();
