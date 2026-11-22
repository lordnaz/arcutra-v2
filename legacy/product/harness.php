<?php
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    header('Location: ../product.php?category=harness#product-details', true, 302);
    exit;
}
?>
<div class="col-lg-12">

	<div class="row">

		<div class="col-lg-6 col-xs-12 splitter_inside outer-div-product2">
			<div class="inner-div-harness text_sm_product">
				
			</div>
		</div>
		<div class="col-lg-6 col-xs-12 splitter_inside outer-div-product">
			<div class="text_sm_product">
			
				<h3 style="font-family: nex-bold;">Body harness - Honeywell Miller</h3>
			
				<br>

				<h3 style="font-family: nex-bold;"><a class="product-inquiry" href="contact_new.php?inquiry=product&amp;product=harness">CONTACT US FOR MORE DETAILS</a></h3>
				<!-- <h3 class="text_anim" style="font-family: nex-bold;">PROMO : RM350/unit</h3> -->
				<br>
				<br>
				<a href="doc/harness.pdf" target="_blank" rel="noopener noreferrer">
					<img class="download img-responsive" src="img/download.png" alt="Download product brochure (PDF)">
				</a>

			</div>
		</div>
		
	</div>

</div>
