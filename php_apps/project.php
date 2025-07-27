<?php

class project {
	
	private $registry;
	
	// on load, get list of project uid | project name pair
	function __construct() {
		if (!file_exists(getBasePath().'/php_apps/app_data/project_registry.json')) {
			file_put_contents(getBasePath().'/php_apps/app_data/project_registry.json', '{}');
		}
		$this->registry = json_decode(file_get_contents(getBasePath().'/php_apps/app_data/project_registry.json'));
	}
	
	function returnRegistry() {
		app('respond')->json(true, $this->registry);
	}
	
	// save current project registry
	function saveRegistry() {
		file_put_contents(getBasePath().'/php_apps/app_data/project_registry.json', json_encode($this->registry));
	}
	
	function updateSettings($uid, $post) {
		
		// update registry with new title
		$this->registry->{$uid} = $post['project_title'];
		$this->saveRegistry();
		
		// get settings file, update, then put back
		/*
		$settings = json_decode(file_get_contents(getBasePath().'/data/'.$uid.'/container.json'));
		$settings->settings->update some setting
		file_put_contents(getBasePath().'/data/'.$uid.'/container.json', json_encode($settings));
		*/
		
		// all good
		app('respond')->json(true, 'project settings updated.');
	}
	
	function register($project_name) {
		
		// request new uid
		$uid = app('uid')->generate();
		
		// add to registry
		$this->registry->{$uid} = $project_name;
		
		// save registry
		$this->saveRegistry();
		
		// create project directory
		mkdir(getBasePath().'/data/'.$uid);
		
		// create project overlay output directory
		mkdir(getBasePath().'/overlay_output/'.$uid);
		
		// create project sources directory
		mkdir(getBasePath().'/data/'.$uid.'/sources');
		
		// create project data sets directory
		mkdir(getBasePath().'/data/'.$uid.'/datasets');
		
		// create skeleton data set registry file
		file_put_contents(getBasePath().'/data/'.$uid.'/datasets/registry.json', json_encode((object)[]));
		
		// create project overlay data directory
		mkdir(getBasePath().'/data/'.$uid.'/overlays');
		
		// create skeleton overlay registry file
		file_put_contents(getBasePath().'/data/'.$uid.'/overlay_registry.json', json_encode([]));
		
		// create project container json file
		file_put_contents(getBasePath().'/data/'.$uid.'/container.json', json_encode((object)[
			'uid' => $uid,
			'settings' => []
		]));
		
		// create skeleton data file
		file_put_contents(getBasePath().'/data/'.$uid.'/data.json', json_encode((object)[]));
		
		// create skeleton ui file
		file_put_contents(getBasePath().'/data/'.$uid.'/ui.json', json_encode([]));
		
		// create skeleton asset registry file
		file_put_contents(getBasePath().'/data/'.$uid.'/asset_registry.json', json_encode((object)[]));
		
		// never fail ... plz
		app('respond')->json(true, 'Registered new project successfully.', [
			'uid' => $uid
		]);
		
	}
	
	// $project_uid(string) - project uid
	function load($project_uid) {
		
		// check if project exists
		if (isset($this->registry->{$project_uid})) {
			
			// path to project data
			$data_path = getBasePath().'/data/'.$project_uid.'/';
			
			// ensure project directory exists
			if (is_dir($data_path)) {
				
				// get project data head
				$project_data = json_decode(file_get_contents($data_path.'container.json'));
				
				// set project title from registry
				$project_data->title = $this->registry->{$project_uid};
				
				// import project data
				$project_data->data = json_decode(file_get_contents($data_path.'data.json'));
				
				// import project assets as a subset to data
				$project_data->data->assets = app('asset')->getRegistry($project_uid);
				
				// data set structures
				$project_data->data->sets = app('dataset')->loadAll($project_uid);
				
				// import project data ui
				$project_data->ui = json_decode(file_get_contents($data_path.'ui.json'));
				
				// import project overlays
				$project_data->overlays = app('overlay')->getAll($project_uid);
				
				// append cwd
				$project_data->cwd = getcwd();
				
				// return project data
				app('respond')->json(true, $project_data);
				
			}
			
		}
		
		app('respond')->json(false, 'project UID not found.');
		
	}
	
	// $project_uid(string), $section - specific data section to load
	function loadSection($project_uid, $section) {
		return json_decode(file_get_contents(getBasePath().'/data/'.$project_uid.'/'.$section.'.json'));
	}
	
	// $project_uid(string) - project uid, $section - section to write to, $save - object
	function save($project_uid, $section, $save) {
		file_put_contents(getBasePath().'/data/'.$project_uid.'/'.$section.'.json', json_encode($save));
		return true;
	}
	
	function updateprojectDetails($uid, $post) {
		
		// get original project data
		$project_data = $this->loadSection($uid, 'data');
		
		// loop post keys and attempt to update object paths within project object
		foreach ($_POST as $key => $value) {
			
			// if variable path
			if (substr($key, 0, 5) == '$var$' && substr($key, -6) == '$/var$') {
				
				// create base path as reference to project data property
				$base_path = &$project_data;
				
				// explode and traverse path until empty
				$path = explode('/', substr($key, 5, -6));

				while(count($path) > 0) {
					// shift from path into reference path
					$base_path = &$base_path->{array_shift($path)};
				}
				$base_path = $value;
				
			}
		}
		
		// update data file with project data object
		$this->save($uid, 'data', $project_data);
		
		app('respond')->json(true, 'project data successfully updated.');
		
	}
	
	function updateprojectDataStructure($uid, $data_structure) {
		$this->save($uid, 'data', $data_structure);
		app('respond')->json(true, 'project data structure successfully updated.');
	}
	
	function updateprojectUI($uid, $data) {
		file_put_contents(getBasePath().'/data/'.$uid.'/ui.json', $data);
		app('respond')->json(true, 'project UI successfully updated.');
	}
	
}

?>