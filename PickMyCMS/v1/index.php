<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/css; charset=utf-8" />
		<title>Pick My CMS</title>
		<link rel="stylesheet" type="text/css" href="/mittwald_system_pages/css/style.css">   
		<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
		<!--[if lte IE 6]>
			<style type="text/css">
				div, img{ behavior:url(/mittwald_system_pages/scripts/iepngfix.htc) }
			</style>
		<![endif]-->
		<script>
			$(document).ready( function() { 
        		$('.centered').load('completed.php');
    		}); 
		</script>
		<style>
			.centered {
				max-width: 1000px;
				display: block;
				margin: 0 auto;
				text-align: center;
			}

			.loader {
				width: 100%;
				height: 100%;
			}
		</style>
	</head>
	<body>
		<div class="centered">
			<h1>Wilkommen bei Pick My CMS</h1>
			<div class="loader">
				<div class="loader-message">
					<p>Plugin und CMS Daten werden im Hintergrund überprüft...</p>
				</div>
			</div>
		</div>
	</body>
</html>
