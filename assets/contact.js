(() => {
    'use strict';
    const form = document.getElementById('inquiry-form');
    if (!form) return;
    const button = form.querySelector('[name="sendmail"]');
    const progress = document.getElementById('contact-progress');
    const fields = ['email', 'inquiry', 'header', 'details'].map(id => document.getElementById(id));
    // The server renders this notice, and a disabled button, when online sending is not configured.
    const unavailable = Boolean(document.getElementById('contact-availability'));
    const label = button.textContent;
    let pending = false;

    const messageFor = field => {
        if (!field.value.trim()) {
            return { email: 'Enter your email address.', inquiry: 'Select a type of inquiry.',
                header: 'Enter a subject.', details: 'Enter your inquiry details.' }[field.id];
        }
        if (field.validity.typeMismatch) return 'Enter a valid email address.';
        if (field.validity.tooLong) return 'Shorten this field to the allowed length.';
        return field.validationMessage;
    };

    fields.forEach(field => {
        const clearError = () => {
            field.setAttribute('aria-invalid', 'false');
            document.getElementById(`${field.id}-error`).textContent = '';
        };
        field.addEventListener('input', clearError);
        field.addEventListener('change', clearError);
    });

    form.addEventListener('submit', event => {
        if (event.defaultPrevented) return;
        if (pending || unavailable) {
            event.preventDefault();
            return;
        }
        let firstInvalid;
        fields.forEach(field => {
            const message = messageFor(field);
            field.setAttribute('aria-invalid', message ? 'true' : 'false');
            document.getElementById(`${field.id}-error`).textContent = message;
            if (message && !firstInvalid) firstInvalid = field;
        });
        if (firstInvalid) {
            event.preventDefault();
            progress.textContent = 'Please correct the highlighted fields. Nothing was sent.';
            firstInvalid.focus();
            return;
        }
        pending = true;
        button.disabled = true;
        button.textContent = 'Sending…';
        form.setAttribute('aria-busy', 'true');
        progress.textContent = 'Submitting your inquiry. Please wait and do not send it again.';
    });
    // Native validation remains available when this script cannot run.
    form.noValidate = true;
    window.addEventListener('pageshow', () => {
        pending = false;
        button.disabled = unavailable;
        button.textContent = label;
        form.setAttribute('aria-busy', 'false');
        progress.textContent = '';
        // Wait until fragment navigation finishes before focusing the response.
        const feedback = document.getElementById('contact-feedback');
        if (feedback) requestAnimationFrame(() => {
            const firstInvalid = fields.find(field => field.getAttribute('aria-invalid') === 'true');
            (firstInvalid || feedback).focus();
        });
    });
    const inquiry = document.getElementById('inquiry');
    const subject = document.getElementById('header');
    const context = document.getElementById('inquiry-context');
    const hint = document.getElementById('details-hint');
    const defaultHint = hint.textContent;
    const rows = [...document.querySelectorAll('[data-inquiry-type]')];
    // The server has already resolved catalog links into a subject. Never trust raw query text.
    const productSubject = subject.value.startsWith('Product inquiry: ') ? subject.value : '';
    const updateContext = () => {
        const option = inquiry.selectedOptions[0];
        let text = option?.dataset.context || 'Choose an inquiry type';
        if (inquiry.value === 'product' && productSubject && subject.value === productSubject) {
            text += ` / ${productSubject.slice('Product inquiry: '.length)}`;
        }
        if (context.textContent !== text) context.textContent = text;
        context.hidden = false;
        hint.textContent = option?.dataset.guidance || defaultHint;
        rows.forEach(row => {
            const selected = row.dataset.inquiryType === inquiry.value;
            if (selected) row.setAttribute('aria-current', 'true');
            else row.removeAttribute('aria-current');
            row.querySelector('.row-action').textContent = selected ? 'Selected' : 'Sets inquiry type';
        });
    };
    inquiry.addEventListener('change', updateContext);
    subject.addEventListener('input', updateContext);
    subject.addEventListener('change', updateContext);
    window.addEventListener('pageshow', updateContext);
    form.addEventListener('reset', () => requestAnimationFrame(updateContext));
    updateContext();

    const copyButton = document.querySelector('.copy-address');
    const address = document.getElementById('office-address');
    const copyFeedback = document.getElementById('copy-feedback');
    copyButton.hidden = false;
    copyButton.addEventListener('click', async () => {
        copyFeedback.textContent = '';
        try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(address.innerText.trim());
            copyFeedback.textContent = 'Address copied.';
        } catch {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(address);
            selection.removeAllRanges();
            selection.addRange(range);
            copyFeedback.textContent = 'Address selected. Use your device’s copy command to copy it.';
        }
    });

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set();
    const timing = getComputedStyle(document.documentElement);
    const duration = parseFloat(timing.getPropertyValue('--dur-showcase')) || 650;
    const lineDuration = parseFloat(timing.getPropertyValue('--dur-long')) || 420;
    const easing = timing.getPropertyValue('--ease-out').trim();
    const animate = (element, frames, options = {}) => {
        if (motion.matches || document.hidden || !element?.animate) return;
        const animation = element.animate(frames, { duration, easing, fill: 'backwards', ...options });
        animations.add(animation);
        animation.finished.catch(() => {}).finally(() => animations.delete(animation));
        return animation;
    };
    const visible = element => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < innerHeight;
    };
    // Original words stay selectable and accessible. Only empty, decorative overlays decode.
    const description = document.querySelector('[data-contact-description]');
    const words = [];
    const content = document.createDocumentFragment();
    for (const part of description.textContent.match(/\S+|\s+/g) || []) {
        if (/^\s+$/.test(part)) { content.append(document.createTextNode(part)); continue; }
        const word = document.createElement('span');
        word.className = 'contact-word';
        const text = document.createElement('span');
        text.className = 'contact-word-text';
        text.textContent = part;
        const cipher = document.createElement('span');
        cipher.className = 'contact-cipher';
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
        let lastTick = -1;
        const step = now => {
            const elapsed = now - start;
            if (elapsed >= 1080 || !visible(description)) { settleText(); return; }
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
    form.addEventListener('focusin', settleMotion);
    // No loader: the form is available immediately, independently of decorative motion.
    const entrance = () => {
        if (location.hash || document.getElementById('contact-feedback') || window.scrollY > 24 || form.contains(document.activeElement)) return;
        const mask = document.querySelector('.contact-title-mask');
        animate(mask, [{ transform: 'translateX(-100%)' }, { transform: 'none' }]);
        animate(mask.firstElementChild, [{ transform: 'translateX(100%)' }, { transform: 'none' }]);
        decodeText();
    };
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(entrance));
    const revealImage = frame => {
        const image = frame.querySelector('img');
        const play = () => {
            if (!visible(frame)) return;
            animate(image, [{ transform: 'scale(1.04)' }, { transform: 'none' }]);
            frame.querySelectorAll('.technical-corner').forEach(corner => {
                animate(corner, [{ transform: 'scale(0.7)', opacity: 0 }, { transform: 'none', opacity: 1 }]);
            });
        };
        if (image.complete) { if (image.naturalWidth) play(); }
        else image.addEventListener('load', play, { once: true });
    };
    // Each photo or divider enters once; fields, labels, values and feedback never animate.
    if ('IntersectionObserver' in window) {
        const reveal = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || entry.intersectionRatio < 0.15) return;
                reveal.unobserve(entry.target);
                if (entry.target.matches('.technical-frame')) revealImage(entry.target);
                else animate(entry.target.firstElementChild, [{ transform: 'scaleX(0)' }, { transform: 'none' }], { duration: lineDuration });
            });
        }, { threshold: 0.15 });
        document.querySelectorAll('.technical-frame, .section-line').forEach(element => reveal.observe(element));
    }

    // Inquiry index rows set the form type in place; the GET href remains the no-script fallback.
    rows.forEach(link => {
        link.addEventListener('click', event => {
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            inquiry.value = link.dataset.inquiryType;
            inquiry.dispatchEvent(new Event('change', { bubbles: true }));
            form.scrollIntoView({ behavior: 'instant', block: 'start' });
            document.getElementById('email').focus({ preventScroll: true });
            progress.textContent = 'Inquiry type set. Your existing details have been kept.';
        });
    });
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
