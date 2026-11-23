(() => {
    'use strict';
    const motion = window.scrollMotion;
    const figure = document.querySelector('.fact-figure[data-count]');
    if (motion) {
        const hero = [...document.querySelectorAll('.home-intro h1, .home-intro .lead, .hero-links .text-link, .field-image')];
        hero.forEach((element, index) => motion.lift(element, { hero: true, index, count: hero.length, opacity: 0.8 }));
        motion.add({ anchor: figure, paint: p => {
            const value = String(Math.round(1 + (Number(figure.dataset.count) - 1) * (1 - (1 - p) ** 3)));
            if (figure.textContent !== value) figure.textContent = value;
        }, reset: () => { figure.textContent = figure.dataset.count; } });
        document.querySelectorAll('[data-reveal]').forEach(element => motion.lift(element, { opacity: 0.8 }));
        document.querySelectorAll('.team-figure').forEach((element, index) => motion.image(element, { caption: true, index, count: 2 }));
        const anchor = document.querySelector('.purpose-band');
        const statements = [...document.querySelectorAll('.statement h3, .statement p')];
        motion.line(document.querySelector('.purpose-link > span'), { anchor, index: 0, count: statements.length + 1 });
        statements.forEach((element, index) => motion.lift(element, { anchor, index: index + 1, count: statements.length + 1, opacity: 0.6 }));
    }
    // The complete diagram is the no-JS default. Enhancement makes the four disciplines
    // cumulative: the nearest row to the reading line selects the stage, in either direction.
    const story = document.querySelector('[data-discipline-story]');
    if (story && motion) {
        const rows = [...story.querySelectorAll('.discipline-row[data-stage]')];
        const visual = story.querySelector('[data-discipline-visual]');
        const layers = [...story.querySelectorAll('[data-layer]')];
        const status = story.querySelector('[data-entry-status]');
        const caption = story.querySelector('[data-entry-caption]');
        const count = story.querySelector('[data-entry-count]');
        const progress = story.querySelector('[data-entry-progress]');
        const entrantOffsets = [0, 42, 94, 148];
        let active = -1;
        let geometry;
        const showStage = index => {
            index = Math.max(0, Math.min(rows.length - 1, index));
            if (index === active) return;
            active = index;
            rows.forEach((row, rowIndex) => {
                row.classList.toggle('is-active', rowIndex === index);
                if (rowIndex === index) row.setAttribute('aria-current', 'step');
                else row.removeAttribute('aria-current');
            });
            layers.forEach(layer => layer.classList.toggle('is-visible', Number(layer.dataset.layer) <= index));
            visual.dataset.step = String(index);
            status.textContent = rows[index].dataset.stage;
            caption.textContent = `${rows[index].dataset.caption}.`;
            count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(rows.length).padStart(2, '0')}`;
        };
        const paintStage = stage => {
            showStage(Math.round(stage));
            layers.forEach(layer => {
                const p = Number(layer.dataset.layer) === 0 ? 1 : motion.clamp(stage - Number(layer.dataset.layer) + 1);
                motion.style(layer, 'opacity', String(p));
                motion.style(layer, 'transform', `translateY(${(18 * (1 - p)).toFixed(4)}px)`);
            });
            rows.forEach((row, index) => motion.style(row, 'opacity', String(0.38 + 0.62 * (1 - Math.min(1, Math.abs(stage - index))))));
            const lower = Math.floor(stage);
            const offset = entrantOffsets[lower] + (entrantOffsets[Math.min(3, lower + 1)] - entrantOffsets[lower]) * (stage - lower);
            motion.style(progress, 'transform', `scaleX(${((stage + 1) / rows.length).toFixed(5)})`);
            motion.style(visual, '--entrant-offset', `${offset.toFixed(4)}px`);
        };
        motion.add({ anchor: story,
            prepare: () => {
                // Reserve the largest caption at this layout width before measuring anchors.
                const probe = caption.cloneNode(false);
                probe.removeAttribute('data-entry-caption');
                probe.setAttribute('aria-hidden', 'true');
                probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;width:${caption.getBoundingClientRect().width}px;min-height:0;`;
                caption.parentElement.append(probe);
                let height = 0;
                rows.forEach(row => {
                    probe.textContent = `${row.dataset.caption}.`;
                    height = Math.max(height, probe.getBoundingClientRect().height);
                });
                probe.remove();
                motion.style(caption, 'min-height', `${height}px`);
                if (matchMedia('(max-width: 60rem)').matches) {
                    const diagram = visual.querySelector('.entry-diagram');
                    const chrome = visual.getBoundingClientRect().height - diagram.getBoundingClientRect().height;
                    motion.style(visual, '--entry-chrome-height', `${chrome + 1}px`);
                } else visual.style.removeProperty('--entry-chrome-height');
            },
            measure: env => {
                const compact = matchMedia('(max-width: 60rem)').matches;
                const height = visual.offsetHeight;
                geometry = { static: getComputedStyle(visual).position !== 'sticky',
                    line: compact ? height + (env.height - height) * 0.45 : env.height * 0.5,
                    centers: rows.map(row => motion.top(row) + row.offsetHeight * 0.5) };
                return geometry;
            },
            progress: (g, env) => {
                if (g.static) return 3;
                const position = env.scroll + g.line;
                let stage = 0;
                for (let i = 0; i < g.centers.length - 1; i++) {
                    if (position >= g.centers[i]) stage = i + motion.clamp((position - g.centers[i]) / Math.max(1, g.centers[i + 1] - g.centers[i]));
                }
                return stage;
            },
            paint: stage => {
                story.classList.toggle('is-static', geometry.static);
                story.classList.toggle('is-enhanced', !geometry.static);
                paintStage(stage);
                if (geometry.static) rows.forEach(row => row.style.removeProperty('opacity'));
            },
            reset: () => {
                story.classList.remove('is-enhanced');
                paintStage(3);
                [...rows, ...layers, progress].forEach(element => { element.style.removeProperty('opacity'); element.style.removeProperty('transform'); });
                visual.style.removeProperty('--entrant-offset');
            }
        });
    }
    // Title, description and rail share the chapter's position, in either direction.
    const company = document.querySelector('[data-company-story]');
    if (company && motion) {
        const layout = company.querySelector('.company-layout');
        const heading = company.querySelector('.company-about');
        const readout = company.querySelector('.company-readout');
        const description = company.querySelector('[data-company-description]');
        const rail = readout.querySelector('.company-scan-track span');
        let geometry;
        const chapter = env => motion.clamp((env.scroll - geometry.y) / geometry.travel);
        const textProgress = (g, env) => geometry.pinned ? chapter(env) : motion.entry(g.y, env);
        motion.add({ anchor: company,
            prepare: () => {
                const style = getComputedStyle(layout);
                const contentHeight = Math.max(heading.offsetHeight, readout.offsetHeight) + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
                company.classList.toggle('is-pinned', matchMedia('(min-width: 60.001rem)').matches && contentHeight <= innerHeight);
            },
            measure: () => {
                geometry = { y: motion.top(company), heading: motion.top(heading), text: motion.top(description),
                    travel: Math.max(1, company.offsetHeight - layout.offsetHeight), pinned: company.classList.contains('is-pinned') };
                return geometry;
            },
            progress: (g, env) => g.pinned ? motion.clamp(chapter(env) / 0.9) : motion.clamp((env.height * 0.85 - g.heading + env.scroll) / (env.height * 0.5)),
            paint: (p, env) => {
                motion.style(company, '--company-wipe', `${((1 - p) * 100).toFixed(3)}%`);
                motion.style(company, '--company-progress', p.toFixed(5));
                motion.style(rail, 'transform', `scaleY(${textProgress({ y: geometry.text }, env).toFixed(5)})`);
            },
            reset: () => {
                // Keep pin geometry during tab suspension; reduced motion explicitly unpins.
                if (matchMedia('(prefers-reduced-motion: reduce)').matches) company.classList.remove('is-pinned');
                company.style.removeProperty('--company-wipe');
                company.style.removeProperty('--company-progress');
                rail.style.removeProperty('transform');
            }
        });
        window.createScrollCodingText?.(description, 'company', { progress: textProgress });
        if ('ResizeObserver' in window) {
            const sizing = new ResizeObserver(motion.invalidate);
            sizing.observe(readout);
            sizing.observe(heading);
        }
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
