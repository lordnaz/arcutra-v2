<?php
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    header('Location: ../product.php?category=ppe#product-details', true, 302);
    exit;
}
?>
<div class="col-lg-12">

	<div class="row">

		<div class="col-lg-6 col-xs-12 splitter_inside outer-div-product2" style="background-color: white;">
			<div class="inner-div-ppe text_sm_product">
				
			</div>
		</div>
		<div class="col-lg-6 col-xs-12 splitter_inside outer-div-product">
			<div class="text_sm_product">
			
				<!-- <h3 style="font-family: nex-bold;">ESCAPE SET</h3> -->
			
				<br>

				<!-- <h3 style="font-family: nex-bold;">N/P : RM1500/unit</h3> -->
				<h3 class="text_anim" style="font-family: nex-bold;padding-top: 20%;"><a class="product-inquiry" href="contact_new.php?inquiry=product&amp;product=ppe">CONTACT US FOR MORE DETAILS</a></h3>
				<br>
				<br>
				<a href="doc/ppe.pdf" target="_blank" rel="noopener noreferrer">
					<img class="download img-responsive" src="img/download.png" alt="Download product brochure (PDF)">
				</a>

			</div>
		</div>
		
	</div>

</div>
