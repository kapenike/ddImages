<?php

class directoryFileList {
	
	// $list(array) - array to append file path list to, $dir(string) - starting directory
	function get($list, $dir) {
		$files = scandir($dir);
		forEach($files as $file) {
			if ($file != '.' && $file != '..') {
				if (is_dir($dir.'/'.$file)) {
					$list = array_merge($this->grab($list, $dir.'/'.$file));
				} else {
					$list[] = $dir.'/'.$file;
				}
			}
		}
		return $list;
	}
	
}

?>