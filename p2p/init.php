<?php

require('server_details.php'); 

// detect if host server is already running, ifso, exit
if (serverIsRunning()) {
	echo json_encode(false);
	exit;
}

// config host:port and init controller key
$config = (object)[
	'host' => '10.1.10.123',
	'ws_port' => 8137,
	'ws_pid' => null,
	'host_port' => 8136,
	'host_pid' => null,
	'controller_key' => bin2hex(random_bytes(16))
];

// stash host:port details for use in websocket server
file_put_contents('web_socket_server_details.json', json_encode($config));

// start websocket server and save pid
$config->ws_pid = trim(shell_exec('php web_socket_server.php > /dev/null 2>&1 & echo $!'));

// start host server and save pid
$config->host_pid = trim(shell_exec('php -S '.$config->host.':'.$config->host_port.' -t ./client > /dev/null 2>&1 & echo $!'));

// re-stash config after pids have been logged
file_put_contents('web_socket_server_details.json', json_encode($config));

// inform front-end of socket server details
echo json_encode($config);

?>