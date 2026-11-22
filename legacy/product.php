<?php
$catalog = ['gas_detector', 'harness', 'scba', 'tripod', 'fall', 'escape', 'magnetic', 'ppe'];
$category = isset($_GET['category']) && is_string($_GET['category']) ? $_GET['category'] : '';
$invalidCategory = isset($_GET['category']) && (!is_string($_GET['category']) || !in_array($category, $catalog, true));
if ($invalidCategory) {
    http_response_code(404);
    $category = '';
}
function renderProductDetails($category, $invalidCategory) {
    if ($category !== '') {
        include __DIR__ . '/product/' . $category . '.php';
    } else {
        echo '<h4 class="catalog-placeholder">' . ($invalidCategory ? 'Product not found. Choose a product from the catalog.' : 'Choose your product first...') . '</h4>';
    }
}
if (isset($_GET['fragment']) && $_GET['fragment'] === '1') {
    header('Content-Type: text/html; charset=UTF-8');
    renderProductDetails($category, $invalidCategory);
    exit;
}
include_once("header.php");
include_once("preloader.php");
?>

<section class="main_content">


	<div class="container-fluid about4">
		<div class="container">

			<div class="row">
				
				<div class="col-lg-4 col-md-4 col-sm-4 col-xs-12" style="border:2px solid white; background-color: rgba(50,50,50,0.6);">
					<p class="title" style="font-family: nex-bold;color: white;font-size: 25px;">PRODUCT</p>
					<p style="font-size: 20px;color: white;font-weight: bold;">Range of product to supply / rent available</p>
				</div>
				<div class="col-lg-8 col-md-8 col-sm-8 col-xs-12" style="text-align: center; padding-top: 20px; padding-bottom: 25px;background-color: rgba(50,50,50,0.6);">
					<!-- <h1 class="title" style="color: white;font-family: nex-bold;">Products at ARCUTRA</h1> -->
					<div style="display: block; text-align: justify !important; text-justify: inter-word !important;color: white;font-weight: bold;">
						<span>At NEMZ ENERGY, variety of our products also available for supply or rent to our client. Exploring our product catalog to meet your needs. Do contact us for an inquiry of our list of product. </span>
					</div>
					
				</div>
			</div>

			<div class="row scroll2" style="padding-top: 100px;">
				<div class="col-lg-3"></div>
				<a class="col-lg-2 buy" href="#product-catalog">BUY</a>
				<div class="col-lg-2 rental" aria-disabled="true" title="Rental details are not published yet">RENTAL</div>
				<div class="col-lg-2 calibration" aria-disabled="true" title="Calibration details are not published yet">CALIBRATION</div>
				<div class="col-lg-3"></div>
			</div>

			<div class="row" id="product-catalog" style="padding-top: 100px;">
				<a class="col-lg-4 splitter_product outer-div gas_detector" data-product-category="gas_detector" href="product.php?category=gas_detector#product-details">
					<div class="inner-div1 text_sm_product">GAS DETECTOR</div>
				</a>
				<a class="col-lg-4 splitter_product outer-div harness" data-product-category="harness" href="product.php?category=harness#product-details">
					<div class="inner-div3 text_sm_product">FULL BODY HARNESS</div>
				</a>
				<a class="col-lg-4 splitter_product outer-div scba" data-product-category="scba" href="product.php?category=scba#product-details">
					<div class="inner-div4 text_sm_product_new">SELF-CONTAINED BREATHING APPARATUS (SCBA)</div>
				</a>
			</div>
			<div class="row">
				<a class="col-lg-4 splitter_product outer-div tripod" data-product-category="tripod" href="product.php?category=tripod#product-details">
					<div class="inner-div5 text_sm_product">SAFETY TRIPOD</div>
				</a>
				<a class="col-lg-4 splitter_product outer-div fall" data-product-category="fall" href="product.php?category=fall#product-details">
					<div class="inner-div6 text_sm_product">FALL ARRESTER</div>
				</a>
				<a class="col-lg-4 splitter_product outer-div escape" data-product-category="escape" href="product.php?category=escape#product-details">
					<div class="inner-div7 text_sm_product">ESCAPE SET</div>
				</a>
			</div>
			<div class="row">
				<a class="col-lg-4 splitter_product outer-div magnetic" data-product-category="magnetic" href="product.php?category=magnetic#product-details">
					<div class="inner-div8 text_sm_product">MAGNETIC WORK LIGHT</div>
				</a>
				<a class="col-lg-4 splitter_product outer-div ppe" data-product-category="ppe" href="product.php?category=ppe#product-details">
					<div class="inner-div9 text_sm_product">PERSONAL PROTECTIVE EQUIPMENT</div>
				</a>
				<div class="col-lg-4 splitter_product outer-div">
					<div class="inner-div10 text_sm_product" style="color: black;">
						<a class="contact_content catalog-inquiry" href="contact_new.php?inquiry=product">CONTACT US FOR MORE INQUIRIES</a><br>
						<a href="mailto:sales@nemz.com.my" style="color: blue;">sales@nemz.com.my</a>
					</div>
				</div>
			</div>

		
			<div class="scroll" style="padding-top: 80px;">
				<h3 class="title" style="color: white; font-family: nex-bold;">PRODUCT DETAILS</h3>
			</div>
			

			<p id="catalog-status" role="status" aria-live="polite"></p>
			<div class="row all_list" id="product-details" tabindex="-1" role="region" aria-label="Product details" aria-busy="false" style="padding-bottom: 40px; padding-top: 20px; transition: .5s;">
				<?php renderProductDetails($category, $invalidCategory); ?>
			</div>


			<!-- <div class="scroll4" style="padding-top: 80px;">
				<h3 class="title mobile_padding" style="color: white; font-family: nex-bold;">RENTAL RATE</h3>
			</div>

			<div class="row scroll3">
				
			</div> -->

		</div>
		
	</div>

	

	
</section>

<?php include_once("footer.php"); ?>