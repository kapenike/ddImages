<?php
// display errors
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require 'app.php';


// application switch, defined by string value in $_POST['application']
switch($_POST['application']) {
	
	case 'load_tournament_data':
		echo json_encode(app('tournament')->load($_POST['uid']));
		break;
	
	case 'export_overlays':
		// uses client side data, no need to re-pull server-side tournament data
		foreach ($_POST['changed'] as $slug) {
			// file_get_contents auto converts base64 png to image, write to overlay_output/uid/slug path
			file_put_contents('./overlay_output/'.$_POST['uid'].'/'.$slug.'.png', file_get_contents($_POST[$slug]));
		}
		echo json_encode((object)['msg' => 'Overlay export successful.']);
		break;
		
	case 'update_tournament_details':
		$tournament_data = app('tournament')->load($_POST['uid']);
		// loop post keys and attempt to update object paths within tournament object
		foreach ($_POST as $key => $value) {
			// if variable path
			if ($key[0] == '$' && substr($key, -1) == '$') {
				// create base path as reference to tournament data property
				$base_path = &$tournament_data->data;
				// explode and traverse path until empty
				$path = explode('/', substr($key, 1, -1));
				while(count($path) > 0) {
					// shift from path into reference path
					$base_path = &$base_path->{array_shift($path)};
				}
				$base_path = $value;
			}
		}
		app('tournament')->save($_POST['uid'], $tournament_data);
		echo json_encode((object)['msg' => 'Tournament data successfully updated.']);
		break;
		
	case 'get_team_data':
		$team_data = [];
		foreach(app('team')->getRegistry() as $key=>$value) {
			$team_data[] = app('team')->load($key);
		}
		echo json_encode($team_data);
		break;
		
	case 'update_team':
		
		if ($_POST['team_manager_type'] == 'create') {
			
			// create team
			$uid = app('team')->register($_POST['team_name']);
			$data = app('team')->load($uid);
			$data->primary_color = $_POST['team_primary_color'];
			$data->secondary_color = $_POST['team_secondary_color'];
			$data->roster = $_POST['team_roster'];
			app('team')->save($uid, $data);
			echo json_encode($data);
			
		} else {
			
			// update team
			$data = app('team')->load($_POST['team_manager_type']);
			$data->team_name = $_POST['team_name'];
			$data->primary_color = $_POST['team_primary_color'];
			$data->secondary_color = $_POST['team_secondary_color'];
			$data->roster = $_POST['team_roster'];
			app('team')->save($data->uid, $data);
			echo json_encode($data);
			
		}
		
		break;
	
	default:
		echo json_encode((object)['error_msg' => 'No application defined.']);
		break;
}

?>