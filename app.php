<?php
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(0);

// no htaccess or hierarchical structure so create a relative base path method
function getBasePath() {
	return explode('phpMyStreamOverlay',getcwd())[0].'phpMyStreamOverlay/';
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