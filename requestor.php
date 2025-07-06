<?php
require 'app.php';


// application switch, defined by string value in $_POST['application']
switch($_POST['application']) {
	
	case 'create_tournament':
		app('tournament')->register($_POST['tournament_name']);
		break;
		
	case 'update_tournament_settings':
		app('tournament')->updateSettings($_POST['uid'], $_POST);
		break;
	
	case 'load_tournament_registration':
		// return tournament registry
		app('tournament')->returnRegistry();
		break;
	
	case 'load_tournament_data':
		// returns entire data set of tournament for initial load
		app('tournament')->load($_POST['uid']);
		break;
	
	case 'export_overlays':
		// takes list of base64 images and exports them as pngs
		app('overlay')->export($_POST, $_POST['uid']);
		break;
		
	case 'create_update_overlay':
		app('overlay')->createUpdate($_POST);
		break;
		
	case 'update_overlay_layers':
		app('overlay')->updateLayers($_POST);
		break;
		
	case 'remove_overlay':
		app('overlay')->remove($_POST['tournament_uid'], $_POST['overlay_slug']);
		break;
		
	case 'update_tournament_details':
		app('tournament')->updateTournamentDetails($_POST['uid'], $_POST);
		break;
		
	case 'update_tournament_details_ui_edit':
		// write tournament ui structure data
		app('tournament')->updateTournamentUI($_POST['uid'], $_POST['data']);
		break;
		
	case 'update_tournament_data_structure':
		// update data file with new data structure object
		// this functions just like `update_tournament_details` but with potential structural changes and no variable path fetching
		app('tournament')->updateTournamentDataStructure($_POST['uid'], json_decode($_POST['data_structure']));
		break;
		
	case 'update_team':
		// create and update team data
		app('team')->update($_POST);
		break;
		
	case 'remove_team':
		// remove team
		app('team')->remove($_POST['tournament_uid'], $_POST['team_uid']);
		break;
		
	case 'create_update_asset':
		// create or update an asset
		app('asset')->createUpdateAsset($_POST);
		break;
		
	case 'remove_asset':
		// remove an asset
		app('asset')->removeAsset($_POST['tournament_uid'], $_POST['asset_slug']);
		break;
	
	default:
		app('respond')->json(false, 'No application request defined.');
		break;
}

?>