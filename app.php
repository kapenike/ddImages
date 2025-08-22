<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// no htaccess or hierarchical structure so create a relative base path method
function getBasePath() {
	$cwd = getcwd();
	if (!str_contains($cwd, 'ddImages')) {
		http_response_code(400);
	}
	$pos = strrpos($cwd, 'ddImages');
	return substr($cwd, 0, $pos).'ddImages/';
}

// $APP stores loaded classes as an instance of app({$class})
$APP = (object)[];

// app() is an instance and an initializer
function app($app, ...$params) {
	global $APP;
	if (!isset($APP->$app)) {
		require(getBasePath().'/php_apps/'.$app.'.php');
		$APP->$app = new $app(...$params);
	}
	return $APP->$app;
}
?>