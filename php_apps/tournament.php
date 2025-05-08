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
		mkdir('./data/tournament/'.$uid);
		
		// create tournament overlay directory
		mkdir('./overlay_output/'.$uid);
		
		// create tournament sources directory
		mkdir('./data/tournament/'.$uid.'/sources');
		
		// create tournament skeleton json file
		file_put_contents('./data/tournament/'.$uid.'/'.$uid.'.json', json_encode((object)[
			'uid' => $uid,
			'game' => '',
			'title' => $tournament_name,
			'settings' => [
				'team_size' => 6,
				'venue_fee' => '10',
				'entry_fee' => '10',
			],
			'overlays' => []
		]));
		
		// never fail ... plz
		return true;
		
	}
	
	// $tournament_uid(string) - tournament uid
	function load($tournament_uid) {
		
		// check if tournament exists
		if (isset($this->registry->{$tournament_uid})) {
			
			// path to tournament data
			$data_path = './data/tournament/'.$tournament_uid.'/'.$tournament_uid.'.json';
			
			// ensure tournament data file exists
			if (file_exists($data_path)) {
				
				// return tournament data
				return json_decode(file_get_contents($data_path));
				
			}
			
		}
		
		return json_encode((object)['error_msg' => 'Tournament UID not found.']);
		
	}
	
}

?>