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