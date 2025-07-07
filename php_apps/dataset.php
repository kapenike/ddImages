<?php

class dataset {
	
	// get list of tournament uid | dataset name pair
	function getRegistry($tournament_uid) {
		return json_decode(file_get_contents(getBasePath().'/data/'.$tournament_uid.'/datasets/registry.json'));
	}
	
	// save dataset registry
	function saveRegistry($tournament_uid, $data) {
		file_put_contents(getBasePath().'/data/'.$tournament_uid.'/datasets/registry.json', json_encode($data));
	}
	
	function register($tournament_uid, $set_name) {
		
		// request new uid
		$uid = app('uid')->generate($tournament_uid);
		
		// get registry
		$registry = $this->getRegistry($tournament_uid);
		
		// add to registry
		$registry->{$uid} = $set_name;
		
		// save registry
		$this->saveRegistry($tournament_uid, $registry);
		
		// create dataset directory
		mkdir(getBasePath().'/data/'.$tournament_uid.'/datasets/'.$uid);
		
		// create dataset skeleton json file
		file_put_contents(getBasePath().'/data/'.$tournament_uid.'/datasets/'.$uid.'/data.json', json_encode((object)[
			'uid' => $uid,
			'display' => $set_name,
			'structure' => [
				'Display'
			],
			'entries' => (object)[]
		]));
		
		// return uid
		return $uid;
		
	}
	
	function load($tournament_uid, $uid) {
		
		// get registry
		$registry = $this->getRegistry($tournament_uid);
		
		// check if dataset exists
		if (isset($registry->{$uid})) {
			
			// path to dataset data
			$data_path = getBasePath().'/data/'.$tournament_uid.'/datasets/'.$uid.'/data.json';
			
			// ensure dataset file exists
			if (file_exists($data_path)) {
				
				// get dataset
				$dataset = json_decode(file_get_contents($data_path));
				
				// return dataset
				return $dataset;
				
			}
			
		}
		
		return json_encode((object)['error_msg' => 'Data set UID not found.']);
		
	}
	
	// load and return all datasets
	function loadAll($tournament_uid) {
		
		// get registry
		$registry = $this->getRegistry($tournament_uid);
		
		$sets = (object)[];
		foreach($registry as $key=>$value) {
			$sets[$value] = $this->load($tournament_uid, $key)->entries;
		}
		return $sets;
	}

	function save($tournament_uid, $uid, $save) {
		file_put_contents(getBasePath().'/data/'.$tournament_uid.'/datasets/'.$uid.'/data.json', json_encode($save));
		return true;
	}
	
	function update($post) {
		
		/*if ($post['dataset_type'] == 'create') {
			
			// create team
			$uid = $this->register($post['tournament_uid'], $post['team_name']);
			$data = $this->load($post['tournament_uid'], $uid);
			$data->primary_color = $post['team_primary_color'];
			$data->secondary_color = $post['team_secondary_color'];
			$data->roster = $post['team_roster'];
			$this->save($post['tournament_uid'], $uid, $data);
			app('respond')->json(true, $data);
			
		} else {
			
			// update team
			$data = $this->load($post['tournament_uid'], $post['dataset_type']);
			$data->display = $post['team_name'];
			$data->primary_color = $post['team_primary_color'];
			$data->secondary_color = $post['team_secondary_color'];
			$data->roster = $post['team_roster'];
			$this->save($post['tournament_uid'], $data->uid, $data);
			app('respond')->json(true, $data);
			
		}*/
	}
	
	function remove($tournament_uid, $uid) {
		$data_path = getBasePath().'/data/'.$tournament_uid.'/datasets/'.$uid.'/';
		if (is_dir($data_path)) {
			unlink($data_path.'/data.json');
			rmdir($data_path);
			$registry = $this->getRegistry($tournament_uid);
			unset($registry->$uid);
			$this->saveRegistry($tournament_uid, $registry);
			app('respond')->json(true, 'Successfully removed data set entry.');
		}
		app('respond')->json(false, 'Error locating data set.');
	}
	
}

?>