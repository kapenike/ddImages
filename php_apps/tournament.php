<?php

class tournament {
	
	private $registry;
	
	// on load, get list of tournament uid | tournament name pair
	function __construct() {
		$this->registry = json_decode(file_get_contents('./php_apps/app_data/tournament_registry.json'));
	}
	
	// save current tournament registry
	function saveRegistry() {
		file_put_contents('./php_apps/app_data/tournament_registry.json', json_encode($this->registry));
	}
	
	function register($tournament_name) {
		
		// request new uid
		$uid = app('uid')->generate();
		
		// add to registry
		$this->registry->{$uid} = $tournament_name;
		
		// save registry
		$this->saveRegistry();
		
		// create tournament directory
		mkdir('./data/'.$uid);
		
		// create tournament overlay directory
		mkdir('./overlay_output/'.$uid);
		
		// create tournament sources directory
		mkdir('./data/'.$uid.'/sources');
		
		// create tournament teams directory
		mkdir('./data/'.$uid.'/teams');
		
		// create skeleton teams registry file
		file_put_contents('./data/'.$uid.'/teams/team_registry.json', json_encode((object)[]));
		
		// create tournament container json file
		file_put_contents('./data/'.$uid.'/container.json', json_encode((object)['uid' => $uid]));
		
		// create skeleton data file
		file_put_contents('./data/'.$uid.'/data.json', json_encode((object)[]));
		
		// create skeleton ui file
		file_put_contents('./data/'.$uid.'/ui.json', json_encode([]));
		
		// create skeleton asset registry file
		file_put_contents('./data/'.$uid.'/asset_registry.json', json_encode((object)[]));
		
		// never fail ... plz
		return true;
		
	}
	
	// $tournament_uid(string) - tournament uid
	function load($tournament_uid) {
		
		// check if tournament exists
		if (isset($this->registry->{$tournament_uid})) {
			
			// path to tournament data
			$data_path = './data/'.$tournament_uid.'/';
			
			// ensure tournament directory exists
			if (is_dir($data_path)) {
				
				// get tournament data head
				$tournament_data = json_decode(file_get_contents($data_path.'container.json'));
				
				// import tournament data
				$tournament_data->data = json_decode(file_get_contents($data_path.'data.json'));
				
				// import tournament assets as a subset to data
				$tournament_data->data->assets = app('asset')->getRegistry($tournament_uid);
				
				// !!home of data set structure TODO
				$tournament_data->data->sets = (object)[];
				
				// import tournament teams dataset
				$tournament_data->data->sets->teams = app('team')->loadAll($tournament_uid);
				
				// import tournament data ui
				$tournament_data->ui = json_decode(file_get_contents($data_path.'ui.json'));
				
				// import tournament overlays
				$tournament_data->overlays = json_decode(file_get_contents($data_path.'overlay.json'));
				
				// append cwd
				$tournament_data->cwd = getcwd();
				
				// return tournament data
				return $tournament_data;
				
			}
			
		}
		
		return json_encode((object)['error_msg' => 'Tournament UID not found.']);
		
	}
	
	// $tournament_uid(string), $section - specific data section to load
	function loadSection($tournament_uid, $section) {
		return json_decode(file_get_contents('./data/'.$tournament_uid.'/'.$section.'.json'));
	}
	
	// $tournament_uid(string) - tournament uid, $section - section to write to, $save - object
	function save($tournament_uid, $section, $save) {
		file_put_contents('./data/'.$tournament_uid.'/'.$section.'.json', json_encode($save));
		return true;
	}
	
}

?>