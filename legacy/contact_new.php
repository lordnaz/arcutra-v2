<?php
require_once __DIR__ . '/includes/contact-form.php';
$contact = contactFormState();
include_once __DIR__ . '/header.php';
?>
<?php include_once("preloader.php"); ?>

<section class="main_content" style="padding-bottom: 0px;">
	

	<!-- <div class="container-fluid foot_color_top" style="min-height: 650px; padding-bottom: 50px;"> -->
	<div class="container-fluid about5" style="padding-top: 20px;">
                <div class="container">
                        
                
        		<div class="row">
        			<div class="col-lg-4">
        			</div>
        			<div class="col-lg-4" style="text-align: center;padding-bottom: 50px;">
        				<h1 style="color: white; font-family: nex-bold;">CONTACT US</h1>
        			</div>
        			<div class="col-lg-4">
        			</div>
        		</div>

        		<div class="row">
        			<div class="col-lg-5" style="color: white; text-align: left;font-weight: bold;">
        				<h2 style="font-family: nex-bold;">General Office</h2><br>
        				<strong><p>NEMZ ENERGY SDN BHD</p></strong>
        				<p style="font-size: 13px;">NO.47, JLN VISTA JAYA 1,</p>
                                        <p style="font-size: 13px;">TAMAN VISTA JAYA,</p>
                                        <p style="font-size: 13px;">71010 PORT DICKSON, NEGERI SEMBILAN</p>
                                        <br>
                                        <p style="font-size: 13px;">Tel/Fax: <a class="contact-direct" href="tel:+60139856000">+60-13 985 6000</a></p>
                                        <p style="font-size: 13px;"><a class="contact-direct" href="mailto:nik@nemz.com.my">nik@nemz.com.my</a></p>
                                        <br>
                                        <br>
                                        <h3 style="font-family: nex-bold;">FOLLOW US!</h3>
                                        <div class="socmed">
                                            <!-- <center> -->
                                                <span class="fa fa-facebook" role="img" aria-label="Facebook link not available" aria-disabled="true" title="Facebook link not available"></span>
                                                <span class="fa fa-youtube" role="img" aria-label="YouTube link not available" aria-disabled="true" title="YouTube link not available"></span>
                                                <span class="fa fa-linkedin" role="img" aria-label="LinkedIn link not available" aria-disabled="true" title="LinkedIn link not available"></span>
                                               
                                            <!-- </center> -->
                                        </div>
        			</div>
        			<div class="col-lg-1" style="padding-bottom: 50px;"></div>
        			<div class="col-lg-6" style="color: white; text-align: left; font-size: 25px;font-weight: bold;">
        				
        				<p style="font-family: nex-bold;"><b>Any Inquiries? </b>email us anytime</p>
        				
                        <form class="form-horizontal" id="inquiry-form" action="contact_new.php#inquiry-form" method="post">
                            <?php if ($contact['message'] !== ''): ?>
                                <div id="contact-feedback" tabindex="-1" class="alert <?= $contact['warning'] ? 'alert-warning' : ($contact['success'] ? 'alert-success' : 'alert-danger') ?> form-feedback" role="<?= $contact['success'] && !$contact['warning'] ? 'status' : 'alert' ?>">
                                    <?= contactEscape($contact['message']) ?>
                                </div>
                            <?php endif; ?>
                            <?php if (!$contact['configured']): ?>
                                <p class="alert alert-warning form-feedback" id="contact-availability">Online sending is not available yet. Please <a href="mailto:nik@nemz.com.my">email nik@nemz.com.my</a> or <a href="tel:+60139856000">call +60-13 985 6000</a>.</p>
                            <?php endif; ?>
                            <input type="hidden" name="csrf" value="<?= contactEscape($contact['csrf']) ?>">
                            <div class="contact-trap" aria-hidden="true">
                                <label for="website">Leave this field empty</label>
                                <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
                            </div>
        					<fieldset>
        						<div class="hidden-xs">
        							<span>&nbsp;</span>
        						</div>

                                <div class="form-group">
                                	
                                	<label class="col-lg-2" for="email" style="font-size: 15px;">Email</label>
                                	<div class="col-lg-8">
                                		<input type="email" id="email" name="email" class="form-control" placeholder="youremail@gmail.com" autocomplete="email" required maxlength="254" value="<?= contactEscape($contact['fields']['email']) ?>" aria-invalid="<?= isset($contact['errors']['email']) ? 'true' : 'false' ?>" aria-describedby="email-error">
                                        <p class="form-feedback" id="email-error"><?= contactEscape($contact['errors']['email'] ?? '') ?></p>
                                	</div>
                                	<div class="col-lg-2"></div>
                                </div>

                                <div class="form-group">
                                	
                                	<label class="col-lg-2" for="inquiry" style="font-size: 15px;">Type of Inquiry </label>
                                	<div class="col-lg-8">
                                		<select class="form-control" id="inquiry" name="inquiry" required aria-invalid="<?= isset($contact['errors']['inquiry']) ? 'true' : 'false' ?>" aria-describedby="inquiry-error">
                                            <option value="">Please select</option>
                                            <?php foreach (contactTypes() as $value => $label): ?>
                                                <option value="<?= contactEscape($value) ?>" <?= $contact['fields']['inquiry'] === $value ? 'selected' : '' ?>><?= contactEscape($label) ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                        <p class="form-feedback" id="inquiry-error"><?= contactEscape($contact['errors']['inquiry'] ?? '') ?></p>
                                	</div>
                                	<div class="col-lg-2"></div>
                                </div>

                                <div class="form-group">
                                	
                                	<label class="col-lg-2" for="header" style="font-size: 15px;">Subject</label>
                                	<div class="col-lg-8">
                                		<input type="text" id="header" name="header" class="form-control" placeholder="i.e : Rental Price Quotation" required maxlength="160" value="<?= contactEscape($contact['fields']['header']) ?>" aria-invalid="<?= isset($contact['errors']['header']) ? 'true' : 'false' ?>" aria-describedby="header-error">
                                		<p class="form-feedback" id="header-error"><?= contactEscape($contact['errors']['header'] ?? '') ?></p>
                                	</div>
                                	<div class="col-lg-2"></div>
                                </div>

                                <div class="form-group">
                                	
                                	<label class="col-lg-2" for="details" style="font-size: 15px;">Details</label>
                                    <div class="col-lg-8">
                                        <textarea id="details" name="details" placeholder="Write us the details... " class="form-control" rows="4" required maxlength="10000" aria-invalid="<?= isset($contact['errors']['details']) ? 'true' : 'false' ?>" aria-describedby="details-error"><?= contactEscape($contact['fields']['details']) ?></textarea>
                                        <p class="form-feedback" id="details-error"><?= contactEscape($contact['errors']['details'] ?? '') ?></p>
                                	</div>
                                	<div class="col-lg-2"></div>
                                </div>

                                <div class="form-group" style="padding-top: 10px;">
                                	
                                	<div class="col-lg-4"></div>
                                	<div class="col-lg-4">
                                		<input type="submit" class="form-control btn btn-primary" name="sendmail" value="Send" <?= !$contact['configured'] ? 'disabled aria-describedby="contact-availability"' : '' ?>>
                                	</div>
                                	<div class="col-lg-4"></div>
                                </div>
                                <p id="contact-progress" class="form-feedback" role="status" aria-live="polite"></p>
                                
        					</fieldset>
        				</form>
                        <script>
                        (function () {
                            var form = document.getElementById('inquiry-form');
                            var button = form.querySelector('[name="sendmail"]');
                            var progress = document.getElementById('contact-progress');
                            var unavailable = button.disabled;
                            var pending = false;
                            form.addEventListener('submit', function (event) {
                                if (event.defaultPrevented) return;
                                if (unavailable || pending) {
                                    event.preventDefault();
                                    return;
                                }
                                pending = true;
                                button.disabled = true;
                                button.value = 'Sending…';
                                form.setAttribute('aria-busy', 'true');
                                progress.textContent = 'Submitting your inquiry. Please wait and do not send it again.';
                            });
                            window.addEventListener('pageshow', function () {
                                pending = false;
                                button.disabled = unavailable;
                                button.value = 'Send';
                                form.setAttribute('aria-busy', 'false');
                                progress.textContent = '';
                            });
                        }());
                        </script>
        			</div>
        		</div>
                </div>
	</div>

    <!-- <div class="container-fluid embed-responsive embed-responsive-16by9">
        <div class="row">
            <center>
                <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3119.9226966067667!2d101.71972962750532!3d3.1967659368022416!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xcd69d01c0c849dd4!2sArcutra+Global+Services+Sdn+Bhd!5e0!3m2!1sen!2smy!4v1547991926140" width="800" height="200" frameborder="0" style="border:0;" allowfullscreen></iframe>
            </center>
        </div>
    </div> -->

</section>

<?php include_once("footer.php"); ?>