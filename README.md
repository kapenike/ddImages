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

- FULL release features
	- [ ] create section app that highjacks the region and creates a bracket system within using all generate ui components and datasets
	- overlay editor features
		- [ ] position image from different origins
			- [ ] after, allow image rotation
		- [ ] allow quick upload of asset from editor
		- [ ] allow right click tool to select layer from output window
		- [ ] CTRL + T open transform feature that adhocs scaling and rotation of text and images
	- [ ] variable input cleanup and improvements, use window anchor to allow edit of variable(s) that arent a path only, e.g. edit concatted variable rather than just append new selection to end
	- [ ] classify and make browser sources a library manager
		- [ ] improve timer app and include current time option
		- [ ] create banner app
	- [ ] allow p2p connection to browser sources that live update with Switchboard data
	- [ ] search field on large variable input result lists (10+)
	
- QOL
	- [ ] variable input drop down should open as a window container with matching positioning as current, but as an absolute poisitioned element it would not be resitricted to overflow parent containers
	- [ ] detection of valid color code in clip path should also allow use of rgb incase it is set that way in dataset/data inputs. currently only checks length for hex code or hex with opacity
	- [ ] nbd but drag move of group layers has pre-logical that handles its own edge cases and newer logic to handle drag logic of infinite nested children, these should be combined so the old is merged in
	
- BUGS
	- [ ] Head feature to prevent infinite loops in getRealValue will also prevent the same variable path from being printed twice within the same line