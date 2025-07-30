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

<?php app('fonts')->generateFontCSS(); ?>

<script>
const custom_font_list = [];
document.addEventListener('DOMContentLoaded', function() {
	// on document ready, import custom fonts into document.fonts, then run initStreamOverlay()
	let custom_fonts = JSON.parse('<?php echo app('fonts')->getFontList(); ?>');
	let loaded_fonts = 0;
	custom_fonts.forEach(font => {
		if (!custom_font_list.includes(font.name)) {
			custom_font_list.push(font.name);
		}
		new FontFace(font.name, 'url(./fonts/'+font.filename+')', {
			style: font.style,
			weight: font.weight ?? 400
		}).load().then(loaded_font => {
			document.fonts.add(loaded_font);
			loaded_fonts++;
			if (loaded_fonts == custom_fonts.length) {
				// (./js_scripts/main.js)
				initStreamOverlay();
			}
		});
	});
	if (custom_fonts.length == 0) {
		// (./js_scripts/main.js)
		initStreamOverlay();
	}
});
</script>

<!-- main css -->
<link rel="stylesheet" href="main.css">

</head>
<body id="body">
<div class="navigation" style="display: none;"></div>
<div id="main"></div>
</body>
</html>