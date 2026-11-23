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
// The four disciplines assemble one visual capability system; this is a diagram, not a procedure.
$diagramStages = [
    ['stage' => 'System frame', 'caption' => 'Access frame and vessel outline'],
    ['stage' => 'Safety controls', 'caption' => 'Gas testing and standby roles'],
    ['stage' => 'Space plan', 'caption' => 'Access route and spatial planning'],
    ['stage' => 'Team ready', 'caption' => 'Four disciplines, one confined-space entry system'],
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
    <script src="assets/coding-words.js" defer></script>
    <script src="assets/home.js" defer></script>
    <script src="assets/particles.js" defer></script>
    <script src="assets/back-to-top.js" defer></script>
    <script src="assets/scroll-meter.js" defer></script>
</head>
<body>
<?php include __DIR__ . '/preloader.php'; ?>
<a class="skip-link" href="#disciplines">Skip to what we do</a>
<header class="site-header particle-field" id="page-top" data-particles>
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
    <div class="hero-band particle-field" data-particles>
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
    </div>
    <section class="discipline-section particle-field" id="disciplines" aria-labelledby="discipline-heading" data-particles>
        <div class="container">
            <header class="discipline-band">
                <span class="section-number" aria-hidden="true">01</span>
                <h2 id="discipline-heading">What we do.</h2>
                <p class="index-note">Experience in design, engineering and safety practice, offered across four diversified fields.</p>
                <a class="text-link" href="contact.php#inquiry-form">Start an inquiry</a>
            </header>
            <div class="discipline-story" data-discipline-story>
                <div class="discipline-rows">
                    <?php foreach ($disciplines as $i => $discipline): $stage = $diagramStages[$i]; ?>
                        <article class="discipline-row" data-discipline="<?= $e($i) ?>" data-stage="<?= $e($stage['stage']) ?>" data-caption="<?= $e($stage['caption']) ?>" aria-labelledby="discipline-title-<?= $e($i) ?>">
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
                <figure class="discipline-visual" data-discipline-visual data-step="3" aria-labelledby="entry-visual-caption">
                    <div class="entry-visual-head"><span>Confined space entry</span><span data-entry-status>Team ready</span></div>
                    <div class="entry-diagram-frame">
                        <svg class="entry-diagram" viewBox="0 0 640 600" role="img" aria-labelledby="entry-diagram-title entry-diagram-description" data-kind="diagram">
                            <title id="entry-diagram-title">Confined space entry system diagram</title>
                            <desc id="entry-diagram-description">A technical diagram assembling an access frame, safety controls, a space plan and the entry team as the four disciplines advance.</desc>
                            <g class="diagram-grid" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
                                <path d="M48 120H592M48 180H592M48 240H592M48 300H592M48 360H592M48 420H592M48 480H592M48 540H592"/>
                                <path d="M88 92V556M148 92V556M208 92V556M268 92V556M328 92V556M388 92V556M448 92V556M508 92V556M568 92V556"/>
                            </g>
                            <g class="diagram-frame" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
                                <rect x="24" y="24" width="592" height="552"/>
                                <path d="M24 76H616M424 24V76"/>
                            </g>
                            <g class="diagram-muted">
                                <text x="44" y="57">Entry system / 04</text>
                                <text x="444" y="57">CS–01</text>
                            </g>
                            <g class="entry-layer entry-layer-0 is-visible" data-layer="0">
                                <g class="diagram-ink" fill="none" stroke="currentColor" stroke-width="1.6">
                                    <path d="M208 278v184c0 34 50 60 112 60s112-26 112-60V278"/>
                                    <ellipse cx="320" cy="278" rx="112" ry="30"/>
                                    <path d="M208 306c0 34 50 60 112 60s112-26 112-60"/>
                                    <path d="M226 278v178M414 278v178" opacity=".35"/>
                                </g>
                                <g class="diagram-accent" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <path d="M208 278L320 92l112 186M250 278l70-138 70 138M208 278h224"/>
                                    <path d="M320 92v150"/>
                                    <circle cx="320" cy="92" r="8"/>
                                    <rect x="350" y="158" width="36" height="50"/>
                                    <path d="M350 174h36M350 190h36"/>
                                </g>
                                <g class="diagram-muted">
                                    <text x="52" y="536">Access frame</text>
                                    <path d="M154 528h54l40-42" fill="none" stroke="currentColor" stroke-width="1"/>
                                    <text x="370" y="124">Lifting point</text>
                                </g>
                            </g>
                            <g class="entry-layer entry-layer-1 is-visible" data-layer="1">
                                <g class="diagram-accent" fill="none" stroke="currentColor" stroke-width="1.6">
                                    <rect x="82" y="280" width="64" height="92"/>
                                    <rect x="94" y="294" width="40" height="24" class="diagram-accent-fill" fill="currentColor" stroke="none"/>
                                    <circle cx="114" cy="342" r="10"/>
                                    <path d="M104 360h20"/>
                                    <circle cx="520" cy="156" r="18"/>
                                    <path d="M520 174v72m-32 86 32-86 32 86m-54-58h44"/>
                                    <path d="M320 112v86" stroke-dasharray="4 8"/>
                                </g>
                                <g class="diagram-muted">
                                    <text x="66" y="404">Gas test</text>
                                    <text x="460" y="358">Standby person</text>
                                </g>
                            </g>
                            <g class="entry-layer entry-layer-2 is-visible" data-layer="2">
                                <g class="diagram-muted" fill="none" stroke="currentColor" stroke-width="1">
                                    <path d="M174 278H108M174 462H108M128 278V462M118 290l10-12 10 12M118 450l10 12 10-12"/>
                                    <rect x="64" y="116" width="104" height="64"/>
                                    <path d="M64 140h104M98 116v64M134 140v40"/>
                                </g>
                                <g class="diagram-accent" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M562 128H458v68" stroke-dasharray="5 8"/>
                                    <path d="M458 196l-8-14m8 14 8-14M556 128h12v12"/>
                                </g>
                                <g class="diagram-muted">
                                    <text x="52" y="252">Space plan</text>
                                    <text x="440" y="112">Access route</text>
                                    <text x="70" y="204">Plan / section</text>
                                </g>
                            </g>
                            <g class="entry-layer entry-layer-3 is-visible" data-layer="3">
                                <g class="diagram-accent" fill="none" stroke="currentColor" stroke-width="1.8">
                                    <circle cx="516" cy="516" r="26"/>
                                    <path d="M503 516l9 9 18-20"/>
                                    <circle cx="494" cy="382" r="14"/>
                                    <path d="M494 398v48m-24 36 24-36 24 36m-38-26h28"/>
                                    <circle cx="550" cy="382" r="14"/>
                                    <path d="M550 398v48m-24 36 24-36 24 36m-38-26h28"/>
                                </g>
                                <g class="diagram-muted">
                                    <text x="476" y="560">Team ready</text>
                                </g>
                            </g>
                            <g class="entry-entrant diagram-ink" fill="none" stroke="currentColor" stroke-width="1.8">
                                <circle cx="320" cy="184" r="17"/>
                                <path d="M320 201v70m-30 62 30-62 30 62m-48-44h36"/>
                                <path class="diagram-accent" d="M303 180h34"/>
                            </g>
                        </svg>
                    </div>
                    <figcaption class="entry-visual-caption" id="entry-visual-caption">
                        <span class="entry-caption-main" data-entry-caption>Four disciplines, one confined-space entry system.</span>
                        <span class="entry-count" data-entry-count>04 / 04</span>
                        <span class="entry-progress" aria-hidden="true"><span class="entry-progress-bar" data-entry-progress></span></span>
                    </figcaption>
                </figure>
            </div>
        </div>
    </section>
    <section class="company-section particle-field" id="company" aria-labelledby="company-heading" data-particles>
        <div class="container">
            <div class="company-story" data-company-story>
                <div class="company-layout">
                    <header class="company-about">
                        <span class="section-number" aria-hidden="true">02</span>
                        <h2 id="company-heading"><span class="company-title-prefix">The</span> <span class="company-title-word"><span>company.</span><span class="company-title-mask" aria-hidden="true"><span class="company-title-color">company.</span></span></span></h2>
                        <div class="company-title-rule" aria-hidden="true"><span></span></div>
                    </header>
                    <div class="company-readout">
                        <div class="company-readout-head"><span>Company profile</span><span aria-hidden="true">02 / NEMZ</span></div>
                        <p class="company-description" data-company-description>NEMZ ENERGY SDN BHD has surfaced nationally to meet the demand and needs of high risk industry in maintenance services. Our aspiration is to deliver the best services of our core business in maintenance services mainly focusing on industrial tank cleaning, authorised gas tester for confine space environment and working at height using rope access technique.</p>
                        <div class="company-scan-track" aria-hidden="true"><span></span></div>
                        <div class="company-readout-foot"><span>Maintenance services</span><span>High-risk industry</span></div>
                    </div>
                </div>
            </div>
            <section class="people-showcase" aria-labelledby="people-heading">
                <header class="people-head"><h3 id="people-heading">Our people.</h3><span aria-hidden="true"></span></header>
                <div class="team-grid">
                    <figure class="team-figure" data-team="management">
                        <div class="team-frame">
                            <div class="team-photo">
                                <img src="img/team.JPG" alt="The NEMZ management team standing in a row outdoors in Melaka" loading="lazy">
                            </div>
                            <span class="team-corner team-corner-start" aria-hidden="true"></span>
                            <span class="team-corner team-corner-end" aria-hidden="true"></span>
                        </div>
                        <figcaption><span class="team-caption">Management team</span><span>Melaka</span></figcaption>
                    </figure>
                    <figure class="team-figure" data-team="project">
                        <div class="team-frame">
                            <div class="team-photo">
                                <img src="img/tnb.jpeg" alt="The project team in helmets and harnesses beside a TNB power intake site" loading="lazy">
                            </div>
                            <span class="team-corner team-corner-start" aria-hidden="true"></span>
                            <span class="team-corner team-corner-end" aria-hidden="true"></span>
                        </div>
                        <figcaption><span class="team-caption">Project team</span><span>TNB power intake</span></figcaption>
                    </figure>
                </div>
            </section>
        </div>
        <div class="purpose-band particle-field" data-particles>
            <div class="container">
                <div class="purpose-link" aria-hidden="true"><span></span></div>
                <div class="company-statements">
                    <section class="statement" aria-labelledby="vision-heading">
                        <h3 id="vision-heading">Our vision.</h3>
                        <p>A preferred engineering company providing <strong>innovative customer solutions</strong> specializing in <strong>safety</strong> &amp; promoting healthy human resources by creating awareness in providing a compatible environment.</p>
                    </section>
                    <section class="statement" aria-labelledby="mission-heading">
                        <h3 id="mission-heading">Our mission.</h3>
                        <p>Making businesses of our clients more efficient through a <strong>safe, effective operations</strong> and trouble less maintenance services.</p>
                    </section>
                </div>
            </div>
        </div>
    </section>
    <section class="client-section particle-field" id="clients" aria-labelledby="client-heading" data-particles>
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
    <section class="work-section particle-field" aria-labelledby="work-heading" data-particles>
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
<footer class="site-footer particle-field" data-particles>
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
<div class="scroll-meter" data-scroll-meter role="progressbar" aria-label="Page scroll progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" hidden>
    <span class="scroll-meter-label" aria-hidden="true">0%</span>
    <span class="scroll-meter-track" aria-hidden="true"><span class="scroll-meter-marker"></span></span>
    <span class="scroll-meter-current" data-scroll-percent aria-hidden="true">0%</span>
    <span class="scroll-meter-label" aria-hidden="true">100%</span>
</div>
<a class="back-to-top" href="#page-top" data-back-to-top aria-label="Back to top" title="Back to top">
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 11 12 5 18 11M12 5v14"/></svg>
</a>
</body>
</html>