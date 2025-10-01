# FSD[ ddImages ]
![Dynamic Data Images](/logo.png)
- Automate image changes using custom data fields, datasets and asset lists
- ddImages changes will automatically update live in an OBS scene

> [!IMPORTANT]  
> The primary directory **ddImages** cannot be renamed. ddImages does not use Apache and therefore has no hierarchical method to manage data paths. The directory named ddImages is used for relative pathing.

## Windows Download
- Download and extract from: holdonacoupledaysforbeta.url
- Launch `MSLaunchFSDimages.bat`

## Linux / MacOS install
- Install PHP (will vary depending on your distro)
	> sudo apt install php
	
- Update your php.ini config file to allow large image uploads and project imports.
	- Enter the following console command to locate your config file
	> php --ini
	
	- *(e.g. result): Loaded Configuration File:         /etc/php/8.3/cli/php.ini*
	- change the following configuration properties:
		- `upload_max_filesize=8M` -> `upload_max_filesize=2G`
		- `post_max_size=8M` -> `post_max_size=2G`
		- `memory_limit=128M` -> `memory_limit=2G`
		- `max_input_vars=1000` -> `max_input_vars=10000`
		
- Clone or Download and extract the repository
- Rename the primary directory to `ddImages` NOT `ddImages-main`
- Navigate to the **ddImages** primary directory and launch the application using:
	> php -S localhost:8000
	
- Visit `localhost:8000` in your web browser to start using the application!

## To-DO

FEATURES:

- P2P overlay and data share

- Create section app that highjacks the regions and auto creates a bracket system from a select dataset

- Overlay editor features
	- position image from different origins, then allow image rotations
	- quick asset upload from editor
	- right click tool on overlay editor to:
		- create new layer
		- remove layer if selection is within active layer bounds
		- select layer, behind layer, layer container
		- ctrl + t for a new UI to control rotation and dimensions of layer object

- variable input
	- needs to allow window anchor selection to change specific concatted variables rather than just appending the new variable selection
	- offer search option for lists containing more than 10 values
	
- browser sources need an overhaul and new features like a banner app

- QOL: drag move of group layers has old logic to handle the dragged contents of the direct drag object, it needs to be updated to merge with the new logic for dragging all infinite sub groups of a parent container

BUGS:

- generate overlay while using variable color override on a layer needs to detect all color value types, not just hexcode and hexcode alpha

- head feature to prevent infinite loops in getRealValue will also prevent the same variable path from being printed twice within the same line
