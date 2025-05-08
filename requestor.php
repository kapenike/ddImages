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
	
	default:
		echo json_encode((object)['error_msg' => 'No application defined.']);
		break;
}

?>