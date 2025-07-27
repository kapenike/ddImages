<?php

class dataset {
	
	// get list of project uid | dataset name pair
	function getRegistry($project_uid) {
		return json_decode(file_get_contents(getBasePath().'/data/'.$project_uid.'/datasets/registry.json'));
	}
	
	// save dataset registry
	function saveRegistry($project_uid, $data) {
		file_put_contents(getBasePath().'/data/'.$project_uid.'/datasets/registry.json', json_encode($data));
	}
	
	function register($project_uid, $set_name) {
		
		// request new uid
		$uid = app('uid')->generate($project_uid);
		
		// get registry
		$registry = $this->getRegistry($project_uid);
		
		// add to registry
		$registry->{$uid} = $set_name;
		
		// save registry
		$this->saveRegistry($project_uid, $registry);
		
		// create dataset directory
		mkdir(getBasePath().'/data/'.$project_uid.'/datasets/'.$uid);
		
		// create dataset skeleton json file
		file_put_contents(getBasePath().'/data/'.$project_uid.'/datasets/'.$uid.'/data.json', json_encode((object)[
			'uid' => $uid,
			'display' => $set_name,
			'structure' => [
				'display'
			],
			'entries' => (object)[]
		]));
		
		// return uid
		return $uid;
		
	}
	
	function load($project_uid, $uid) {
		
		// get registry
		$registry = $this->getRegistry($project_uid);
		
		// check if dataset exists
		if (isset($registry->{$uid})) {
			
			// path to dataset data
			$data_path = getBasePath().'/data/'.$project_uid.'/datasets/'.$uid.'/data.json';
			
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
	function loadAll($project_uid) {
		
		// get registry
		$registry = $this->getRegistry($project_uid);
		
		$sets = (object)[];
		foreach($registry as $key=>$value) {
			$sets->{$value} = $this->load($project_uid, $key);
		}
		return $sets;
	}

	function save($project_uid, $uid, $save) {
		file_put_contents(getBasePath().'/data/'.$project_uid.'/datasets/'.$uid.'/data.json', json_encode($save));
		return true;
	}
	
	function update($post) {
		
		// create and / or load dataset
		$dataset = ($_POST['dataset_manager_type'] == 'create' 
			? $this->load($_POST['project_uid'], $this->register($_POST['project_uid'], $_POST['dataset_title']))
			: $this->load($_POST['project_uid'], $_POST['dataset_manager_type'])
		);
		
		// load all entries against saved and determine if create / update / or remove of sub values
		foreach($_POST['dataset_value_uid'] as $index => $entry_uid) {
			
			// load or create entry uid
			$uid = $entry_uid == 'create' ? app('uid')->generate($_POST['project_uid']) : $entry_uid;
			if (!isset($dataset->entries->{$uid})) {
				$dataset->entries->{$uid} = (object)[];
			}
			
			// update values in dataset and log updated keys
			foreach($_POST['structure'] as $key) {
				foreach($_POST['dataset_value_'.$key] as $index_2 => $value) {
					if ($index == $index_2) {
						$dataset->entries->{$uid}->{$key} = $value;
					}
				}
			}
			
			// remove any dataset key values not present in the posted structure
			foreach (get_object_vars($dataset->entries->{$uid}) as $existing_key) {
				if (!array_search($existing_key, $_POST['structure'])) {
					unset($dataset->entries->{$uid}->{$existing_key});
				}
			}
			
		}
		
		// update structure array in dataset
		$dataset->structure = $_POST['structure'];
			
		// update display title if different and change registry
		if ($dataset->display != $_POST['dataset_title']) {
			$dataset->display = $_POST['dataset_title'];
			if ($_POST['dataset_manager_type'] != 'create') {
				$registry = $this->getRegistry($_POST['project_uid']);
				$registry->{$dataset->uid} = $dataset->display;
				$this->saveRegistry($_POST['project_uid'], $registry);
			}
		}
		
		// save dataset
		$this->save($_POST['project_uid'], $dataset->uid, $dataset);
		
		// return dataset
		app('respond')->json(true, $dataset);
	}
	
	function remove($project_uid, $uid) {
		$data_path = getBasePath().'/data/'.$project_uid.'/datasets/'.$uid.'/';
		if (is_dir($data_path)) {
			unlink($data_path.'/data.json');
			rmdir($data_path);
			$registry = $this->getRegistry($project_uid);
			$registry_name = $registry->{$uid};
			unset($registry->{$uid});
			$this->saveRegistry($project_uid, $registry);
			app('respond')->json(true, 'Successfully removed data set entry.', [
				'display' => $registry_name
			]);
		}
		app('respond')->json(false, 'Error locating data set.');
	}
	
}

?>