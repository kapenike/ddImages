# FSD[ ddImages ]
![Dynamic Data Images](/logo.png)
- Automate image changes using custom data fields, datasets and asset lists.
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
		
- Clone or Download and extract the repository
- Navigate to the **ddImages** primary directory and launch the application using:
	> php -S localhost:8000
	
- Visit `localhost:8000` in your web browser to start using the application!

## To-DO

- BETA release
	- [ ] font manager
	- [ ] overlay editor transform tool
	- [ ] documentation

- FULL release features
	- [ ] restructure code and break large code bases into manageable classes with sub methods
	- [ ] extra overly editor tools
		- [ ] shapes
		- [ ] line tool
		- [ ] custom clipping path
		- [ ] hotkey select layer on click and scroll through layers behind
	- [ ] offer color picker as a tool for variable inputs
	- [ ] classify and make browser sources a library manager
	 - [ ] allow p2p connection to browser sources that live update with Switchboard data
	
- BUGS
	- [ ] Head feature to prevent infinite loops in getRealValue will also prevent the same variable path from being printed twice within the same line
	- [ ] data sets variable inputs dont log whether a value was set as a reference and doesnt re-check the box for path only reference when revisiting the dataset