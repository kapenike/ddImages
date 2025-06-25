<?php

class overlay {
	
	function getRegistry($tournament_uid) {
		return json_decode(file_get_contents(getBasePath().'/data/'.$tournament_uid.'/overlay_registry.json'));
	}
	
	function saveRegistry($tournament_uid, $data) {
		file_put_contents(getBasePath().'/data/'.$tournament_uid.'/overlay_registry.json', json_encode($data));
	}
	
	function export($post, $tournament_uid) {
		foreach ($post['changed'] as $slug) {
			// file_get_contents auto converts base64 png to image, write to overlay_output/tournament_uid/slug path
			file_put_contents(getBasePath().'/overlay_output/'.$tournament_uid.'/'.$slug.'.png', file_get_contents($post[$slug]));
		}
		app('respond')->json(true, 'Overlay export successful.');
	}
	
	function getAll($tournament_uid) {
		
		// return all overlays as master object
		$registry = $this->getRegistry($tournament_uid);
		
		$overlay_object = (object)[];
		
		foreach ($registry as $entry) {
			$overlay_object->{$entry} = json_decode(file_get_contents(getBasePath().'/data/'.$tournament_uid.'/overlays/'.$entry.'.json'));
		}
		
		return $overlay_object;
	}
	
}

?>