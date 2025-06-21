<?php

class respond {
	
	// create uniform json response
	function json($status, $msg, $additional = []) {
		$response = (object)[
			'status' => $status,
			'msg' => $msg
		];
		foreach ($additional as $key=>$value) {
			$response->{$key} = $value;
		}
		echo json_encode($response);
		exit;
	}
	
}

?>