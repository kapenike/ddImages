<?php

require('server_details.php'); 

$details = requestServerDetails();

if ($details !== false) {
	
	// kill client
	shell_exec('kill '.$details->host_pid);
	
	// kill websocket
	shell_exec('kill '.$details->ws_pid);
	
	echo json_encode(true);
	
}

?>