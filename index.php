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
document.addEventListener('DOMContentLoaded', function() {
	// on document ready, import custom fonts into document.fonts (because web browsers are stupidaf), then run initStreamOverlay() (./js_scripts/main.js)
	let custom_fonts = JSON.parse('<?php echo str_replace("\r\n", "", file_get_contents('./fonts/font_registry.json')); ?>');
	let loaded_fonts = 0;
	custom_fonts.forEach(font => {
		new FontFace(font.name, 'url(./fonts/'+font.filename+')', {
			style: font.style,
			weight: font.weight
		}).load().then(loaded_font => {
			document.fonts.add(loaded_font);
			loaded_fonts++;
			if (loaded_fonts == custom_fonts.length) {
				initStreamOverlay();
			}
		});
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
	<div class="row">
		<div class="col" style="width: 80%;" id="navigation"></div>
		<div class="col" style="width: 20%; text-align: right;">
			<button onclick="onSaveAction();">Save</button>
		</div>
	</div>
</div>
<div id="main"></div>
<div style="font-family: 'JuanCock';"></div>
</body>
</html>