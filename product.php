<?php
// Product catalog. Ranges, models, brochures and imagery are the published company content.
header('Referrer-Policy: same-origin');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'HEAD') {
    http_response_code(405);
    header('Allow: GET, HEAD');
    header('Content-Type: text/plain; charset=UTF-8');
    exit('This request method is not supported.');
}
$e = fn($value) => htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
// Catalog in its published order; slugs match the contact page's ?product= values.
$catalog = [
    ['slug' => 'gas_detector', 'name' => 'Gas detector', 'meta' => 'Gas detection', 'image' => 'maxii.jpg', 'kind' => 'specimen',
        'alt' => 'BW GasAlertMaxXT II portable multi-gas detector',
        'rows' => [['BW GasAlertMaxXT II', 'maxii.pdf'], ['BW CLIP H2S', 'bgw.pdf'], ['BW GasAlertMicroClip XL', 'microclip.pdf'], ['GasAlert Extreme Detector - Hydrogen Sulfide (H2S)', 'gasalert.pdf']], 'note' => ''],
    ['slug' => 'harness', 'name' => 'Full body harness', 'meta' => 'Fall protection', 'image' => 'miller.jpg', 'kind' => 'specimen',
        'alt' => 'Honeywell Miller full body harness',
        'rows' => [['Body harness - Honeywell Miller', 'harness.pdf']], 'note' => ''],
    ['slug' => 'scba', 'name' => 'Self-contained breathing apparatus', 'meta' => 'Respiratory protection', 'image' => 'lalizas.jpg', 'kind' => 'specimen',
        'alt' => 'Lalizas Solas self-contained breathing apparatus',
        'rows' => [['SCBA - Lalizas Solas', 'scba.pdf']], 'note' => ''],
    ['slug' => 'tripod', 'name' => 'Safety tripod', 'meta' => 'Confined entry', 'image' => 'tripod.png', 'kind' => 'specimen',
        'alt' => 'Safety tripod with winch and fall arrester',
        'rows' => [['Safety tripod', 'tripod_new.pdf']], 'note' => 'Delivery within 2 weeks.'],
    ['slug' => 'fall', 'name' => 'Fall arrester', 'meta' => 'Fall protection', 'image' => 'fall.jpg', 'kind' => 'photo',
        'alt' => 'Worker wearing a full body harness beside a fall arrester block',
        'rows' => [], 'note' => 'Model details on request.'],
    ['slug' => 'escape', 'name' => 'Escape set', 'meta' => 'Emergency escape', 'image' => 'escape.png', 'kind' => 'specimen',
        'alt' => 'Escape set breathing apparatus',
        'rows' => [['Escape set', 'escape.pdf']], 'note' => ''],
    ['slug' => 'magnetic', 'name' => 'Magnetic work light', 'meta' => 'Site lighting', 'image' => 'magnetic2.png', 'kind' => 'specimen',
        'alt' => 'Magnetic explosion-proof LED work light',
        'rows' => [['Magnetic Explosion Proof LED Working Light', 'nemz.pdf']], 'note' => ''],
    ['slug' => 'ppe', 'name' => 'Personal protective equipment', 'meta' => 'Head to toe', 'image' => 'ppe.jpg', 'kind' => 'photo',
        'alt' => 'Safety helmet, ear defenders, gloves and boots',
        'rows' => [['Personal protective equipment range', 'ppe.pdf']], 'note' => ''],
];
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="NEMZ ENERGY product catalog: gas detection, fall protection, respiratory protection, confined entry, lighting and PPE for supply or rent.">
    <title>Product catalog | NEMZ ENERGY</title>
    <link rel="stylesheet" href="assets/product.css">
    <script src="assets/product.js" defer></script>
</head>
<body>
<?php include __DIR__ . '/preloader.php'; ?>
<a class="skip-link" href="#catalog">Skip to catalog</a>
<header class="site-header">
    <div class="container header-inner">
        <a class="brand" href="index.php" aria-label="NEMZ ENERGY home">
            <img src="img/nemz_logo_dark.png" width="487" height="126" alt="NEMZ ENERGY SDN BHD">
        </a>
        <nav aria-label="Main navigation">
            <a href="index.php">Home</a>
            <a href="product.php" aria-current="page">Product</a>
            <details class="training-nav">
                <summary>Training</summary>
                <div class="training-menu" id="training-menu">
                    <span aria-disabled="true" title="Safety training details are not published yet">Safety <small>Not published</small></span>
                    <span aria-disabled="true" title="Commercial training details are not published yet">Commercial <small>Not published</small></span>
                    <a href="doc/cert.pdf" target="_blank" rel="noopener noreferrer">HRDF certificate <small>PDF, new tab</small></a>
                </div>
            </details>
            <a href="contact.php">Contact</a>
        </nav>
    </div>
