<?php

function getBasePath() {
	$cwd = getcwd();
	if (!str_contains($cwd, 'ddImages')) {
		http_response_code(400);
	}
	$pos = strrpos($cwd, 'ddImages');
	return substr($cwd, 0, $pos).'ddImages/';
}

// get stashed server data
function requestServerDetails() {
	if (!file_exists(getBasePath().'/p2p/web_socket_server_details.json')) {
		return false;
	}
	return json_decode(file_get_contents(getBasePath().'/p2p/web_socket_server_details.json'));
}

// detect if http client server is running
function serverIsRunning($host = null, $port = null) {
	if ($host == null || $port == null) {
		$config = requestServerDetails();
		if ($config == false) {
			return false;
		}
		$host = $config->host;
		$port = $config->host_port;
	}
	$ch = curl_init($host.':'.$port);
	curl_setopt($ch, CURLOPT_NOBODY, true);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_TIMEOUT, 1);
	curl_exec($ch);
	$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);
	if ($status >= 200 && $status < 400) {
		return true;
	}
	return false;
}

// front end request for if-running and getting server details
if (isset($_POST) && isset($_POST['request_server_details'])) {
	if (serverIsRunning()) {
		echo json_encode(requestServerDetails());
	} else {
		echo json_encode(false);
	}
}

?>