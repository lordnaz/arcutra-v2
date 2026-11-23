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
        return animation;
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
    // People and purpose enter once in their own reading order, without pinning or hidden defaults.
    if ('IntersectionObserver' in window) {
        const showcaseDuration = parseFloat(timing.getPropertyValue('--dur-showcase')) || 650;
        const showcaseStagger = parseFloat(timing.getPropertyValue('--dur-micro')) || 120;
        const lineDuration = parseFloat(timing.getPropertyValue('--dur-long')) || 420;
        const showcaseAnimations = new Set();
        const playShowcase = (element, frames, options = {}) => {
            const animation = animate(element, frames, { duration: showcaseDuration, fill: 'backwards', ...options });
            if (!animation) return;
            showcaseAnimations.add(animation);
            animation.finished.catch(() => {}).finally(() => showcaseAnimations.delete(animation));
        };
        const lift = [{ transform: 'translateY(12px)', opacity: 0.6 }, { transform: 'none', opacity: 1 }];
        const showcase = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.intersectionRatio < 0.15) return;
                const target = entry.target;
                showcase.unobserve(target);
                if (motion.matches || document.hidden) return;
                if (target.matches('.team-figure')) {
                    const image = target.querySelector('img');
                    const revealPhoto = () => {
                        const rect = target.getBoundingClientRect();
                        if (document.hidden || rect.bottom <= 0 || rect.top >= innerHeight) return;
                        const delay = target.dataset.team === 'project' ? showcaseStagger : 0;
                        playShowcase(image, [{ transform: 'scale(1.04)' }, { transform: 'none' }], { delay });
                        target.querySelectorAll('.team-corner').forEach(corner => {
                            playShowcase(corner, [{ transform: 'scale(0.7)', opacity: 0 }, { transform: 'none', opacity: 1 }], { delay });
                        });
                        playShowcase(target.querySelector('figcaption'), lift, { delay });
                    };
                    if (image.complete) { if (image.naturalWidth) revealPhoto(); }
                    else image.addEventListener('load', revealPhoto, { once: true });
                } else if (target.matches('.purpose-link')) {
                    playShowcase(target.firstElementChild, [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: lineDuration });
                } else {
                    const delay = lineDuration + (target.nextElementSibling ? 0 : showcaseStagger);
                    playShowcase(target.querySelector('h3'), lift, { delay });
                    playShowcase(target.querySelector('p'), lift, { delay: delay + showcaseStagger });
                }
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.team-figure, .purpose-link, .statement').forEach(element => showcase.observe(element));
        const settleShowcase = () => {
            showcaseAnimations.forEach(animation => animation.cancel());
            showcaseAnimations.clear();
        };
        window.addEventListener('pagehide', settleShowcase);
        document.addEventListener('visibilitychange', () => { if (document.hidden) settleShowcase(); });
    }
    // The complete diagram is the no-JS default. Enhancement makes the four disciplines
    // cumulative: the nearest row to the reading line selects the stage, in either direction.
    const story = document.querySelector('[data-discipline-story]');
    if (story) {
        const rows = [...story.querySelectorAll('.discipline-row[data-stage]')];
        const visual = story.querySelector('[data-discipline-visual]');
        const layers = [...story.querySelectorAll('[data-layer]')];
        const status = story.querySelector('[data-entry-status]');
        const caption = story.querySelector('[data-entry-caption]');
        const count = story.querySelector('[data-entry-count]');
        const progress = story.querySelector('[data-entry-progress]');
        const entrantOffsets = [0, 42, 94, 148];
        let active = -1;
        let storyFrame = 0;
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
            progress.style.transform = `scaleX(${(index + 1) / rows.length})`;
            visual.style.setProperty('--entrant-offset', `${entrantOffsets[index]}px`);
        };
        const updateStory = () => {
            storyFrame = 0;
            const compact = window.matchMedia('(max-width: 60rem)').matches;
            const staticDiagram = getComputedStyle(visual).position !== 'sticky';
            story.classList.toggle('is-static', staticDiagram);
            if (staticDiagram) { showStage(rows.length - 1); return; }
            const visualHeight = compact ? visual.getBoundingClientRect().height : 0;
            const readingLine = compact
                ? visualHeight + Math.max(window.innerHeight - visualHeight, 1) * 0.45
                : window.innerHeight * 0.5;
            let nearest = 0;
            let distance = Infinity;
            rows.forEach((row, index) => {
                const rect = row.getBoundingClientRect();
                const nextDistance = Math.abs(rect.top + rect.height * 0.5 - readingLine);
                if (nextDistance < distance) { nearest = index; distance = nextDistance; }
            });
            showStage(nearest);
        };
        const requestStoryUpdate = () => {
            if (!storyFrame) storyFrame = requestAnimationFrame(updateStory);
        };
        story.classList.add('is-enhanced');
        showStage(0);
        updateStory();
        window.addEventListener('scroll', requestStoryUpdate, { passive: true });
        window.addEventListener('resize', requestStoryUpdate);
        window.addEventListener('pagehide', () => {
            cancelAnimationFrame(storyFrame);
            window.removeEventListener('scroll', requestStoryUpdate);
            window.removeEventListener('resize', requestStoryUpdate);
        }, { once: true });
    }
    // The title stays scroll-scrubbed. The description plays a timed entrance on each
    // visit, preserving every original word and its whitespace for selection and accessibility.
    const company = document.querySelector('[data-company-story]');
    if (company) {
        const layout = company.querySelector('.company-layout');
        const heading = company.querySelector('.company-about');
        const readout = company.querySelector('.company-readout');
        const description = company.querySelector('[data-company-description]');
        const original = description.textContent;
        const specialties = [...original.matchAll(/industrial tank cleaning|authorised gas tester|working at height|rope access technique/g)];
        const words = [];
        const content = document.createDocumentFragment();
        for (const match of original.matchAll(/\S+|\s+/g)) {
            if (/^\s+$/.test(match[0])) {
                content.append(document.createTextNode(match[0]));
                continue;
            }
            const word = document.createElement('span');
            word.className = 'company-word';
            const ink = document.createElement('span');
            ink.className = 'company-word-text';
            ink.textContent = match[0];
            const cipher = document.createElement('span');
            cipher.className = 'company-cipher';
            cipher.setAttribute('aria-hidden', 'true');
            word.append(ink, cipher);
            if (specialties.some(phrase => match.index >= phrase.index && match.index < phrase.index + phrase[0].length)) {
                word.classList.add('is-specialty');
            }
            words.push(word);
            content.append(word);
        }
        description.replaceChildren(content);
        const clamp = value => Math.max(0, Math.min(1, value));
        const textRail = readout.querySelector('.company-scan-track span');
        const canPlayText = 'IntersectionObserver' in window && typeof description.animate === 'function';
        let textVisible = false;
        let textFrame = 0;
        let textClock = null;
        const settleText = (state = 'complete') => {
            cancelAnimationFrame(textFrame);
            textFrame = 0;
            if (textClock) textClock.cancel();
            textClock = null;
            words.forEach(word => {
                word.classList.remove('is-decoding');
                word.lastElementChild.removeAttribute('data-scramble');
            });
            description.dataset.textState = state;
        };
        const playText = () => {
            if (motion.matches || !canPlayText || document.hidden || !window.createCodingWordScrambler) { settleText(); return; }
            settleText('running');
            const scrambleWord = window.createCodingWordScrambler(words);
            const lead = duration * 0.15;
            const wordDuration = duration * 0.35;
            const spread = duration * 0.7;
            const total = lead + spread + wordDuration;
            const clock = textRail.animate(
                [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
                { duration: total, easing: 'linear', fill: 'backwards' });
            textClock = clock;
            let lastTick = -1;
            const decode = () => {
                const elapsed = Number(clock.currentTime) || 0;
                const tick = Math.floor(elapsed / (stagger / 2));
                if (tick !== lastTick) {
                    lastTick = tick;
                    words.forEach((word, index) => {
                        const progress = clamp((elapsed - lead - spread * index / Math.max(1, words.length - 1)) / wordDuration);
                        // Generated content is decorative: the selectable, accessible copy never changes.
                        scrambleWord(word, progress < 1);
                    });
                }
                textFrame = requestAnimationFrame(decode);
            };
            decode();
            clock.finished.then(() => {
                if (textClock === clock) settleText();
            }).catch(() => {});
        };
        settleText();
        if (canPlayText) {
            const textObserver = new IntersectionObserver(entries => {
                const entry = entries[entries.length - 1];
                if (!entry.isIntersecting) {
                    textVisible = false;
                    settleText('idle');
                } else if (entry.intersectionRatio >= 0.35 && !textVisible) {
                    textVisible = true;
                    playText();
                }
            }, { threshold: [0, 0.35] });
            textObserver.observe(description);
        }
        const updateTextMotion = () => {
            if (motion.matches) settleText();
            else if (textVisible) playText();
        };
        motion.addEventListener('change', updateTextMotion);
        // A suspended tab or bfcache restore must never leave a partially revealed paragraph.
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) settleText();
        });
        window.addEventListener('pagehide', () => settleText());
        window.addEventListener('pageshow', event => { if (event.persisted) settleText(); });
        let companyFrame = 0;
        let needsLayout = true;
        let lastWipe = '';
        let lastProgress = '';
        const paintCompany = titleProgress => {
            const wipe = `${((1 - titleProgress) * 100).toFixed(3)}%`;
            const progress = titleProgress.toFixed(4);
            if (wipe !== lastWipe) { company.style.setProperty('--company-wipe', wipe); lastWipe = wipe; }
            if (progress !== lastProgress) { company.style.setProperty('--company-progress', progress); lastProgress = progress; }
        };
        const updateCompany = () => {
            companyFrame = 0;
            if (needsLayout) {
                const style = getComputedStyle(layout);
                const contentHeight = Math.max(heading.offsetHeight, readout.offsetHeight)
                    + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
                const fits = window.matchMedia('(min-width: 60.001rem)').matches && contentHeight <= window.innerHeight;
                company.classList.toggle('is-pinned', fits && !motion.matches);
                needsLayout = false;
            }
            if (motion.matches) { paintCompany(1); return; }
            if (company.classList.contains('is-pinned')) {
                const rect = company.getBoundingClientRect();
                const travel = Math.max(1, rect.height - layout.offsetHeight);
                const progress = clamp(-rect.top / travel);
                paintCompany(clamp(progress / 0.9));
            } else {
                // Small or zoomed screens keep normal document flow; no pinned text can trap content.
                const titleRect = heading.getBoundingClientRect();
                paintCompany(clamp((window.innerHeight * 0.85 - titleRect.top) / (window.innerHeight * 0.5)));
            }
        };
        const scheduleCompany = () => {
            if (!companyFrame) companyFrame = requestAnimationFrame(updateCompany);
        };
        const resizeCompany = () => { needsLayout = true; scheduleCompany(); };
        window.addEventListener('scroll', scheduleCompany, { passive: true });
        window.addEventListener('resize', resizeCompany);
        window.addEventListener('pageshow', resizeCompany);
        window.addEventListener('pagehide', () => { cancelAnimationFrame(companyFrame); companyFrame = 0; });
        motion.addEventListener('change', resizeCompany);
        if ('ResizeObserver' in window) {
            const sizing = new ResizeObserver(resizeCompany);
            sizing.observe(readout);
            sizing.observe(heading);
        }
        if (document.fonts) document.fonts.ready.then(resizeCompany);
        updateCompany();
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
