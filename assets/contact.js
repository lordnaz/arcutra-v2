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

    // Form behavior stays independent of the optional decorative scroll controller.
    const motion = window.scrollMotion;
    if (motion) {
        const blocked = () => form.contains(document.activeElement);
        motion.wipe(document.querySelector('.contact-title-mask'), { blocked });
        window.createScrollCodingText?.(document.querySelector('[data-contact-description]'), 'contact', { hero: true, blocked });
        document.querySelectorAll('.technical-frame').forEach(frame => motion.image(frame, { hero: true, blocked }));
        document.querySelectorAll('.section-line > span').forEach(line => motion.line(line, { blocked }));
        form.addEventListener('focusin', motion.schedule);
        form.addEventListener('focusout', motion.schedule);
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
