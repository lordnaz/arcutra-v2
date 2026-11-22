<?php
// The shared handler owns the session, CSRF token, validation, rate limit and SMTP delivery.
require_once __DIR__ . '/includes/contact-form.php';
$contact = contactFormState();
$fields = $contact['fields'];
$errors = $contact['errors'];
$message = $contact['message'];
$feedback = $contact['warning'] ? 'warning' : ($contact['success'] ? 'success' : 'error');
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Contact NEMZ ENERGY in Port Dickson for corporate, services, product and training inquiries.">
    <title>Contact us | NEMZ ENERGY</title>
    <link rel="stylesheet" href="assets/contact.css">
    <script src="assets/contact.js" defer></script>
</head>
<body>
<?php include __DIR__ . '/preloader.php'; ?>
<a class="skip-link" href="#inquiry-form">Skip to inquiry form</a>
<header class="site-header">
    <div class="container header-inner">
        <a class="brand" href="index.php" aria-label="NEMZ ENERGY home">
            <img src="img/nemz_logo_dark.png" width="487" height="126" alt="NEMZ ENERGY SDN BHD">
        </a>
        <nav aria-label="Main navigation">
            <a href="index.php">Home</a>
            <a href="product.php">Product</a>
            <details class="training-nav">
                <summary>Training</summary>
                <div class="training-menu" id="training-menu">
                    <span aria-disabled="true" title="Safety training details are not published yet">Safety <small>Not published</small></span>
                    <span aria-disabled="true" title="Commercial training details are not published yet">Commercial <small>Not published</small></span>
                    <a href="doc/cert.pdf" target="_blank" rel="noopener noreferrer">HRDF certificate <small>PDF, new tab</small></a>
                </div>
            </details>
            <a href="contact.php" aria-current="page">Contact</a>
        </nav>
    </div>
