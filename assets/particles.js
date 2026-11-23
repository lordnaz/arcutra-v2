(() => {
    'use strict';
    if (!document.querySelector('[data-particles]')) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const mouse = matchMedia('(hover: hover) and (pointer: fine)');
    const tokens = getComputedStyle(document.documentElement);
    const spacing = Math.max(12, parseFloat(tokens.getPropertyValue('--particle-spacing')) || 18);
    const dotRadius = parseFloat(tokens.getPropertyValue('--particle-radius')) || 0.85;
    const reach = 160;
    const push = 36;
    const drag = 18;
    // Quadratic falloff contains the stronger displacement inside the response radius.
    const size = Math.ceil((reach + spacing * 3) * 2 / spacing) * spacing;
    const layer = document.createElement('div');
    layer.className = 'particle-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.hidden = true;
    const canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const context = canvas.getContext('2d');
    if (!context) return;
    layer.append(canvas);
    canvas.style.width = canvas.style.height = `${size}px`;
    let field = null;
    let points = new Map();
    let frame = 0;
    let previousTime = 0;
    let originX = NaN;
    let originY = NaN;
    let color;
    let idleAlpha = 0.2;
    let pageActive = true;
    const pointer = { x: 0, y: 0, driftX: 0, driftY: 0, time: 0, active: false };
    const allowed = () => pageActive && !document.hidden && !reduced.matches && mouse.matches;

    const reset = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        pointer.active = false;
        pointer.driftX = pointer.driftY = pointer.time = 0;
        layer.hidden = true;
        points.clear();
        originX = originY = NaN;
    };
    // A single bounded canvas follows the cursor between sections, not the page height.
    // The CSS grid remains the resting/no-JS/mobile/reduced-motion background everywhere.
    const positionPatch = () => {
        const x = Math.floor((pointer.x - size / 2) / spacing) * spacing;
        const y = Math.floor((pointer.y - size / 2) / spacing) * spacing;
        if (x === originX && y === originY) return;
        const next = new Map();
        for (let row = spacing / 2; row < size; row += spacing) {
            for (let column = spacing / 2; column < size; column += spacing) {
                const anchorX = x + column;
                const anchorY = y + row;
                const key = `${anchorX}:${anchorY}`;
                next.set(key, points.get(key) || { anchorX, anchorY, x: anchorX, y: anchorY, glow: 0 });
            }
        }
        points = next;
        originX = x;
        originY = y;
        canvas.style.transform = `translate(${x}px, ${y}px)`;
    };
    const step = now => {
        frame = 0;
        if (!allowed() || !field?.isConnected) { reset(); return; }
        const rect = field.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= innerHeight) { reset(); return; }
        positionPatch();
        const elapsed = previousTime ? Math.min(now - previousTime, 48) : 16.67;
        previousTime = now;
        const smoothing = 1 - Math.exp(-elapsed / 65);
        // A short directional wake follows mouse movement, then decays without an idle loop.
        pointer.driftX *= 1 - smoothing;
        pointer.driftY *= 1 - smoothing;
        let settling = Math.hypot(pointer.driftX, pointer.driftY) > 0.02;
        if (!settling) pointer.driftX = pointer.driftY = 0;
        context.clearRect(0, 0, size, size);
        context.fillStyle = color;
        for (const point of points.values()) {
            const dx = point.anchorX - pointer.x;
            const dy = point.anchorY - pointer.y;
            const distance = Math.hypot(dx, dy);
            const influence = pointer.active ? Math.max(0, 1 - distance / reach) ** 2 : 0;
            const targetX = point.anchorX + ((distance > 0.001 ? dx / distance : 1) * push + pointer.driftX) * influence;
            const targetY = point.anchorY + ((distance > 0.001 ? dy / distance : 0) * push + pointer.driftY) * influence;
            point.x += (targetX - point.x) * smoothing;
            point.y += (targetY - point.y) * smoothing;
            point.glow += (influence - point.glow) * smoothing;
            if (Math.abs(targetX - point.x) > 0.02 || Math.abs(targetY - point.y) > 0.02 || Math.abs(influence - point.glow) > 0.002) {
                settling = true;
            } else {
                point.x = targetX;
                point.y = targetY;
                point.glow = influence;
            }
            context.globalAlpha = idleAlpha + point.glow * (1 - idleAlpha);
            context.beginPath();
            context.arc(point.x - originX, point.y - originY, dotRadius + point.glow * 0.85, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
        layer.hidden = false;
        if (settling) frame = requestAnimationFrame(step);
        else {
            previousTime = 0;
            if (!pointer.active) reset();
        }
    };
    const wake = () => { if (!frame && allowed()) frame = requestAnimationFrame(step); };
    const leave = () => {
        if (!pointer.active) return;
        pointer.active = false;
        pointer.driftX = pointer.driftY = pointer.time = 0;
        wake();
    };
    document.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') { reset(); return; }
        if (!allowed()) return;
        const target = event.target instanceof Element ? event.target.closest('[data-particles]') : null;
        if (!target) { leave(); return; }
        if (field !== target || layer.hidden) {
            reset();
            field = target;
            field.append(layer);
            const pixels = Math.round(size * Math.min(devicePixelRatio || 1, 2));
            if (canvas.width !== pixels) canvas.width = canvas.height = pixels;
            context.setTransform(pixels / size, 0, 0, pixels / size, 0, 0);
            const style = getComputedStyle(canvas);
            color = style.color;
            idleAlpha = Math.max(0, Math.min(1, parseFloat(style.getPropertyValue('--particle-idle-alpha')) || 0.2));
        }
        // Match the padding-box origin used by the absolute decorative layer.
        const rect = field.getBoundingClientRect();
        const x = event.clientX - rect.left - field.clientLeft;
        const y = event.clientY - rect.top - field.clientTop;
        if (pointer.active) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const distance = Math.hypot(dx, dy);
            const elapsed = Math.max(16, event.timeStamp - pointer.time);
            const strength = Math.min(drag, distance / elapsed * 12);
            pointer.driftX = distance ? dx / distance * strength : 0;
            pointer.driftY = distance ? dy / distance * strength : 0;
        }
        pointer.x = x;
        pointer.y = y;
        pointer.time = event.timeStamp;
        pointer.active = true;
        wake();
    }, { passive: true });
    document.addEventListener('pointerout', event => { if (!event.relatedTarget) leave(); }, { passive: true });
    document.addEventListener('pointercancel', reset, { passive: true });
    // Scrolling keeps the stationary CSS grid and never starts a second scroll animation.
    window.addEventListener('scroll', reset, { passive: true });
    window.addEventListener('resize', reset, { passive: true });
    window.addEventListener('blur', reset);
    reduced.addEventListener('change', reset);
    mouse.addEventListener('change', reset);
    document.addEventListener('visibilitychange', reset);
    window.addEventListener('pagehide', () => { pageActive = false; reset(); });
    window.addEventListener('pageshow', () => { pageActive = true; reset(); });
})();
