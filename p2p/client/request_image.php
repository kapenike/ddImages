<?php

function sanitize($v) {
	return str_replace(['/','\\','.'],'',$v);
}

if (isset($_GET['uid']) && isset($_GET['overlay_slug'])) {
	$path = '../../overlay_output/'.sanitize($_GET['uid']).'/'.sanitize($_GET['overlay_slug']).'.png';
	if (file_exists($path)) {
		session_cache_limiter('public');
		header('Cache-Control: max-age=0, public');
		header('Expires: '. gmdate('D, d M Y H:i:s \G\M\T', time()));
		header('Content-Type: image/png');
		readfile($path);
	} else {
		http_response_code(404);
	}
} else {
	http_response_code(404);
}

?>