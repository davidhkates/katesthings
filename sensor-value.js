// get the temperature value of specified sensor
async function getTemperature( sensor ) {
	try {
		const sensorState = await context.api.devices.getCapabilityStatus( sensor.deviceConfig.deviceId, sensor.deviceConfig.componentId, 'temperatureMeasurement');
		return sensorState[0].temperature.value;
	} catch (err) {
		console.log("Error", err);
	}	
};	

// Export function
exports.getTemperature = getTemperature;
