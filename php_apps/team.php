<?php

class team {
	
	private $registry;
	
	// on load, get list of tournament uid | team name pair
	function __construct() {
		$this->registry = json_decode(file_get_contents('./php_apps/app_data/team_registry.json'));
	}
	
	// save current team registry
	function saveRegistry() {
		file_put_contents('./php_apps/app_data/team_registry.json', json_encode($this->registry));
	}
	
	function getRegistry() {
		return $this->registry;
	}
	
	function register($team_name) {
		
		// request new uid
		$uid = app('uid')->generate();
		
		// add to registry
		$this->registry->{$uid} = $team_name;
		
		// save registry
		$this->saveRegistry();
		
		// create team directory
		mkdir('./data/team/'.$uid);
		
		// create team sources directory
		mkdir('./data/team/'.$uid.'/sources/');
		
		// create team skeleton json file
		file_put_contents('./data/team/'.$uid.'/'.$uid.'.json', json_encode((object)[
			'uid' => $uid,
			'team_name' => $team_name,
			'banner_logo' => null,
			'emblem_logo' => null,
			'primary_color' => '#000000',
			'secondary_color' => '#ffffff',
			'roster' => []
		]));
		
		// return uid
		return $uid;
		
	}
	
	// $team_uid(string) - team_uid
	function load($team_uid) {
		
		// check if team exists
		if (isset($this->registry->{$team_uid})) {
			
			// path to team data
			$data_path = './data/team/'.$team_uid.'/'.$team_uid.'.json';
			
			// ensure team data file exists
			if (file_exists($data_path)) {
				
				// get team data
				$team_data = json_decode(file_get_contents($data_path));
				
				// return team data
				return $team_data;
				
			}
			
		}
		
		return json_encode((object)['error_msg' => 'Team UID not found.']);
		
	}
	
	// $team_uid(string) - team uid, $save - object
	function save($team_uid, $save) {
		file_put_contents('./data/team/'.$team_uid.'/'.$team_uid.'.json', json_encode($save));
		return true;
	}
	
}

?>