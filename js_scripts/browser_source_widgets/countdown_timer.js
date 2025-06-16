function setupCountdownClockWidget() {
	Select('#widget_content', {
		innerHTML: '',
		children: [
			Create('form', {
				id: 'countdown_clock_widget_form',
				children: [
					Create('div', {
						className: 'block',
						children: [
							Create('h3', {
								innerHTML: 'Create Countdown Clock'
							}),
							Create('label', {
								innerHTML: 'Type',
								children: [
									Create('select', {
										name: 'countdown_clock_type',
										onchange: function () {
											Select('#cc_hour', { innerHTML: (this.value == 'fromdistance' ? 'Hours' : 'Hour (24 hour clock)')});
										},
										children: [
											Create('option', {
												value: 'fromdistance',
												innerHTML: 'Countdown by Set Amount'
											}),
											Create('option', {
												value: 'towardstime',
												innerHTML: 'Countdown towards Set Time'
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'row',
								children: [
									Create('div', {
										className: 'col',
										style: { width: '33.3%' },
										children: [
											Create('label', {
												children: [
													Create('span', {
														id: 'cc_hour',
														innerHTML: 'Hours',
													}),
													Create('input', {
														name: 'countdown_clock_hours',
														type: 'number',
														value: 0,
														min: 0
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: { width: '33.3%' },
										children: [
											Create('label', {
												children: [
													Create('span', {
														innerHTML: 'Minutes',
													}),
													Create('input', {
														name: 'countdown_clock_minutes',
														type: 'number',
														value: 0,
														min: 0
													})
												]
											})
										]
									}),
									Create('div', {
										className: 'col',
										style: { width: '33.3%' },
										children: [
											Create('label', {
												children: [
													Create('span', {
														innerHTML: 'Seconds',
													}),
													Create('input', {
														name: 'countdown_clock_seconds',
														type: 'number',
														value: 0,
														min: 0
													})
												]
											})
										]
									})
								]
							})
						]
					}),
					Create('div', {
						className: 'block',
						children: [
							Create('h3', {
								innerHTML: 'Style'
							}),
							Create('p', {
								style: {
									fontSize: '12px'
								},
								innerHTML: '<i>Style values are set using JavaScript camelCase equivalents to CSS such as "fontSize" rather than "font-size".</li>'
							}),
							Create('div', {
								id: 'cc_styles',
								children: [
									Create('div', {
										className: 'row',
										children: [
											Create('div', {
												className: 'col',
												style: { width: '33.3%' },
												innerHTML: '<i>Style Key</i>'
											}),
											Create('div', {
												className: 'col',
												style: { width: '33.3%' },
												innerHTML: '<i>Style Value</i>'
											})
										]
									}),
									Create('div', {
										className: 'create_data_key',
										innerHTML: '+ Add Style',
										onclick: addNewCountdownClockStyleEntry
									})
								]
							})
						]
					}),
					Create('div', {
						className: 'block',
						children: [
							Create('h3', {
								innerHTML: 'Settings',
							}),
							Create('div', {
								children: [
									Create('label', {
										innerHTML: 'Text display on ending countdown',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_end_text_display',
												value: 'Starting Soon'
											})
										]
									}),
									Create('label', {
										innerHTML: 'Uniform H:M:S Separator',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_uniform_separator',
												value: ':'
											})
										]
									})
								]
							})
						]
					}),
					Create('div', {
						className: 'row block',
						children: [
							Create('h3', {
								innerHTML: 'H:M:S Settings'
							}),
							Create('div', {
								className: 'col',
								style: { width: '33.3%' },
								children: [
									Create('h5', {
										innerHTML: 'Hours'
									}),
									Create('label', {
										innerHTML: 'Tail',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_hour_tail',
												value: ''
											})
										]
									}),
									Create('label', {
										innerHTML: 'Pad with 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_hour_pad',
												value: 'true',
												checked: true
											})
										]
									}),
									Create('br'),
									Create('label', {
										innerHTML: 'Line Break After',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_hour_linebreak',
												value: 'true',
												checked: false
											})
										]
									}),
									Create('br'),
									Create('label', {
										innerHTML: 'Hide When 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_hour_hidewhen0',
												value: 'true',
												checked: false
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'col',
								style: { width: '33.3%' },
								children: [
									Create('h5', {
										innerHTML: 'Minutes'
									}),
									Create('label', {
										innerHTML: 'Tail',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_minute_tail',
												value: ''
											})
										]
									}),
									Create('label', {
										innerHTML: 'Pad with 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_minute_pad',
												value: 'true',
												checked: true
											})
										]
									}),
									Create('br'),
									Create('label', {
										innerHTML: 'Line Break After',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_minute_linebreak',
												value: 'true',
												checked: false
											})
										]
									}),
									Create('br'),
									Create('label', {
										innerHTML: 'Hide When 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_minute_hidewhen0',
												value: 'true',
												checked: false
											})
										]
									})
								]
							}),
							Create('div', {
								className: 'col',
								style: { width: '33.3%' },
								children: [
									Create('h5', {
										innerHTML: 'Seconds'
									}),
									Create('label', {
										innerHTML: 'Tail',
										children: [
											Create('input', {
												type: 'text',
												name: 'cc_second_tail',
												value: ''
											})
										]
									}),
									Create('label', {
										innerHTML: 'Pad with 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_second_pad',
												value: 'true',
												checked: true
											})
										]
									}),
									Create('br'),
									Create('label', {
										innerHTML: 'Line Break After',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_second_linebreak',
												value: 'true',
												checked: false
											})
										]
									}),
									Create('br'),
									Create('label', {
										innerHTML: 'Hide When 0',
										children: [
											Create('input', {
												type: 'checkbox',
												name: 'cc_second_hidewhen0',
												value: 'true',
												checked: false
											})
										]
									})
								]
							})
						]
					}),
					Create('button', {
						innerHTML: 'Generate Browser Source Timer',
						onclick: generateBrowserSourceTimer
					})
				]
			}),
			Create('label', {
				innerHTML: 'Countdown Clock Browser Source URL',
				children: [
					Create('input', {
						type: 'text',
						id: 'cc_output',
						readonly: 'readOnly',
						onclick: function () { this.focus(); this.select() },
						placeholder: 'Edit your settings and then generate a browser source timer'
					})
				]
			}),
			Create('label', {
				innerHTML: 'Import Settings from Browser Source URL',
				children: [
					Create('input', {
						type: 'text',
						id: 'cc_input',
						onclick: function () { this.focus(); this.select() },
						placeholder: 'Import a previous browser source and adjust settings'
					})
				]
			}),
			Create('button', {
				innerHTML: 'Import Settings',
				onclick: importBrowserSourceTimer
			})
		]
	});

}

