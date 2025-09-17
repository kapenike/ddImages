<?php

// config host:port and init controller key
$config = (object)[
	'host' => gethostbyname(trim(`hostname`)),
	'ws_port' => 8137,
	'ws_pid' => null,
	'host_port' => 8136,
	'host_pid' => null,
	'controller_key' => bin2hex(random_bytes(16))
];

// detect if host server is already running, ifso, exit
$ch = curl_init($config->host.':'.$config->host_port);
curl_setopt($ch, CURLOPT_NOBODY, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($status >= 200 && $status < 400) {
	echo json_encode(false);
	exit;
}

// stash host:port details for use in websocket server
file_put_contents('web_socket_server_details.json', json_encode($config));

// start websocket server and save pid
$config->ws_pid = trim(shell_exec('php server.php > /dev/null 2>&1 & echo $!'));

// start host server and save pid
$config->host_pid = trim(shell_exec('php -S '.$config->host.':'.$config->host_port.' client.php > /dev/null 2>&1 & echo $!'));

// re-stash config after pids have been logged
file_put_contents('web_socket_server_details.json', json_encode($config));

// inform front-end of socket server details
echo json_encode($config);

?>