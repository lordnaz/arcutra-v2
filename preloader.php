
<div id="site-preloader" class="preloader complete" hidden aria-hidden="true" role="status" aria-live="polite">
	<div class="loader" aria-hidden="true">
		
	</div>
	<div class="text_loader">
		Please Wait
	</div>
</div>
<script>
(function () {
    var loader = document.getElementById('site-preloader');
    if (!loader || document.readyState === 'complete') return;

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var started = Date.now();
    var closing = false;
    var finishTimer;
    var hideTimer;
    var deadline;

    function hide() {
        clearTimeout(deadline);
        clearTimeout(finishTimer);
        clearTimeout(hideTimer);
        loader.classList.add('complete');
        loader.hidden = true;
        loader.setAttribute('aria-hidden', 'true');
        window.removeEventListener('load', finish);
        window.removeEventListener('pagehide', hide);
        window.removeEventListener('pageshow', restore);
    }

    function finish() {
        if (closing || loader.hidden) return;
        closing = true;
        finishTimer = setTimeout(function () {
            loader.classList.add('complete');
            loader.setAttribute('aria-hidden', 'true');
            hideTimer = setTimeout(hide, reducedMotion ? 0 : 1000);
        }, Math.max(0, (reducedMotion ? 0 : 350) - (Date.now() - started)));
    }

    function restore(event) {
        if (event.persisted) hide();
    }

    // Register the fail-safe before showing the overlay; no other scripts are required.
    deadline = setTimeout(hide, 5000);
    window.addEventListener('load', finish);
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', restore);
    loader.classList.remove('complete');
    loader.hidden = false;
    loader.setAttribute('aria-hidden', 'false');
}());
</script>
