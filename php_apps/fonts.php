<?php

class fonts {
	
	function __construct() {
		// if registry file doesnt exist, create its skeleton
		if (!file_exists(getBasePath().'/fonts/font_registry.json')) {
			file_put_contents(getBasePath().'/fonts/font_registry.json', json_encode([
				'Arial' => [ 'is_default' => true ],
				'Verdana' => [ 'is_default' => true ],
				'Tahoma' => [ 'is_default' => true ],
				'Trebuchet MS' => [ 'is_default' => true ],
				'Times New Roman' => [ 'is_default' => true ],
				'Georgia' => [ 'is_default' => true ],
				'Garamond' => [ 'is_default' => true ],
				'Courier New' => [ 'is_default' => true ],
				'Brush Script MT' => [ 'is_default' => true ]
			]));
		}
	}
	
	function getFontRegistry() {
		return json_decode(str_replace("\r\n", "", file_get_contents(getBasePath().'/fonts/font_registry.json')));
	}
	function saveFontRegistry($registry) {
		return file_put_contents(getBasePath().'/fonts/font_registry.json', json_encode($registry));
	}
	
	function generateFontCSS($print_style_tags = true) {

		// load font registry
		$font_registry = $this->getFontRegistry();
		
		// print leading style tag
		if ($print_style_tags) {
			echo '<style>'."\r\n";
		}
		
		// print font faces
		foreach ($font_registry as $font_face => $fonts) {
			if (!isset($fonts->is_default)) {
				foreach ($fonts->fonts as $font) {
					echo '
					@font-face {
						font-family: \''.$font_face.'\';
						src: url(\'/fonts/'.$font->filename.'\') format(\''.$font->format.'\');
						font-style: '.$font->style.';
						font-weight: '.$font->weight.';
					}
					'."\r\n";
				}
			}
		}
		
		// print tail style tag
		if ($print_style_tags) {
			echo '</style>'."\r\n";
		}
	}
	
	function getFontList() {
		return str_replace("\r\n", "", file_get_contents('./fonts/font_registry.json'));
	}
	
	function update($post, $files) {
		
		// load font registry
		$font_registry = $this->getFontRegistry();
		
		// create
		if ($post['font_registration_type'] == 'create') {
			
			$font_registry->{$post['font_face_name']} = [
				'fonts' => []
			];
			
			$this->saveFontRegistry($font_registry);
			
			// respond and exit
			app('respond')->json(true, 'Font Face successfully created.', [
				'name' => $post['font_face_name'],
				'font_face' => $font_registry->{$post['font_face_name']}
			]);
			
		}
		
		// update
		$font_dir = getBasePath().'/fonts/';
		
		// saved font face
		$font_face = $font_registry->{$post['font_registration_type']};
		
		// loop previous file names and stash
		$incoming = [];
		foreach ($post['fonts_ref_id'] as $id) {
			if ($post['previous_file_name_'.$id] != '') {
				$incoming[] = $post['previous_file_name_'.$id];
			}
		}
		
		// check against registry to determine which fonts are removed
		for ($i=0; $i<count($font_face->fonts); $i++) {
			if (!in_array($font_face->fonts[$i]->filename, $incoming)) {
				// removed font
				unlink($font_dir.$font_face->fonts[$i]->filename);
				array_splice($font_face->fonts, $i, 1);
				$i--;
			}
		}
		
		// extensions for data conversions with use in javascript
		$ext_to_format = (object)[
			'woff' => 'woff',
			'woff2' => 'woff2',
			'otf' => 'opentype',
			'ttf' => 'truetype'
		];
		
		// reference_var
		$current_font = null;
		
		// loop fonts and update existing and insert new
		foreach ($post['fonts_ref_id'] as $id) {
			
			// new
			if ($post['previous_file_name_'.$id] == '') {
				
				// not a valid font file
				if (!isset($ext_to_format->{pathinfo($files['font_file_'.$id.'_0']['name'], PATHINFO_EXTENSION)})) {
					app('respond')->json(false, 'Font file not supported. Acceptable font formats: ('.array_keys($ext_to_format).join(', ').')');
				}
				
				// upload new font file
				$file = app('files')->upload($files['font_file_'.$id.'_0'], $font_dir, [
					'fname' => $post['font_face_name'].'-'.$post['font_style_'.$id].'-'.$post['font_weight_'.$id],
					'allow_overwrite' => true
				]);
				
				// new font entry
				$font_face->fonts[] = (object)[
					'filename' => $file['msg'],
					'weight' => $post['font_weight_'.$id],
					'style' => $post['font_style_'.$id],
					'format' => $ext_to_format->{strtolower(pathinfo($file['msg'], PATHINFO_EXTENSION))}
				];

			} else {
				// update
				
				// find associated saved reference
				for ($i=0; $i<count($font_face->fonts); $i++) {
					if ($font_face->fonts[$i]->filename == $post['previous_file_name_'.$id]) {
						$current_font = &$font_face->fonts[$i];
						break;
					}
				}
				
				// unbreakable break (filename mismatch)
				if ($current_font == null) {
					app('respond')->json(false, 'Mismatched font data!');
				}
				
				// if new file to upload
				if (isset($files['font_file_'.$id.'_0']) && $files['font_file_'.$id.'_0']['size'] > 0) {
					
					// not a valid font file
					if (!isset($ext_to_format->{pathinfo($files['font_file_'.$id.'_0']['name'], PATHINFO_EXTENSION)})) {
						app('respond')->json(false, 'Font file not supported. Acceptable font formats: ('.array_keys($ext_to_format).join(', ').')');
					}
					
					// upload new font file
					$file = app('files')->upload($files['font_file_'.$id.'_0'], $font_dir, [
						'fname' => $post['font_face_name'].'-'.$post['font_style_'.$id].'-'.$post['font_weight_'.$id],
						'allow_overwrite' => true
					]);
					
					// log upload error
					if ($file['status'] == false) {
						app('respond')->json(false, 'Error uploading font file.');
					}
					
					// update font filename
					$current_font->filename = $file['msg'];

					// update format
					$current_font->format = $ext_to_format->{strtolower(pathinfo($current_font->filename, PATHINFO_EXTENSION))};

				}
				
				// update properties
				$current_font->style = $post['font_style_'.$id];
				$current_font->weight = $post['font_weight_'.$id];
				
			}
			
		}
		
		// update registry
		$font_registry->{$post['font_face_name']} = $font_face;
		
		// if name change, remove old
		if ($post['font_face_name'] != $post['font_registration_type']) {
			
			unset($font_registry->{$post['font_registration_type']});
			
			// loop font faces and update naming convention in object and file directory
			for ($i=0; $i<count($font_registry->{$post['font_face_name']}->fonts); $i++) {
				$name_split = explode('-', $font_registry->{$post['font_face_name']}->fonts[$i]->filename);
				if ($name_split[0] == $post['font_registration_type']) {
					array_shift($name_split);
					$rest_of_name = implode('-', $name_split);
					$font_registry->{$post['font_face_name']}->fonts[$i]->filename = $post['font_face_name'].'-'.$rest_of_name;
					rename($font_dir.$post['font_registration_type'].'-'.$rest_of_name, $font_dir.$post['font_face_name'].'-'.$rest_of_name);
				}
			}
		}
		
		// save registry
		$this->saveFontRegistry($font_registry);
		
		// repond
		app('respond')->json(true, 'Font Face successfully updated.', [
			'name' => $post['font_face_name'],
			'name_change' => ($post['font_face_name'] != $post['font_registration_type'] ? $post['font_registration_type'] : false),
			'font_face' => $font_registry->{$post['font_face_name']}
		]);
		
	}
	
	function remove($font_face) {
		
		// load font registry
		$font_registry = $this->getFontRegistry();
		
		// check that font face exists
		if (isset($font_registry->{$font_face})) {
			
			// font directory
			$font_dir = getBasePath().'/fonts/';
			
			// remove each associated font face file
			foreach ($font_registry->{$font_face}->fonts as $font) {
				unlink($font_dir.$font->filename);
			}
			
			// remove font face from registry
			unset($font_registry->{$font_face});
			
			// update registry
			$this->saveFontRegistry($font_registry);
			
			app('respond')->json(true, 'Font Face successfully removed.');
			
		} else {
			
			// error
			app('respond')->json(false, 'Font Face not found.');
			
		}
		
	}
	
}

?>