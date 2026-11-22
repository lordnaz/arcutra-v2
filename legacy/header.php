<!-- <?php
$session=1;
?> -->

<!DOCTYPE html>
<html lang="en">
<head>
	
	<meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <!-- <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" /> -->

    <!-- <link href="https://fonts.googleapis.com/css?family=Oxygen" rel="stylesheet">
	<link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.5.0/css/all.css' integrity='sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU' crossorigin='anonymous'> -->

    <link rel="stylesheet" href="css/jquery-ui.css"/>	
    <link rel="stylesheet" href="css/bootstrap_3.css"/>
	<link rel="stylesheet" href="css/style.css"/>
	<link rel="stylesheet" type="text/css" href="slick/slick.css"/>	
    <link rel="stylesheet" type="text/css" href="slick/slick-theme.css"/>
    <link rel="stylesheet" href="https://github.hubspot.com/odometer/themes/odometer-theme-train-station.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

	<!-- <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script> -->
	<script src="https://github.hubspot.com/odometer/odometer.js"></script>
	<script src="js/jquery-3.2.1.js"></script>		
	<script src="js/jquery-ui.js"></script>
	<script src="js/bootstrap-3.3.7.js"></script>
	<script type="text/javascript" src="slick/slick.min.js"></script>
	<script src="js/main.js"></script>

	<title>NEMZ ENERGY</title>
	<!-- 
    xs - phones < 768px  hidden-xs
    sm - tablets >= 768px   hidden-sm
    md - small laptops >= 992px    hidden-md
    lg - laptops/desktop >= 1200px    hidden-lg
    -->
    <noscript>
        <style>
            .navbar { position: static !important; }
            #myNavbar { display: block !important; height: auto !important; }
            .navbar-toggle, .nav-menu-toggle, .carousel-control, .carousel-indicators { display: none !important; }
            #training-menu { display: block; position: static; float: none; }
            .carousel-inner > .item { display: block; }
            .engineering, .safety, .architecture, .manpower { height: auto; min-height: 320px; background-color: rgba(0,0,0,.7); }
            .text_hover { position: relative !important; visibility: visible !important; opacity: 1 !important; }
            #outer-box #inner-box, #outer-box2 #inner-box2 { opacity: 1; position: relative; height: auto; }
            #outer-box, #outer-box2 { height: auto; min-height: 400px; }
            #outer-box #inner-box p, #outer-box2 #inner-box2 p { padding: 20px 15px; }
        </style>
    </noscript>
</head>
<body>
<?php include_once __DIR__ . '/preloader.php'; ?>

	<!-- navbar -->
		<nav class="navbar navbar-default" style="position: fixed; width: 100%; z-index: 2;">
			<div class="container-fluid" style="padding-top: 20px; border-bottom: 1px solid #E0DFD5; opacity: 1;">
				<div class="navbar-header" style="padding-bottom: 25px;">
					<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar" aria-expanded="false" aria-controls="myNavbar" aria-label="Toggle navigation">
						<span class="icon-bar"></span>	
						<span class="icon-bar"></span>	
						<span class="icon-bar"></span>	
					</button>

					<a class="navbar-brand home_content" href="index.php" style="color: #4ECDC4"><img src="img/nemz_logo.png" alt="NEMZ ENERGY" style="height:35px"></a>
				</div>

				<div class="collapse navbar-collapse" id="myNavbar">
					<ul class="nav navbar-nav navbar-right">
						<li><a href="index.php" class="auth home_content">HOME</a></li>
						<li><a href="product.php" class="auth product_content">PRODUCT</a></li>
						<!-- class="go-to auth training_content dropdown-toggle" -->
						<li>
							<button type="button" class="auth dropdown-toggle nav-menu-toggle" data-toggle="dropdown" aria-expanded="false" aria-controls="training-menu">TRAINING<span class="caret"></span></button>
							<ul class="dropdown-menu" id="training-menu">
							  	<li><span class="nav-placeholder" aria-disabled="true" title="Safety training details are not published yet" style="border-top: 1px solid #E0DFD5;">SAFETY</span></li>
							  	<li><span class="nav-placeholder" aria-disabled="true" title="Commercial training details are not published yet">COMMERCIAL</span></li>
							  	<li><a href="doc/cert.pdf" target="_blank" rel="noopener noreferrer" style="padding-top: 10px;padding-bottom: 10px; border-bottom: 1px solid #E0DFD5;">HRDF CERTIFICATE</a></li>
							</ul>
<!-- href="doc/tripod_new.pdf" target="_blank" -->
						</li>	
        				<li><a href="contact_new.php" class="auth contact_content">CONTACT</a></li>	
					</ul>							
				</div>	

			</div>	
		</nav>
		<div style="padding-top: 65px;">
			
		</div>




