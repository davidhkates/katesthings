/*
   Convenience functions to retrieve state/value of various sensors
*/

// get the state of specified switch
async function getSwitchState( context, sensorName ) {
	let switchState = 'off';  // default switch state to off
	try {
		const sensorArray = context.config[sensorName];
		/*
		if (sensorArray.length==1) {
			const sensorDevice = context.config[sensorName][0];
			const sensorState = await context.api.devices.getState(sensorDevice.deviceConfig.deviceId);
			switchState = sensorState.components.main.switch.switch.value;
		}
		*/
		// Get the current states of all the sensors
		const stateRequests = sensorArray.map(it => context.api.devices.getState(it.deviceConfig.deviceId));
		// Set return value based on value of motion sensor(s)		
		const stateValues: any = await Promise.all(stateRequests);
		if (stateValues.find(it => it.components.main.switch.switch.value === 'on')) {
			switchState = 'on';
			if (stateValues.find(it => it.components.main.switch.switch.value === 'off')) {
				switchState = 'mixed';
			}
		}		
	} catch (err) {
		console.log('getSwitchState - error retrieving switch state: ', err);
	}
	return switchState;
};

// get the state of specified motion sensor
async function getMotionState( context, motion ) {
	try {
		const motionDevice = motion.deviceConfig;
		const motionState = await context.api.devices.getCapabilityStatus( motionDevice.deviceId, motionDevice.componentId, 'motionSensor');
		return motionState.contact.value;
	} catch (err) {
		console.log('Error', err);
	}	
};

// get the state of specified contact sensor
async function getContactState( context, contact ) {
	try {
		const contactDevice = contact.deviceConfig;
		const contactState = await context.api.devices.getCapabilityStatus( contactDevice.deviceId, contactDevice.componentId, 'contactSensor');
		return contactState.contact.value;
	} catch (err) {
		console.log('Error', err);
	}	
};

// get the temperature value of specified temperature measurement sensor
async function getTemperature( context, sensor ) {
	try {
		console.log('getTemperature - context: ', context, ', sensor: ', sensor);
		const sensorDevice = sensor.deviceConfig;
		console.log('getTemperature - sensor device: ', sensorDevice);
		const sensorState = await context.api.devices.getCapabilityStatus( sensorDevice.deviceId, sensorDevice.componentId, 'temperatureMeasurement');
		return sensorState.temperature.value;
	} catch (err) {
		console.log('getTemperature - error retrieving capability status: ', err);
	}	
};	

// get the relative humidity value of specified sensor
async function getHumidity( context, sensor ) {
	try {
		const sensorDevice = sensor.deviceConfig;
		const sensorState = await context.api.devices.getCapabilityStatus( sensorDevice.deviceId, sensorDevice.componentId, 'relativeHumidityMeasurement');
		return sensorState.humidity.value;
	} catch (err) {
		console.log('Error', err);
	}	
};	

// get the state of the specified motion sensor(s)
async function getMultipleMotionState( context, sensor ) {
	
	var returnValue = 'inactive';  //default to inactive
	
	try {
		// Build request to get state of all motion sensors
		const motionSensors = context.config.sensor;

		if (motionSensors) {
			// Get the current states of the other motion sensors
			const stateRequests = motionSensors.map(it => context.api.devices.getCapabilityStatus(
				it.deviceConfig.deviceId,
				it.deviceConfig.componentId,
				'motionSensor'
			));			

			// Set return value based on value of motion sensor(s)		
			const states: any = await Promise.all(stateRequests);
			if (states.find(it => it.motion.value === 'active')) {
				returnValue = 'active';
				if (states.find(it => it.motion.value === 'inactive')) {
					returnValue = 'mixed';
				}
			}
		}
		return returnValue;
	} catch (err) {
		console.log('Error', err);
	}
};

// get the contact state of specified contact sensor
async function getMultipleContactState( context, sensor ) {

	var returnValue = 'open';  //default to allOpen
	
	try {
		// Build request to get state of all motion sensors
		const contactSensors = context.config.sensor;

		if (contactSensors) {
			// Get the current states of the other contact sensors
			const stateRequests = contactSensors.map(it => context.api.devices.getCapabilityStatus(
				it.deviceConfig.deviceId,
				it.deviceConfig.componentId,
				'contactSensor'
			));

			// Set return value based on value of contact sensor(s)		
			const states: any = await Promise.all(stateRequests);
			if (states.find(it => it.contact.value === 'closed')) {
				returnValue = 'closed';
				if (states.find(it => it.contact.value === 'open')) {
					returnValue = 'mixed';
				}
			}
		}

		const sensorDevice = sensor.deviceConfig;
		const sensorState = await context.api.devices.getCapabilityStatus( sensorDevice.deviceId, sensorDevice.componentId, 'contactSensor');
		return sensorState.contact.value;
	} catch (err) {
		console.log('Error', err);
	}	
};	


// Export function
exports.getSwitchState  = getSwitchState;
exports.getMotionState  = getMotionState;
exports.getContactState = getContactState;
exports.getTemperature  = getTemperature;
exports.getHumidity     = getHumidity;

exports.getMultipleMotionState  = getMultipleMotionState;
exports.getMultipleContactState = getMultipleContactState;
