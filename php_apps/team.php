<?php

class team {
	
	// get list of tournament uid | team name pair
	function getRegistry($tournament_uid) {
		return json_decode(file_get_contents(getBasePath().'/data/'.$tournament_uid.'/teams/team_registry.json'));
	}
	
	// save team registry
	function saveRegistry($tournament_uid, $data) {
		file_put_contents(getBasePath().'/data/'.$tournament_uid.'/teams/team_registry.json', json_encode($data));
	}
	
	function register($tournament_uid, $team_name) {
		
		// request new uid
		$uid = app('uid')->generate();
		
		// get registry
		$registry = $this->getRegistry($tournament_uid);
		
		// add to registry
		$registry->{$uid} = $team_name;
		
		// save registry
		$this->saveRegistry($tournament_uid, $registry);
		
		// create team directory
		mkdir(getBasePath().'/data/'.$tournament_uid.'/teams/'.$uid);
		
		// create team sources directory
		mkdir(getBasePath().'/data/'.$tournament_uid.'/teams/'.$uid.'/sources/');
		
		// create team skeleton json file
		file_put_contents(getBasePath().'/data/'.$tournament_uid.'/teams/'.$uid.'/team_data.json', json_encode((object)[
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
	
	function load($tournament_uid, $team_uid) {
		
		// get registry
		$registry = $this->getRegistry($tournament_uid);
		
		// check if team exists
		if (isset($registry->{$team_uid})) {
			
			// path to team data
			$data_path = getBasePath().'/data/'.$tournament_uid.'/teams/'.$team_uid.'/team_data.json';
			
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
	
	// load and return all teams
	function loadAll($tournament_uid) {
		
		// get registry
		$registry = $this->getRegistry($tournament_uid);
		
		$team_data = [];
		foreach($registry as $key=>$value) {
			$team_data[$key] = app('team')->load($tournament_uid, $key);
		}
		return $team_data;
	}

	function save($tournament_uid, $team_uid, $save) {
		file_put_contents(getBasePath().'/data/'.$tournament_uid.'/teams/'.$team_uid.'/team_data.json', json_encode($save));
		return true;
	}
	
	function remove($tournament_uid, $team_uid) {
		$team_data_path = getBasePath().'/data/'.$tournament_uid.'/teams/'.$team_uid.'/';
		if (is_dir($team_data_path)) {
			unlink($team_data_path.'/team_data.json');
			rmdir($team_data_path);
			$registry = $this->getRegistry($tournament_uid);
			unset($registry->$team_uid);
			$this->saveRegistry($tournament_uid, $registry);
			return true;
		}
		return false;
	}
	
}

?>