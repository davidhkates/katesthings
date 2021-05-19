/*
   Convenience functions to retrieve state/value of various sensors
*/

// get the temperature value of specified sensor
async function getTemperature( sensor ) {
	try {
		const sensorState = await context.api.devices.getCapabilityStatus( sensor.deviceConfig.deviceId, sensor.deviceConfig.componentId, 'temperatureMeasurement');
		return sensorState[0].temperature.value;
	} catch (err) {
		console.log("Error", err);
	}	
};	

// get the contact state of specified sensor
async function getContact( sensor ) {
	try {
		const sensorState = await context.api.devices.getCapabilityStatus( sensor.deviceConfig.deviceId, sensor.deviceConfig.componentId, 'contactState');
		return sensorState[0].contact.value;
	} catch (err) {
		console.log("Error", err);
	}	
};	


// Export function
exports.getTemperature = getTemperature;
exports.getContact     = getContact;
