<?php
require 'app.php';
?>

<html>
<head>
<?php
// import all scripts from "ui_scripts"
forEach(app('directoryFileList')->get([], './js_scripts') as $file) {
	echo '<script src="'.$file.'" type="text/javascript"></script>'."\r\n";
}
?>

<script>
// init application (./js_scripts/main.js)
document.addEventListener('DOMContentLoaded', function() {
	document.fonts.ready.then(function () {
		initStreamOverlay();
	});
});
</script>

<!-- font init -->
<link rel="stylesheet" href="./fonts/fonts.css">

<!-- main css -->
<link rel="stylesheet" href="main.css">

</head>
<body id="body">
<div class="navigation">

</div>
<div id="main"></div>
</body>
</html>