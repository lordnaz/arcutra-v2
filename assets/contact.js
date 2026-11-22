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
        if (location.hash || document.getElementById('contact-feedback') || window.scrollY > 24) return;
        document.querySelectorAll('.contact-intro h1, .contact-intro .lead, .hero-actions .text-link, .field-image').forEach((element, index) => {
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
    // One calm reveal for the inquiry index when it first enters view; never tied to scroll position.
    const inquirySection = document.getElementById('inquiry-types');
    if (inquirySection && 'IntersectionObserver' in window) {
        const reveal = new IntersectionObserver(entries => {
            if (!entries.some(entry => entry.isIntersecting)) return;
            reveal.disconnect();
            inquirySection.querySelectorAll('.inquiry-heading h2, .inquiry-row').forEach((element, index) => {
                animate(element, [{ transform: 'translateY(12px)', opacity: 0.8 }, { transform: 'none', opacity: 1 }],
                    { delay: index * stagger, duration: duration - index * stagger });
            });
        }, { threshold: 0.1 });
        reveal.observe(inquirySection);
        window.addEventListener('pagehide', () => reveal.disconnect(), { once: true });
    }

    // Inquiry index rows set the form type in place; the GET href remains the no-script fallback.
    document.querySelectorAll('[data-inquiry-type]').forEach(link => {
        link.addEventListener('click', event => {
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            const inquiry = document.getElementById('inquiry');
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
