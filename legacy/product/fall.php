<?php
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    header('Location: ../product.php?category=fall#product-details', true, 302);
    exit;
}
?>
<div class="col-lg-12">

	<div class="row">

		<div class="col-lg-6 col-xs-12 splitter_inside outer-div-product2" style="background-color: white;">
			<div class="inner-div-fall text_sm_product">
				
			</div>
		</div>
		<div class="col-lg-6 col-xs-12 splitter_inside outer-div-product">
			<div class="text_sm_product">
			
				<h3 class="text_anim" style="font-family: nex-bold;padding-top: 50%;"><a class="product-inquiry" href="contact_new.php?inquiry=product&amp;product=fall">CONTACT US FOR MORE DETAILS</a></h3>

			</div>
		</div>
		
	</div>

</div>
