<?php
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
	
		// get original tournament data
		$tournament_data = app('tournament')->loadSection($_POST['uid'], 'data');
		
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
		app('tournament')->save($_POST['uid'], 'data', $tournament_data);
		
		echo json_encode((object)['msg' => 'Tournament data successfully updated.']);
		break;
		
	case 'update_tournament_details_ui_edit':
		// write tournament ui structure data
		file_put_contents(getBasePath().'/data/'.$_POST['uid'].'/ui.json', $_POST['data']);
		break;
		
	case 'update_tournament_data_structure':
		// update data file with new data structure object
		app('tournament')->save($_POST['uid'], 'data', json_decode($_POST['data_structure']));
		echo json_encode((object)['msg' => 'Tournament data structure successfully updated.']);
		break;
		
	case 'update_team':
		
		if ($_POST['team_manager_type'] == 'create') {
			
			// create team
			$uid = app('team')->register($_POST['tournament_uid'], $_POST['team_name']);
			$data = app('team')->load($_POST['tournament_uid'], $uid);
			$data->primary_color = $_POST['team_primary_color'];
			$data->secondary_color = $_POST['team_secondary_color'];
			$data->roster = $_POST['team_roster'];
			app('team')->save($_POST['tournament_uid'], $uid, $data);
			echo json_encode($data);
			
		} else {
			
			// update team
			$data = app('team')->load($_POST['tournament_uid'], $_POST['team_manager_type']);
			$data->display = $_POST['team_name'];
			$data->primary_color = $_POST['team_primary_color'];
			$data->secondary_color = $_POST['team_secondary_color'];
			$data->roster = $_POST['team_roster'];
			app('team')->save($_POST['tournament_uid'], $data->uid, $data);
			echo json_encode($data);
			
		}
		
		break;
		
	case 'remove_team':
		app('team')->remove($_POST['tournament_uid'], $_POST['team_uid']);
		break;
		
	case 'create_update_asset':
		echo json_encode(app('asset')->createUpdateAsset($_POST['tournament_id'], (object)[
			'type' => $_POST['asset_registration_type'],
			'display' => $_POST['asset_name'],
			'slug' => $_POST['asset_slug'],
			'file' => (isset($_FILES['asset_file_0']) ? $_FILES['asset_file_0'] : null),
			'offset_x' => $_POST['asset_offset_x'],
			'offset_y' => $_POST['asset_offset_y']
		]));
		break;
		
	case 'remove_asset':
		app('asset')->removeAsset($_POST['tournament_uid'], $_POST['asset_slug']);
		break;
	
	default:
		echo json_encode((object)['error_msg' => 'No application defined.']);
		break;
}

?>