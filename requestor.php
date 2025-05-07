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
	
	default:
		echo json_encode((object)['error_msg' => 'No application defined.']);
		break;
}

?>