function addNewCountdownClockStyleEntry(key = '', value = '') {
	Select('#cc_styles').insertBefore(
		Create('div', {
			className: 'row',
			children: [
				Create('div', {
					className: 'col',
					style: { width: '33.3%' },
					children: [
						Create('input', {
							type: 'text',
							name: 'cc_style_keys[]',
							value: key
						})
					]
				}),
				Create('div', {
					className: 'col',
					style: { width: '33.3%' },
					children: [
						Create('input', {
							type: 'text',
							name: 'cc_style_values[]',
							value: value
						})
					]
				}),
				Create('div', {
					className: 'col',
					style: { width: '33.3%' },
					children: [
						Create('div', {
							className: 'remove_data_key',
							innerHTML: '&times',
							onclick: function () {
								this.parentNode.parentNode.remove();
							}
						})
					]
				})
			]
		})
	, Select('#cc_styles').lastChild);
}

function generateBrowserSourceTimer() {
	let timer_params = formToObj('countdown_clock_widget_form');
	
	let styles = {};
	if (timer_params['cc_style_keys[]']) {
		timer_params['cc_style_keys[]'].forEach((key, index) => {
			styles[key] = timer_params['cc_style_values[]'][index];
		});
	}

	let send_obj = {
		type: timer_params.countdown_clock_type,
		fallback: timer_params.cc_end_text_display,
		distance: {
			hours: parseInt(timer_params.countdown_clock_hours == '' ? 0 : timer_params.countdown_clock_hours),
			minutes: parseInt(timer_params.countdown_clock_minutes == '' ? 0 : timer_params.countdown_clock_minutes),
			seconds: parseInt(timer_params.countdown_clock_seconds == '' ? 0 : timer_params.countdown_clock_seconds)
		},
		separator: timer_params.cc_uniform_separator,
		style: styles,
		hour: {
			tail: timer_params.cc_hour_tail,
			pad: timer_params.cc_hour_pad ? true : false,
			lb: timer_params.cc_hour_linebreak ? true : false,
			hide: timer_params.cc_hour_hidewhen0 ? true : false
		},
		minute: {
			tail: timer_params.cc_minute_tail,
			pad: timer_params.cc_minute_pad ? true : false,
			lb: timer_params.cc_minute_linebreak ? true : false,
			hide: timer_params.cc_minute_hidewhen0 ? true : false
		},
		second: {
			tail: timer_params.cc_second_tail,
			pad: timer_params.cc_second_pad ? true : false,
			lb: timer_params.cc_second_linebreak ? true : false,
			hide: timer_params.cc_second_hidewhen0 ? true : false
		}
	};
	
	Select('#cc_output', {
		value: window.location.origin+'/browser_sources/time.php?time_params='+btoa(JSON.stringify(send_obj))
	});
}

