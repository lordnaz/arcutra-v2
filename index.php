<?php
// Landing page. Disciplines, company statements and client marks are the published company content.
header('Referrer-Policy: same-origin');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'GET' && $method !== 'HEAD') {
    http_response_code(405);
    header('Allow: GET, HEAD');
    header('Content-Type: text/plain; charset=UTF-8');
    exit('This request method is not supported.');
}
$e = fn($value) => htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
// Disciplines and capability lists as published by the company.
$disciplines = [
    ['name' => 'Engineering', 'items' => [
        'Supply and install medium size automation technology.',
        'Corrosion Monitoring and Cathodic Protection.',
        'Service provider of hot work habitat.',
        'WAH (rope access services).',
    ]],
    ['name' => 'Safety', 'items' => [
        'To supply competent and reliable personal for confine space activities.',
        'AGT/ES registered by DOSH.',
        'Authorised entrant(AE) and Standby person (SP) for tank cleaning.',
        'Conducted in house training for confine space.',
        'Tank, Boiler & Vessel cleaning for routine maintenance during scheduled plant shutdown.',
    ]],
    ['name' => 'Architecture', 'items' => [
        'Conceptual consultation, space planning, AutoCAD drawing, 3D perspectives drawing and custom furniture fixture.',
    ]],
    ['name' => 'Manpower supply', 'items' => [
        'For any type of industry depends on client needs.',
    ]],
];
// Client marks in their published order.
$clients = [
    ['petron.png', 'Petron'], ['tnb.png', 'TNB'], ['saj.jpg', 'SAJ'], ['eversendai.png', 'Eversendai'],
    ['uem.jpg', 'UEM'], ['syabas.jpg', 'Syabas'], ['Shell.jpg', 'Shell'], ['petronas.png', 'Petronas'],
    ['trc.jpg', 'TRC'], ['fpg.png', 'FPG Oleochemicals'], ['sains.png', 'SAINS'], ['indah.png', 'Indah Water'],
    ['bp.jpg', 'BP'], ['EH.png', 'Endress+Hauser'], ['sole.png', 'Soletanche Bachy'], ['northport.png', 'Northport'],
    ['westport2.jpg', 'Westport'], ['nirwana.jpeg', 'Nirwana'], ['gemajaya.jpeg', 'Gemajaya'],
];
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="NEMZ ENERGY SDN BHD: maintenance services for high-risk industry and safety equipment for supply or rent. Engineering, safety, architecture and manpower.">
    <title>NEMZ ENERGY | Maintenance services and safety equipment</title>
    <link rel="stylesheet" href="assets/home.css">
    <script src="assets/home.js" defer></script>
