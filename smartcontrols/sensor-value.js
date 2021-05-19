/*
   Convenience functions to retrieve state/value of various sensors
*/

// get the temperature value of specified temperature measurement sensor
async function getTemperature( context, sensor ) {
	try {
		const sensorMap = context.config.sensor;
		if ( sensorMap.length == 1 ) {
			const sensorDevice = sensorMap[0].deviceConfig;
			const sensorState = await context.api.devices.getCapabilityStatus( sensorDevice.deviceId, sensorDevice.componentId, 'temperatureMeasurement');
			return sensorState[0].temperature.value;
		}
	} catch (err) {
		console.log("Error", err);
	}	
};	

// get the contact state of specified contact sensor
async function getContact( context, sensor ) {
	try {
		const sensorState = await context.api.devices.getCapabilityStatus( sensor.deviceConfig.deviceId, sensor.deviceConfig.componentId, 'contactSensor');
		return sensorState[0].contact.value;
	} catch (err) {
		console.log("Error", err);
	}	
};	


// Export function
exports.getTemperature = getTemperature;
exports.getContact     = getContact;