</header>
<main class="contact-main" id="main-content">
    <section class="container contact-layout hero" aria-labelledby="contact-heading">
        <div class="contact-intro">
            <h1 id="contact-heading"><span>Contact</span> <span>NEMZ.</span></h1>
            <div class="hero-actions">
                <p class="lead">Email us anytime about your inquiry.</p>
                <a class="text-link" href="#inquiry-form">Start your inquiry</a>
            </div>
            <figure class="field-image">
                <div class="image-meta"><span>Safety &amp; rescue</span><span>Equipment inquiry</span></div>
                <img src="img/rescue.jpg" width="1240" height="827" alt="Rescue personnel carrying a stretcher through an industrial facility" fetchpriority="high">
                <figcaption><a href="tel:+60139856000">+60-13 985 6000</a><a href="mailto:nik@nemz.com.my">nik@nemz.com.my</a></figcaption>
            </figure>
        </div>
        <div class="form-panel">
            <form id="inquiry-form" tabindex="-1" action="contact.php#inquiry-form" method="post" aria-label="Inquiry form" aria-describedby="<?= $contact['configured'] ? 'form-note' : 'contact-availability' ?>">
                <div class="form-heading">
                    <div class="form-title"><span class="section-number" aria-hidden="true">01</span><h2>Your inquiry</h2></div>
                    <span>All fields required</span>
                </div>
                <?php if ($message !== ''): ?>
                    <div id="contact-feedback" class="feedback feedback-<?= $feedback ?>" tabindex="-1" role="<?= $feedback === 'success' ? 'status' : 'alert' ?>">
                        <p><?= contactEscape($message) ?></p>
                        <?php if ($errors): ?>
                            <ul>
                                <?php foreach ($errors as $field => $error): ?>
                                    <li><a href="#<?= contactEscape($field) ?>"><?= contactEscape($error) ?></a></li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
                <input type="hidden" name="csrf" value="<?= contactEscape($contact['csrf']) ?>">
                <div class="contact-trap" aria-hidden="true">
                    <label for="website">Leave this field empty</label>
                    <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
                </div>
                <div class="field-row">
                    <div class="field">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="you@company.com" autocomplete="email" inputmode="email" required maxlength="254" value="<?= contactEscape($fields['email']) ?>" aria-invalid="<?= isset($errors['email']) ? 'true' : 'false' ?>" aria-describedby="email-error">
                        <p class="field-error" id="email-error"><?= contactEscape($errors['email'] ?? '') ?></p>
                    </div>
                    <div class="field">
                        <label for="inquiry">Type of inquiry</label>
                        <select id="inquiry" name="inquiry" required aria-invalid="<?= isset($errors['inquiry']) ? 'true' : 'false' ?>" aria-describedby="inquiry-error">
                            <option value="">Please select</option>
                            <?php foreach (contactTypes() as $value => $label): ?>
                                <option value="<?= contactEscape($value) ?>" <?= $fields['inquiry'] === $value ? 'selected' : '' ?>><?= contactEscape($label) ?></option>
                            <?php endforeach; ?>
                        </select>
                        <p class="field-error" id="inquiry-error"><?= contactEscape($errors['inquiry'] ?? '') ?></p>
                    </div>
                </div>
                <div class="field">
                    <label for="header">Subject</label>
                    <input type="text" id="header" name="header" placeholder="e.g. Rental price quotation" required maxlength="160" value="<?= contactEscape($fields['header']) ?>" aria-invalid="<?= isset($errors['header']) ? 'true' : 'false' ?>" aria-describedby="header-error">
                    <p class="field-error" id="header-error"><?= contactEscape($errors['header'] ?? '') ?></p>
                </div>
                <div class="field">
                    <label for="details">Details</label>
                    <textarea id="details" name="details" placeholder="Tell us what you need…" rows="4" required maxlength="10000" aria-invalid="<?= isset($errors['details']) ? 'true' : 'false' ?>" aria-describedby="details-error"><?= contactEscape($fields['details']) ?></textarea>
                    <p class="field-error" id="details-error"><?= contactEscape($errors['details'] ?? '') ?></p>
                </div>
                <div class="form-actions">
                    <?php if ($contact['configured']): ?>
                        <button type="submit" class="primary-button" name="sendmail">Send inquiry</button>
                        <p id="form-note">A copy of your inquiry<br> is sent to your email.</p>
                    <?php else: ?>
                        <button type="submit" class="primary-button" name="sendmail" disabled>Send inquiry</button>
                        <p id="contact-availability">Online sending is not available yet. Please email <a href="mailto:nik@nemz.com.my">nik@nemz.com.my</a> or call <a href="tel:+60139856000">+60-13 985 6000</a>.</p>
                    <?php endif; ?>
                </div>
                <p id="contact-progress" class="progress" role="status" aria-live="polite"></p>
            </form>
        </div>
    </section>
    <section class="inquiry-section" id="inquiry-types" aria-labelledby="inquiry-heading">
        <div class="container">
            <div class="inquiry-heading">
                <span class="section-number" aria-hidden="true">02</span>
                <div>
                    <h2 id="inquiry-heading">Four ways to start.</h2>
                    <p>Choose a type and the form will be ready for you.</p>
                </div>
            </div>
            <ol class="inquiry-index">
                <li>
                    <a class="inquiry-row" href="contact.php?inquiry=corporate#inquiry-form" data-inquiry-type="corporate">
                        <span class="row-number" aria-hidden="true">01</span>
                        <span class="row-title">Corporate inquiry</span>
                        <span class="row-note">Company and partnership matters.</span>
                        <span class="row-action">Sets inquiry type</span>
                    </a>
                </li>
                <li>
                    <a class="inquiry-row" href="contact.php?inquiry=services#inquiry-form" data-inquiry-type="services">
                        <span class="row-number" aria-hidden="true">02</span>
                        <span class="row-title">Services inquiry</span>
                        <span class="row-note">Safety services and support.</span>
                        <span class="row-action">Sets inquiry type</span>
                    </a>
                </li>
                <li>
                    <a class="inquiry-row" href="contact.php?inquiry=product#inquiry-form" data-inquiry-type="product">
                        <span class="row-number" aria-hidden="true">03</span>
                        <span class="row-title">Product sell/rent inquiry</span>
                        <span class="row-note">Equipment purchase or rental.</span>
                        <span class="row-action">Sets inquiry type</span>
                    </a>
                </li>
                <li>
                    <a class="inquiry-row" href="contact.php?inquiry=training#inquiry-form" data-inquiry-type="training">
                        <span class="row-number" aria-hidden="true">04</span>
                        <span class="row-title">Training inquiry</span>
                        <span class="row-note">Training and certification questions.</span>
                        <span class="row-action">Sets inquiry type</span>
                    </a>
                </li>
            </ol>
        </div>
    </section>
    <section class="office-section" aria-labelledby="office-heading">
        <div class="container office-layout">
            <div class="office-title">
                <span class="section-number" aria-hidden="true">03</span>
                <h2 id="office-heading">General<br> office</h2>
                <p>Port Dickson, Negeri Sembilan</p>
            </div>
            <aside class="office" aria-labelledby="office-heading">
                <p class="company-name">NEMZ ENERGY SDN BHD</p>
                <address>No.47, Jln Vista Jaya 1,<br>Taman Vista Jaya,<br>71010 Port Dickson, Negeri Sembilan</address>
                <dl class="direct-contacts">
                    <div><dt>Tel/Fax</dt><dd><a href="tel:+60139856000">+60-13 985 6000</a></dd></div>
                    <div><dt>Email</dt><dd><a href="mailto:nik@nemz.com.my">nik@nemz.com.my</a></dd></div>
                </dl>
            </aside>
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
