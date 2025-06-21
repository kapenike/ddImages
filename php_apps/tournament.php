<?php

class tournament {
	
	private $registry;
	
	// on load, get list of tournament uid | tournament name pair
	function __construct() {
		$this->registry = json_decode(file_get_contents(getBasePath().'/php_apps/app_data/tournament_registry.json'));
	}
	
	// save current tournament registry
	function saveRegistry() {
		file_put_contents(getBasePath().'/php_apps/app_data/tournament_registry.json', json_encode($this->registry));
	}
	
	function register($tournament_name) {
		
		// request new uid
		$uid = app('uid')->generate();
		
		// add to registry
		$this->registry->{$uid} = $tournament_name;
		
		// save registry
		$this->saveRegistry();
		
		// create tournament directory
		mkdir(getBasePath().'/data/'.$uid);
		
		// create tournament overlay directory
		mkdir(getBasePath().'/overlay_output/'.$uid);
		
		// create tournament sources directory
		mkdir(getBasePath().'/data/'.$uid.'/sources');
		
		// create tournament teams directory
		mkdir(getBasePath().'/data/'.$uid.'/teams');
		
		// create skeleton teams registry file
		file_put_contents(getBasePath().'/data/'.$uid.'/teams/team_registry.json', json_encode((object)[]));
		
		// create tournament container json file
		file_put_contents(getBasePath().'/data/'.$uid.'/container.json', json_encode((object)['uid' => $uid]));
		
		// create skeleton data file
		file_put_contents(getBasePath().'/data/'.$uid.'/data.json', json_encode((object)[]));
		
		// create skeleton ui file
		file_put_contents(getBasePath().'/data/'.$uid.'/ui.json', json_encode([]));
		
		// create skeleton asset registry file
		file_put_contents(getBasePath().'/data/'.$uid.'/asset_registry.json', json_encode((object)[]));
		
		// never fail ... plz
		app('respond')->json(true, 'Registered new tournament successfully.');
		
	}
	
	// $tournament_uid(string) - tournament uid
	function load($tournament_uid) {
		
		// check if tournament exists
		if (isset($this->registry->{$tournament_uid})) {
			
			// path to tournament data
			$data_path = getBasePath().'/data/'.$tournament_uid.'/';
			
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
				app('respond')->json(true, $tournament_data);
				
			}
			
		}
		
		app('respond')->json(false, 'Tournament UID not found.');
		
	}
	
	// $tournament_uid(string), $section - specific data section to load
	function loadSection($tournament_uid, $section) {
		return json_decode(file_get_contents(getBasePath().'/data/'.$tournament_uid.'/'.$section.'.json'));
	}
	
	// $tournament_uid(string) - tournament uid, $section - section to write to, $save - object
	function save($tournament_uid, $section, $save) {
		file_put_contents(getBasePath().'/data/'.$tournament_uid.'/'.$section.'.json', json_encode($save));
		return true;
	}
	
	function updateTournamentDetails($uid, $post) {
		
		// get original tournament data
		$tournament_data = $this->loadSection($uid, 'data');
		
		// loop post keys and attempt to update object paths within tournament object
		foreach ($_POST as $key => $value) {
			
			// if variable path
			if (substr($key, 0, 5) == '$var$' && substr($key, -6) == '$/var$') {
				
				// create base path as reference to tournament data property
				$base_path = &$tournament_data;
				
				// explode and traverse path until empty
				$path = explode('/', substr($key, 5, -6));

				while(count($path) > 0) {
					// shift from path into reference path
					$base_path = &$base_path->{array_shift($path)};
				}
				$base_path = $value;
				
			}
		}
		
		// update data file with tournament data object
		$this->save($uid, 'data', $tournament_data);
		
		app('respond')->json(true, 'Tournament data successfully updated.');
		
	}
	
	function updateTournamentDataStructure($uid, $data_structure) {
		$this->save($uid, 'data', $data_structure);
		app('respond')->json(true, 'Tournament data structure successfully updated.');
	}
	
	function updateTournamentUI($uid, $data) {
		file_put_contents(getBasePath().'/data/'.$uid.'/ui.json', $data);
		app('respond')->json(true, 'Tournament UI successfully updated.');
	}
	
}

?>