</header>
<main class="product-main" id="main-content">
    <section class="container hero" aria-labelledby="product-heading">
        <div class="product-layout">
            <div class="product-intro">
                <h1 id="product-heading"><span>Product</span> <span>NEMZ.</span></h1>
                <div class="hero-actions">
                    <p class="lead">Safety equipment for supply or rent.</p>
                    <a class="text-link" href="#catalog">Browse the catalog</a>
                </div>
            </div>
            <figure class="field-image">
                <div class="image-meta"><span>Breathing apparatus</span><span>Supply or rent</span></div>
                <img src="img/gear-new.jpg" alt="Rows of self-contained breathing apparatus prepared on a service bench" fetchpriority="high">
                <figcaption><a href="mailto:sales@nemz.com.my">sales@nemz.com.my</a><a href="tel:+60139856000">+60-13 985 6000</a></figcaption>
            </figure>
        </div>
        <div class="service-rule">
            <a class="service" href="#catalog">
                <span class="service-name">Supply</span>
                <span class="service-status">Available now</span>
            </a>
            <span class="service" aria-disabled="true" title="Rental details are not published yet">
                <span class="service-name">Rental</span>
                <span class="service-status">Not published</span>
            </span>
            <span class="service" aria-disabled="true" title="Calibration details are not published yet">
                <span class="service-name">Calibration</span>
                <span class="service-status">Not published</span>
            </span>
        </div>
    </section>
    <section class="catalog-section" id="catalog" aria-labelledby="catalog-heading">
        <div class="container catalog-layout">
            <div class="catalog-index">
                <span class="section-number" aria-hidden="true">01</span>
                <h2 id="catalog-heading">The catalog.</h2>
                <nav aria-label="Catalog index">
                    <ol>
                        <?php foreach ($catalog as $i => $item): ?>
                            <li><a class="index-link" href="#plate-<?= $e($item['slug']) ?>">
                                <span class="index-number" aria-hidden="true"><?= $e(str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                                <span class="index-name"><?= $e($item['name']) ?></span>
                            </a></li>
                        <?php endforeach; ?>
                    </ol>
                </nav>
                <p class="index-note">Every range is available for supply or rent. Ask for availability.</p>
                <a class="text-link" href="mailto:sales@nemz.com.my">sales@nemz.com.my</a>
            </div>
            <div class="catalog-plates">
                <?php foreach ($catalog as $i => $item): ?>
                    <article class="plate" id="plate-<?= $e($item['slug']) ?>" data-plate="<?= $e($item['slug']) ?>" aria-labelledby="plate-title-<?= $e($item['slug']) ?>">
                        <header class="plate-head">
                            <span class="plate-number" aria-hidden="true"><?= $e(str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                            <h3 id="plate-title-<?= $e($item['slug']) ?>"><?= $e($item['name']) ?></h3>
                        </header>
                        <figure class="plate-figure <?= $e($item['kind']) ?>">
                            <div class="image-meta"><span><?= $e($item['meta']) ?></span><span><?= $e(count($item['rows']) > 1 ? count($item['rows']) . ' models' : ($item['rows'] ? 'Brochure available' : 'Details on request')) ?></span></div>
                            <img src="img/<?= $e($item['image']) ?>" alt="<?= $e($item['alt']) ?>" loading="lazy">
                        </figure>
                        <?php if ($item['rows']): ?>
                            <ul class="model-list">
                                <?php foreach ($item['rows'] as $row): ?>
                                    <li>
                                        <span class="model-name"><?= $e($row[0]) ?></span>
                                        <a class="model-pdf" href="doc/<?= $e($row[1]) ?>" target="_blank" rel="noopener noreferrer">Brochure <small>PDF, new tab</small></a>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                        <?php if ($item['note'] !== ''): ?>
                            <p class="plate-note"><?= $e($item['note']) ?></p>
                        <?php endif; ?>
                        <div class="plate-actions">
                            <a class="text-link" href="contact.php?product=<?= $e($item['slug']) ?>#inquiry-form">Inquire about this range</a>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <section class="ask-section" aria-labelledby="ask-heading">
        <div class="container ask-layout">
            <div class="ask-title">
                <span class="section-number" aria-hidden="true">02</span>
                <h2 id="ask-heading">Ask about<br> availability.</h2>
                <p>Contact us for an inquiry on any range in the catalog.</p>
            </div>
            <div class="ask-side">
                <a class="primary-button" href="contact.php?inquiry=product#inquiry-form">Start a product inquiry</a>
                <dl class="direct-contacts">
                    <div><dt>Email</dt><dd><a href="mailto:sales@nemz.com.my">sales@nemz.com.my</a></dd></div>
                    <div><dt>Tel/Fax</dt><dd><a href="tel:+60139856000">+60-13 985 6000</a></dd></div>
                </dl>
            </div>
        </div>
    </section>
</main>
<footer class="site-footer">
    <div class="container footer-inner">
        <p>© 2025 NEMZ ENERGY. All rights reserved.</p>
        <details class="social-links">
            <summary>Social channels (unavailable)</summary>
            <div class="social-list">
                <span aria-disabled="true">Facebook</span>
                <span aria-disabled="true">YouTube</span>
                <span aria-disabled="true">LinkedIn</span>
            </div>
        </details>
    </div>
</footer>
</body>
</html>