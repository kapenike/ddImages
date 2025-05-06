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
<body id="body">
	<h1>Header 1</h1>
	<h2>Header 2</h2>
	<h3>Header 3</h3>
	<h4>Header 4</h4>
	<h5>Header 5</h5>
	<h6>Header 6</h6>
	<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
</body>
</html>