</head>
<body>
<?php include __DIR__ . '/preloader.php'; ?>
<a class="skip-link" href="#disciplines">Skip to what we do</a>
<header class="site-header">
    <div class="container header-inner">
        <a class="brand" href="index.php" aria-label="NEMZ ENERGY home">
            <img src="img/nemz_logo_dark.png" width="487" height="126" alt="NEMZ ENERGY SDN BHD">
        </a>
        <nav aria-label="Main navigation">
            <a href="index.php" aria-current="page">Home</a>
            <a href="product.php">Product</a>
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
<main class="home-main" id="main-content">
    <section class="container hero" aria-labelledby="home-heading">
        <div class="home-layout">
            <div class="home-intro">
                <h1 id="home-heading"><span>NEMZ</span> <span>Energy.</span></h1>
                <div class="hero-actions">
                    <p class="lead">Maintenance services and safety equipment for high-risk industry.</p>
                    <div class="hero-links">
                        <a class="text-link" href="product.php">Browse the catalog</a>
                        <a class="text-link" href="contact.php#inquiry-form">Start an inquiry</a>
                    </div>
                </div>
            </div>
            <figure class="field-image">
                <div class="image-meta"><span>Confined space entry</span><span>Working at height</span></div>
                <img src="img/confined5.jpg" alt="Technician on rope access inside a dark confined space, headlamp beam across the entry" fetchpriority="high">
                <figcaption><a href="mailto:sales@nemz.com.my">sales@nemz.com.my</a><a href="tel:+60139856000">+60-13 985 6000</a></figcaption>
            </figure>
        </div>
        <div class="fact-rule">
            <span class="fact">
                <span class="fact-name">Established</span>
                <span class="fact-status">2025</span>
            </span>
            <span class="fact fact-count">
                <span class="fact-name">Project involvement</span>
                <span class="fact-status"><span class="visually-hidden">50</span><strong class="fact-figure" data-count="50" aria-hidden="true">50</strong> since 2025</span>
            </span>
            <span class="fact">
                <span class="fact-name">Expert</span>
                <span class="fact-status">Tank cleaning, confined space and rope access</span>
            </span>
            <span class="fact">
                <span class="fact-name">Certified</span>
                <span class="fact-status">Authorised gas tester, registered by DOSH</span>
            </span>
        </div>
    </section>
    <section class="discipline-section" id="disciplines" aria-labelledby="discipline-heading">
        <div class="container">
            <header class="discipline-band">
                <span class="section-number" aria-hidden="true">01</span>
                <h2 id="discipline-heading">What we do.</h2>
                <p class="index-note">Experience in design, engineering and safety practice, offered across four diversified fields.</p>
                <a class="text-link" href="contact.php#inquiry-form">Start an inquiry</a>
            </header>
            <div class="discipline-rows">
                <?php foreach ($disciplines as $i => $discipline): ?>
                    <article class="discipline-row" data-reveal aria-labelledby="discipline-title-<?= $e($i) ?>">
                        <header class="discipline-head">
                            <span class="discipline-number" aria-hidden="true"><?= $e(str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                            <h3 id="discipline-title-<?= $e($i) ?>"><?= $e($discipline['name']) ?></h3>
                        </header>
                        <ul class="discipline-list">
                            <?php foreach ($discipline['items'] as $item): ?>
                                <li><?= $e($item) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <section class="company-section" id="company" aria-labelledby="company-heading">
        <div class="container">
            <div class="company-layout">
                <div class="company-about">
                    <span class="section-number" aria-hidden="true">02</span>
                    <h2 id="company-heading">The company.</h2>
                    <p>NEMZ ENERGY SDN BHD has surfaced nationally to meet the demand and needs of high risk industry in maintenance services. Our aspiration is to deliver the best services of our core business in maintenance services mainly focusing on industrial tank cleaning, authorised gas tester for confine space environment and working at height using rope access technique.</p>
                </div>
            </div>
            <div class="team-grid">
                <figure class="team-figure" data-reveal>
                    <div class="image-meta"><span>Melaka</span><span>Management</span></div>
                    <img src="img/team.JPG" alt="The NEMZ management team standing in a row outdoors in Melaka" loading="lazy">
                    <figcaption>Management team</figcaption>
                </figure>
                <figure class="team-figure" data-reveal>
                    <div class="image-meta"><span>TNB power intake</span><span>Project team</span></div>
                    <img src="img/tnb.jpeg" alt="The project team in helmets and harnesses beside a TNB power intake site" loading="lazy">
                    <figcaption>Project team</figcaption>
                </figure>
            </div>
            <div class="company-statements">
                <div class="statement">
                    <h3>Our vision</h3>
                    <p>A preferred engineering company providing innovative customer solutions specializing in safety &amp; promoting healthy human resources by creating awareness in providing a compatible environment.</p>
                </div>
                <div class="statement">
                    <h3>Our mission</h3>
                    <p>Making businesses of our clients more efficient through a safe, effective operations and trouble less maintenance services.</p>
                </div>
            </div>
        </div>
    </section>
    <section class="client-section" id="clients" aria-labelledby="client-heading">
        <div class="container">
            <header class="client-head">
                <span class="section-number" aria-hidden="true">03</span>
                <h2 id="client-heading">The client register.</h2>
                <p class="index-note">Nineteen clients, as published on the company page.</p>
            </header>
            <div class="client-grid" data-reveal>
                <?php foreach ($clients as $client): ?>
                    <figure class="client-chip">
                        <img src="img/<?= $e($client[0]) ?>" alt="<?= $e($client[1]) ?> logo" loading="lazy">
                        <figcaption><?= $e($client[1]) ?></figcaption>
                    </figure>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <section class="work-section" aria-labelledby="work-heading">
        <div class="container work-layout">
            <div class="work-title">
                <span class="section-number" aria-hidden="true">04</span>
                <h2 id="work-heading">Work with<br> NEMZ.</h2>
                <p>Start an inquiry for services, supply or rent.</p>
            </div>
            <div class="work-side">
                <a class="primary-button" href="contact.php#inquiry-form">Start an inquiry</a>
                <a class="text-link" href="product.php">Browse the catalog</a>
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