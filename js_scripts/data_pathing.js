function isPathVariable(value) {
	return typeof value === 'string' && value.indexOf('$var$') > -1 && value.indexOf('$/var$');
}

// not all comparisons are similar, allow ui setup to determine value depth to compare
function getDepthComparisonValue(field) {
	return getRealValue(field.source, (typeof field.value_depth === 'undefined' ? null : field.value_depth));
}

function getRealVariableParts(value) {
	let return_data = [];
	let split = value.replace('$var$','$delimiter$').replace('$/var$','$delimiter$').split('$delimiter$');	
	for (let i=0; i<split.length; i++) {
		if (i%2 == 0) {
			// real part
			if (split[i] != '') {
				return_data.push({ real: split[i] });
			}
		} else {
			// variable part
			return_data.push({ variable: split[i] });
		}
	}
	return return_data;
}

function trackChangeSource(source, value) {
	
	// loop source / tracking span pairs and update on source change
	GLOBAL.track_sources.pairs.forEach(tracker => {
		if (tracker.source == source) {
			Select('#tracking_source_'+tracker.id, {
				innerHTML: value
			});
		}
	});
	
}

function trackSourceChange(source) {
	
	// output buffer
	let output = '<span>';
	
	// loop source real and variable parts
	getRealVariableParts(source).forEach(split_part => {
		if (split_part.variable) {
			
			// contain variable parts within an id tracking span
			output += '<span id="tracking_source_'+(++GLOBAL.track_sources.inc)+'">'+getRealValue('$var$'+split_part.variable+'$/var$')+'</span>';

			// create source -> tracking span id pair
			GLOBAL.track_sources.pairs.push({
				id: GLOBAL.track_sources.inc,
				source: '$var$'+split_part.variable+'$/var$'
			});
			
		} else {
			
			// append real part span
			output += '<span>'+split_part.real+'</span>';
			
		}
	});
	
	return output+'</span>';
}

function getRealValue(value, depth = null, base_path = GLOBAL.active_tournament.data) {
	
	// detect if value contains a path variable
	if (isPathVariable(value)) {
		
		// identify real and variable path parts
		let var_real_parts = getRealVariableParts(value);
		
		// if global flag, add variable paths to overlay sources
		if (GLOBAL.generate_sources == true) {
			var_real_parts.forEach(split_part => {
				if (split_part.variable) {
					GLOBAL.active_tournament.overlays[GLOBAL.active_overlay_index].sources.push('$var$'+split_part.variable+'$/var$');
				}
			});
		}
		
		let return_value = '';
		
		// log change to current depth
		if (depth != null) {
			depth -= 1;
		}
		
		// loop variable parts and nest continue their chaining if depth allows, then append for final return
		for (let i=0; i<var_real_parts.length; i++) {
			let split_part = var_real_parts[i];
			
			if (split_part.variable) {
				
				let path = split_part.variable.split('/');
				let reference_path = base_path;
				
				// pull from use path
				while (path.length > 0) {
					
					// pathing protection
					let path_part = path.shift();
					if (typeof reference_path[path_part] === 'undefined') {
						console.error('Attempting to access undefined object from variable path: '+value+', Undefined key path starting at: '+[path_part, ...path].join('/'));
						return '!!Corrupted Data Path!!';
					}
					
					// shift from use path into reference path
					reference_path = reference_path[path_part];
					
				}
				
				// edge case .. if depth allows access to a non string value, concatting string method not allowed, return object
				// (e.g.): getRealValue on dataset to return object structure or on image object for use on overlay print
				// 		should only be used to combine string values from data input or a string value + new path variable
				if (typeof reference_path !== 'string') {
					return_value = reference_path;
					break;
				}
				
				// if proper depth found, append variable path result rather than searching further
				if (depth == 0) {
					return_value += reference_path;
				} else {
					// duplicate edge case for nested lookup (passing non null depth and object reference)
					let nested_loopkup = getRealValue(reference_path, depth, base_path);
					if (typeof nested_loopkup !== 'string') {
						return_value = nested_loopkup;
						break;
					}
					return_value += nested_loopkup;
				}
				
			} else {
				// append real part
				return_value += split_part.real;
			}
		}
		
		return return_value;
	}
	
	// if not a variable, return value
	return value;
}

function setRealValue(string_path, value) {
	
	// remove path delimiters
	let path = string_path.slice(1, -1);
	
	// split path
	path = path.split('/');
	
	// path base reference
	let reference_path = GLOBAL.active_tournament.data;
	
	// pull from use path until only one path directory is left
	while (path.length > 1) {
		
		// shift from use path into reference path
		reference_path = reference_path[path.shift()];
		
	}

	// set passed value as reference path value using last available parent (js reference things)
	reference_path[path.shift()] = value;

}