<?php

class overlay {
	
	function export($post, $uid) {
		foreach ($post['changed'] as $slug) {
			// file_get_contents auto converts base64 png to image, write to overlay_output/uid/slug path
			file_put_contents(getBasePath().'/overlay_output/'.$uid.'/'.$slug.'.png', file_get_contents($post[$slug]));
		}
		app('respond')->json(true, 'Overlay export successful.');
	}
	
}

?>