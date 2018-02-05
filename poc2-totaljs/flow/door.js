exports.id = 'door';
exports.title = 'Door';
exports.group = 'Gears-Trigger';
exports.color = 'LightBlue';
exports.icon = 'fa-thermometer-half';
exports.input = [];
exports.output = ['blue'];
exports.version = '1.0.0';
exports.author = 'Xfinity Gears';
exports.options = { door_ids: '', door_state: '', enabled: true, enable_disable: true, reset: true, debug: true, errors: false };
exports.readme = 
`# Trigger: Door
Listens for external door events. When a door event is spotted it will be wrapped in a flow message envelope and forwarded on the out channel. The door_ids parameter can be configured to listen for a specific door, a set of specific doors or any door. Similarly the door_state parameter can be used to limit listening to specific door states such as open or closed.

### Inputs

### Outputs
- First  -> out

### Params
name	door_ids
type	[]string
doc	zero, one or more door IDs
default	
required	yes
valid values	

name	door_state
type	string
doc	door state
default	
required	no
valid values	[open closed]
`;

exports.html = 
`<div class="padding">
	<div class="row">
		<div class="col-md-6 m">
			<div data-jc="textbox" data-jc-path="property" data-jc-config="placeholder:path.to.value" class="m">Property</div>
		</div>
	</div>	
	<div class="col-md-4 m">
		<div data-jc="textbox" data-jc-path="door_ids" data-jc-config="placeholder:@()" class="m">Door Ids</div>
	</div>
	<div class="col-md-4 m">
		<div data-jc="textbox" data-jc-path="door_state" data-jc-config="placeholder:@()" class="m">Door State</div>
	</div>
</div>`;

exports.install = function(instance) {

	var lastdata;

	instance.custom.reconfigure = function() {
		instance.options = U.extend({ temp_heating_day: 22, temp_heating_night: 21, temp_heating_away: 20, hysteresis: 0.5, temp_current: 21, enabled: false, heating: false, mode: 'day' }, instance.options, true);
		instance.options.name = instance.name;		
		send();
	};


	instance.custom.status = function() {
		var options = instance.options;	
		instance.status(global.FLOWBOARD ? 'C:{0} | S:{1} | +-{2} | {3} | M:{4}'.format(options.temp_current, options['temp_heating_'+ options.mode] || '??', options.hysteresis, options.enabled ? 'enabled' : 'disabled', options.mode) : 'Flowbard not found.', global.FLOWBOARD ? null : 'red');
		instance.flowboard('options', options);
	};

	// enable/disable
	instance.on('0', function(flowdata) {
		var temp = flowdata.data;
		var options = instance.options;

		if (temp === true || temp === 1 || temp === 'on')
			options.enabled = true;
		else
			options.enabled = false;
	
		send();
	});

	// temperature
	instance.on('1', function(flowdata) {
		var options = instance.options;
		var val = getVal(flowdata.data, options.property);

		if (!val)
			return;

		if (typeof val !== 'number') {
			val = val.parseFloat();
			if (isNaN(val)){
				instance.error('Error, input value is not a number: ' + val);
				return;
			}
		}	
	
		options.temp_current = val;	
		lastdata = val;

		send();
	});

	// set day mode
	instance.on('2', function(flowdata) {
		var o = instance.options;
		var m = flowdata.data;

		// if data is a string with one of the supported modes then set it as current mode
		if (m === 'day' || m === 'night' || m === 'away')
			o.mode = m;
		else // off
			o.mode = '';

		send();
	});

	function send() {
		if (!lastdata) 
			return;
		
		var options = instance.options;

		if (!options.enabled || !options.mode) {			
			options.heating = false;
			options.cooling = false;
			instance.send(1, lastdata);
		} else {
			if (options.temp_current < (options['temp_heating_' + options.mode] - options.hysteresis)) {
				// start
				options.heating = true;
				instance.send(0, lastdata);
			} else if (options.temp_current > (options['temp_heating_' + options.mode] + options.hysteresis)) {
				// stop
				options.heating = false;
				instance.send(1, lastdata);
			}
		}

		instance.custom.status();
	};

	function getVal(obj, path) {
		if (path) {
			if (path.indexOf('.') === -1)
				return obj[path];
			else
				return U.get(obj, path);
		}

		return obj;
	};

	instance.on('options', instance.custom.reconfigure);
	setTimeout(instance.custom.reconfigure, 3000);

	instance.on('flowboard', function(type, data) {
		switch (type) {
			case 'setoptions':
				instance.options.temp_heating_day = data.temp_heating_day;
				instance.options.temp_heating_night = data.temp_heating_night;
				instance.options.temp_heating_away = data.temp_heating_away;
				instance.options.hysteresis = data.hysteresis;
				instance.custom.reconfigure();
				// send options to designer
				instance.reconfig();
				break;

			case 'getoptions':
				instance.flowboard('options', instance.options);
				break;
		}
	});

	instance.on('click', function() {
		instance.options.enabled = !instance.options.enabled;
		send();
	});
};