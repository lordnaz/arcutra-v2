$(document).ready(function(){

    var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    var reducedMotion = motionPreference.matches;

    if ($('#odometer').length && !$.trim($('#odometer').text())) {
        $('#odometer').text('50');
    }

    // Each slider is initialized once, and only when its plugin is available.
    if ($.fn.slick) {
        var pairedSlider = $('.view').length > 0;
        if (pairedSlider) {
            $('.view').not('.slick-initialized').slick({
                slidesToShow: 1, slidesToScroll: 1, arrows: false,
                fade: !reducedMotion, speed: reducedMotion ? 0 : 300,
                asNavFor: '.autoplay'
            });
        }
        $('.autoplay').not('.slick-initialized').each(function() {
            $(this).slick({
                slidesToShow: pairedSlider ? 3 : 4,
                slidesToScroll: 1,
                autoplay: false,
                speed: reducedMotion ? 0 : 300,
                asNavFor: pairedSlider ? '.view' : null,
                centerMode: pairedSlider,
                focusOnSelect: pairedSlider,
                accessibility: true,
                responsive: [
                    { breakpoint: 992, settings: { slidesToShow: 3 } },
                    { breakpoint: 768, settings: { slidesToShow: 2 } },
                    { breakpoint: 480, settings: { slidesToShow: 1 } }
                ]
            });
        });
    }

    if ($.fn.carousel) {
        $('.carousel').carousel({ interval: false }).carousel('pause');
    }

    function updateMotionPreference(event) {
        reducedMotion = event.matches;
        if ($.fn.slick) {
            $('.slick-initialized').slick('slickSetOption', 'speed', reducedMotion ? 0 : 300, false);
        }
    }
    if (motionPreference.addEventListener) {
        motionPreference.addEventListener('change', updateMotionPreference);
    } else if (motionPreference.addListener) {
        motionPreference.addListener(updateMotionPreference);
    }

    // Project lists are intentionally unpublished; do not request missing files.
    var catalogRequest = null;
    var catalogSequence = 0;

    function loadCategory(url, updateHistory) {
        var details = $('#product-details');
        if (!details.length) return;
        var sequence = ++catalogSequence;
        if (catalogRequest) catalogRequest.abort();
        details.attr('aria-busy', 'true');
        $('#catalog-status').text('Loading product details...');
        var requestUrl = new URL(url, window.location.href);
        requestUrl.searchParams.set('fragment', '1');
        catalogRequest = $.ajax({ url: requestUrl.href, dataType: 'html', timeout: 15000 })
            .done(function(html) {
                if (sequence !== catalogSequence) return;
                details.html(html);
                $('#catalog-status').empty();
                var category = requestUrl.searchParams.get('category');
                $('[data-product-category]').each(function() {
                    $(this).attr('aria-current', $(this).attr('data-product-category') === category ? 'true' : null);
                });
                if (updateHistory) {
                    window.history.pushState(null, '', url);
                    details[0].focus({ preventScroll: true });
                    scrollToElement(details);
                }
            })
            .fail(function(xhr, status) {
                if (status === 'abort' || sequence !== catalogSequence) return;
                $('#catalog-status').text('Product details could not be loaded. ').append(
                    $('<a>').attr('href', url).text('Open this product page')
                );
            })
            .always(function() {
                if (sequence === catalogSequence) {
                    details.attr('aria-busy', 'false');
                    catalogRequest = null;
                }
            });
    }

    $(document).on('click', 'a[data-product-category]', function(event) {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.which > 1) return;
        event.preventDefault();
        loadCategory(this.href, true);
    });

    $(window).on('popstate', function() {
        if ($('#product-details').length) loadCategory(window.location.href, false);
    });

    var legacyRoutes = {
        home_content: 'index.php', services_content: 'services.php',
        product_content: 'product.php', project_content: 'project.php',
        contact_content: 'contact_new.php', training_content: 'soon.php'
    };
    $.each(legacyRoutes, function(className, route) {
        $(document).on('click', '.' + className, function(event) {
            var href = $(this).attr('href');
            if (href && !/^javascript:/i.test(href)) return;
            event.preventDefault();
            window.location.assign(route);
        });
    });


    function scrollToElement(element) {
        if (!element.length) return;
        var navHeight = $('.navbar').outerHeight() || 0;
        var top = Math.max(0, element.offset().top - navHeight - 15);
        $('html, body').stop(true).animate({ scrollTop: top }, reducedMotion ? 0 : 300);
    }

    $(document).on('click', '.go-to', function(event) {
        var target = $(this).attr('go-to');
        if (!target || !/^[a-zA-Z0-9_-]+$/.test(target)) return;
        var destination = $('.' + target).first();
        if (!destination.length) return;
        event.preventDefault();
        scrollToElement(destination);
    });

    $('.carousel-indicators li').attr({ role: 'button', tabindex: '0' }).each(function(index) {
        $(this).attr('aria-label', 'Show slide ' + (index + 1));
    }).on('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            $(this).trigger('click');
        }
    });

    var feedback = $('#contact-feedback');
    if (feedback.length) {
        feedback[0].focus({ preventScroll: true });
        scrollToElement(feedback);
    }

    var selectedCategory = new URL(window.location.href).searchParams.get('category');
    $('[data-product-category]').each(function() {
        $(this).attr('aria-current', $(this).attr('data-product-category') === selectedCategory ? 'true' : null);
    });

    $('.engineering, .safety, .architecture, .manpower, #outer-box, #outer-box2').attr('tabindex', '0');
    $('.logo_image:not([alt])').attr('alt', 'Client logo');
    $('a[target="_blank"]').attr('rel', 'noopener noreferrer');
    $('.navbar-collapse').on('hidden.bs.collapse', function() {
        $('.navbar-toggle').attr('aria-expanded', 'false');
    });

})