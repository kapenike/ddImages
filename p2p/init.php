<?php
$OS = file_get_contents('os.txt');

require('server_details.php'); 

// detect if host server is already running, ifso, exit
if (serverIsRunning()) {
	echo json_encode(false);
	exit;
}

// use system shell to get local ipv4 address
if ($OS == 'WINDOWS') {
	$ipv4 = trim(explode("\n", explode('IPv4 Address. . . . . . . . . . . :', shell_exec('ipconfig'))[1])[0]);
} else if ($OS == 'LINUX') {
	$ipv4 = trim(explode('/', explode(' brd', explode('inet ', shell_exec('ip -4 addr show'))[2])[0])[0]);
}

// config host:port and init controller key
$config = (object)[
	'host' => $ipv4,
	'ws_port' => 8137,
	'ws_pid' => null,
	'host_port' => 8136,
	'host_pid' => null,
	'controller_key' => bin2hex(random_bytes(16))
];

// stash host:port details for use in websocket server
file_put_contents('web_socket_server_details.json', json_encode($config));

// start websocket server and save pid
if ($OS == 'WINDOWS') {
	// run non-returning command to start web socket server, no PIDs are saved for windows because a query is required to shut them down at kill
	pclose(popen('start /B .\..\php\php.exe web_socket_server.php > NUL 2>&1', 'r'));
} else if ($OS == 'LINUX') {
	$config->ws_pid = trim(shell_exec('php web_socket_server.php > /dev/null 2>&1 & echo $!'));
}

// start host server and save pid
if ($OS == 'WINDOWS') {
	// run non-returning command to start web socket server, no PIDs are saved for windows because a query is required to shut them down at kill
	pclose(popen('start /B .\..\php\php.exe -S '.$config->host.':'.$config->host_port.' -t ./client > NUL 2>&1', 'r'));
} else if ($OS == 'LINUX') {
	$config->host_pid = trim(shell_exec('php -S '.$config->host.':'.$config->host_port.' -t ./client > /dev/null 2>&1 & echo $!'));
}

// re-stash config after pids have been logged
file_put_contents('web_socket_server_details.json', json_encode($config));

// inform front-end of socket server details
echo json_encode($config);

?>