<?php
// $APP stores loaded classes as an instance of app({$class})
$APP = (object)[];

// app() is an instance and an initializer
function app($app, ...$params) {
	global $APP;
	if (!isset($APP->$app)) {
		require('./php_apps/'.$app.'.php');
		$APP->$app = new $app(...$params);
	}
	return $APP->$app;
}
?>

<html>
<head>
<?php
// import all scripts from "ui_scripts"
forEach(app('directoryFileList')->grab([], './js_scripts') as $file) {
	echo '<script src="'.$file.'" type="text/javascript"></script>'."\r\n";
}
?>

<script>
// init application (./js_scripts/main.js)
document.addEventListener('DOMContentLoaded', function() {
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