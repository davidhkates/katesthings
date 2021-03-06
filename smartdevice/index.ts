/*
   Convenience functions to retrieve state/value of various sensors
*/

// get the state of specified switch
async function getSwitchState( context, switchName ) {
	let switchState = 'on';  // default switch state to on	
	try {
		const switchArray = context.config[switchName];
		if (switchArray) {
			switchState = 'off';	// default switch state to off if switches defined
			const stateRequests = switchArray.map(it => context.api.devices.getState(it.deviceConfig.deviceId));
			// Set return value based on value of switch(es)		
			const stateValues: any = await Promise.all(stateRequests);
			if (stateValues.find(it => it.components.main.switch.switch.value === 'on')) {
				switchState = 'on';
				if (stateValues.find(it => it.components.main.switch.switch.value === 'off')) {
					switchState = 'mixed';
				}
			}
		}		
	} catch (err) {
		console.log('getSwitchState - error retrieving switch state: ', err);
	}
	return switchState;
};

// set the state of specified switch
async function setSwitchState( context, deviceName, deviceState ) {
	try {
		await context.api.devices.sendCommands(context.config[deviceName], 'switch', deviceState);
	} catch (err) {
		console.log('setSwitchState - error setting switch state: ', err);
	}
};

// get the state of specified motion sensor
async function getMotionState( context, sensorName ) {
	let motionState = 'inactive';  // default motion state to inactive
	try {
		const sensorArray = context.config[sensorName];
		if (sensorArray) {
			const stateRequests = sensorArray.map(it => context.api.devices.getState(it.deviceConfig.deviceId));
			// Set return value based on value of motion sensor(s)		
			const stateValues: any = await Promise.all(stateRequests);
			if (stateValues.find(it => it.components.main.motionSensor.motion.value === 'active')) {
				motionState = 'active';
				if (stateValues.find(it => it.components.main.motionSensor.motion.value === 'inactive')) {
					motionState = 'mixed';
				}
			}
		}		
	} catch (err) {
		console.log('getMotionState - error retrieving motion state: ', err);
	}
	return motionState;
};

// get the state of specified contact(s)
async function getContactState( context, sensorName ) {
	let contactState = 'closed';  // default contact state to closed
	try {
		const sensorArray = context.config[sensorName];
		if (sensorArray) {
			const stateRequests = sensorArray.map(it => context.api.devices.getState(it.deviceConfig.deviceId));
			// Set return value based on value of contact(s)		
			const stateValues: any = await Promise.all(stateRequests);
			if (stateValues.find(it => it.components.main.contactSensor.contact.value === 'open')) {
				contactState = 'open';
				if (stateValues.find(it => it.components.main.contactSensor.contact.value === 'closed')) {
					contactState = 'mixed';
				}
			}
		}		
	} catch (err) {
		console.log('getContactState - error retrieving contact state: ', err);
	}
	return contactState;
};

// get the temperature value of specified temperature measurement sensor
async function getTemperature( context, sensorName ) {
	let tempValue;
	try {
		const sensorArray = context.config[sensorName];
		if (sensorArray.length==1) {
			const sensorDevice = context.config[sensorName][0];
			const sensorState = await context.api.devices.getState(sensorDevice.deviceConfig.deviceId);
			tempValue = sensorState.components.main.temperatureMeasurement.temperature.value;
		}
	} catch (err) {
		console.log('getTemperature - error retrieving temperature value: ', err);
	}
	return tempValue;
};	

// get the relative humidity value of specified sensor
async function getHumidity( context, sensorName ) {
	let humidityValue;
	try {
		const sensorArray = context.config[sensorName];
		if (sensorArray) {
			if (sensorArray.length==1) {
				const sensorDevice = context.config[sensorName][0];
				const sensorState = await context.api.devices.getState(sensorDevice.deviceConfig.deviceId);
				humidityValue = sensorState.components.main.relativeHumidityMeasurement.humidity.value;
			}
		}
	} catch (err) {
		console.log('getHumidity - error retrieving humidity value: ', err);
	}
	return humidityValue;
};	

// returns boolean indication wither device has been defined
function isDeviceDefined( context, deviceName ) {
	return !!context.config[deviceName];
}


// Export function
exports.getSwitchState  = getSwitchState;
exports.setSwitchState  = setSwitchState;
exports.getMotionState  = getMotionState;
exports.getContactState = getContactState;
exports.getTemperature  = getTemperature;
exports.getHumidity     = getHumidity;
exports.isDeviceDefined = isDeviceDefined;