function importBrowserSourceTimer() {
	// convert url data to object
	let settings = JSON.parse(atob(Select('#cc_input').value.split('browser_sources/time.php?time_params=')[1]));
	
	// remove previous style entries
	let style_inputs = Array.from(Select('#cc_styles').children);
	for (let i=0; i<style_inputs.length-1; i++) {
		style_inputs[i].remove();
	}
	
	// insert styles from import object
	Object.keys(settings.style).forEach(key => {
		addNewCountdownClockStyleEntry(key, settings.style[key]);
	});
	
	// set static inputs
	Array.from(Select('[name="countdown_clock_type"]').children).forEach(child => {
		child.selected = (child.value == settings.type)
	})
	Select('[name="cc_end_text_display"]').value = settings.fallback;
	Select('[name="countdown_clock_hours"]').value = settings.distance.hours;
	Select('[name="cc_hour_tail"]').value = settings.hour.tail;
	Select('[name="cc_hour_pad"]').checked = settings.hour.pad;
	Select('[name="cc_hour_linebreak"]').checked = settings.hour.lb;
	Select('[name="cc_hour_hidewhen0"]').checked = settings.hour.hide;
	Select('[name="countdown_clock_minutes"]').value = settings.distance.minutes;
	Select('[name="cc_minute_tail"]').value = settings.minute.tail;
	Select('[name="cc_minute_pad"]').checked = settings.minute.pad;
	Select('[name="cc_minute_linebreak"]').checked = settings.minute.lb;
	Select('[name="cc_minute_hidewhen0"]').checked = settings.minute.hide;
	Select('[name="countdown_clock_seconds"]').value = settings.distance.seconds;
	Select('[name="cc_second_tail"]').value = settings.second.tail;
	Select('[name="cc_second_pad"]').checked = settings.second.pad;
	Select('[name="cc_second_linebreak"]').checked = settings.second.lb;
	Select('[name="cc_second_hidewhen0"]').checked = settings.second.hide;
	Select('[name="cc_uniform_separator"]').value = settings.separator;
	
	//http://localhost:8000/browser_sources/time.php?time_params=eyJ0eXBlIjoidG93YXJkc3RpbWUiLCJmYWxsYmFjayI6Ii0tOi0tIiwiZGlzdGFuY2UiOnsiaG91cnMiOjE4LCJtaW51dGVzIjozMCwic2Vjb25kcyI6MH0sInNlcGFyYXRvciI6IiIsInN0eWxlIjp7ImZvbnRTaXplIjoiODBweCIsImZvbnRXZWlnaHQiOiI2MDAiLCJjb2xvciI6IiNmZmZmZmYiLCJmb250RmFtaWx5IjoiUHJveGltYSBOb3ZhIiwibGluZUhlaWdodCI6IjFlbSJ9LCJob3VyIjp7InRhaWwiOiJoIiwicGFkIjpmYWxzZSwibGIiOnRydWUsImhpZGUiOnRydWV9LCJtaW51dGUiOnsidGFpbCI6IjoiLCJwYWQiOnRydWUsImxiIjpmYWxzZSwiaGlkZSI6ZmFsc2V9LCJzZWNvbmQiOnsidGFpbCI6IiIsInBhZCI6dHJ1ZSwibGIiOmZhbHNlLCJoaWRlIjpmYWxzZX19
}