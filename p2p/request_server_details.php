<?php

if (!file_exists('web_socket_server_details.json')) {
	
	echo json_encode(false);
	
} else {
	
	echo file_get_contents('web_socket_server_details.json');
	
}

?>