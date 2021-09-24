/*
   Convenience functions to retrieve state/value of various sensors
*/

// get the temperature value of specified temperature measurement sensor
async function getTemperature( context, sensor ) {
	try {
		const sensorDevice = sensor.deviceConfig;
		const sensorState = await context.api.devices.getCapabilityStatus( sensorDevice.deviceId, sensorDevice.componentId, 'temperatureMeasurement');
		return sensorState.temperature.value;
	} catch (err) {
		console.log("Error", err);
	}	
};	

// get the relative humidity value of specified sensor
async function getHumidity( context, sensor ) {
	try {
		const sensorDevice = sensor.deviceConfig;
		const sensorState = await context.api.devices.getCapabilityStatus( sensorDevice.deviceId, sensorDevice.componentId, 'relativeHumidityMeasurement');
		return sensorState.humidity.value;
	} catch (err) {
		console.log("Error", err);
	}	
};	

// get the state of the specified motion sensor(s)
async function getMotionState( context, sensor ) {
	
	const returnValue = 'inactive';  //default to inactive
	
	try {
		// See if there are any other motion sensors defined
		const motionSensors = context.config.sensor;

		if (motionSensors) {
			// Get the current states of the other motion sensors
			const stateRequests = otherSensors.map(it => context.api.devices.getCapabilityStatus(
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
		console.log("Error", err);
	}
};

// get the contact state of specified contact sensor
async function getContactState( context, sensor ) {
	try {
		const sensorDevice = sensor.deviceConfig;
		const sensorState = await context.api.devices.getCapabilityStatus( sensorDevice.deviceId, sensorDevice.componentId, 'contactSensor');
		return sensorState.contact.value;
	} catch (err) {
		console.log("Error", err);
	}	
};	


// get the state of specified switch
async function getSwitchState( context, sensor ) {
	try {
		const sensorDevice = sensor.deviceConfig;
		const sensorState = await context.api.devices.getCapabilityStatus( sensorDevice.deviceId, sensorDevice.componentId, 'switch');
		return sensorState.switch.value;
	} catch (err) {
		console.log("Error", err);
	}	
};


// Export function
exports.getTemperature  = getTemperature;
exports.getHumidity     = getHumidity;
exports.getMotionState  = getMotionState;
exports.getContactState = getContactState;
exports.getSwitchState  = getSwitchState;
