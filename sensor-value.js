			const sensorTemp =  context.config.tempSensor;
			console.log('Temperature sensor: ', sensorTemp);
			const indoorTemp = await context.api.devices.getCapabilityStatus(
				sensorTemp[0].deviceConfig.deviceId, sensorTemp[0].deviceConfig.componentId, 'temperatureMeasurement');
			console.log('Temperature value: ', indoorTemp);
			const stateRequests = sensorTemp.map(it => context.api.devices.getCapabilityStatus(
				it.deviceConfig.deviceId,
				it.deviceConfig.componentId,
				'temperatureMeasurement'
			));
			const states = await Promise.all(stateRequests);

			const currentTemp = states[0].temperature.value;
