<html>
<head>
<!-- external scripts -->
<script src="jsui.min.js" type="text/javascript"></script>

<!-- application scripts -->
<?php
function getImportList($list, $dir) {
	$files = scandir($dir);
	forEach($files as $file) {
		if ($file != '.' && $file != '..') {
			if (is_dir($dir.'/'.$file)) {
				$list = array_merge(getImportList($list, $dir.'/'.$file));
			} else {
				$list[] = $dir.'/'.$file;
			}
		}
	}
	return $list;
}

// import all scripts from "ui_scripts"
forEach(getImportList([], './ui_scripts') as $file) {
	echo '<script src="'.$file.'" type="text/javascript"></script>'."\r\n";
}
?>

<script>
// init application (./ui_scripts/main.js)
document.addEventListener("DOMContentLoaded", function() {
	initStreamOverlay();
});
</script>

<!-- font init -->
<link rel="stylesheet" href="./fonts/fonts.css">

<!-- main css -->
<link rel="stylesheet" href="main.css">

</head>
<body id="body"></body>
</html>