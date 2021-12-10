//---------------------------------------------------------------------------------------
// Sonos Utility Functions - use control API to stop/start speakers
//---------------------------------------------------------------------------------------
'use strict'

// Install relevant utilities
const SmartState  = require('@katesthings/smartstate');

// Install relevant node packages
const axios = require("axios");

/*
async function getGroupId(speakerName) {
	try {
		const groups_json = JSON.parse( await SmartState.getHomeMode('niwot', 'sonos-groups-json') );
		// console.log('getGroupId - groups: ', groups_json);
		const result = groups_json.find(speaker => speaker.name === speakerName);
		// console.log('getGroupId - speaker: ', result);
		return result.id;
	} catch(err) {
		console.error('Error retrieving group ID for speaker: ', speakerName);
	}
}
*/


// Control playback on Sonos speakers
async function controlSpeakers(context, speakers, command) {
	  	
	try {
		// create axios sonos control object
		const access_token = await SmartState.getHomeMode('niwot', 'sonos-access-token');
		const sonosControl = axios.create({
			baseURL: 'https://api.ws.sonos.com/control/api/v1',
			timeout: 5000,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + access_token
			}
		});

		// get household id
		sonosControl.get('households').then((result) => {
			const householdId = result.data.households[0].id;			
			// putSonosData( 'household-id', idHousehold );

			// get sonos groups and devices
			sonosControl.get('households/' + householdId + '/groups').then((result) => {
				const sonosGroups = result.data.groups;
			
				// pause all specified speakers
				// for (const speaker of context.config.roomSpeakers) {
				const speakerDevices = context.config[speakers];
				for (const speaker of speakerDevices) {
					const speakerId = speaker.deviceConfig.deviceId;
					context.api.devices.get(speakerId).then((speakerInfo) => {
						const speakerName = speakerInfo.name;
						// SmartSonos.controlSpeaker(speakerInfo.name, 'pause');
						
						const result = sonosGroups.find(speaker => speaker.name === speakerName);
						const groupId = result.id;

						const command = 'pause';
						const urlControl = '/groups/' + groupId + '/playback/' + command;
						sonosControl.post(urlControl);
					})
				}
			})
		})
	} catch(err) { console.log('roomControl - error controlling Sonos: ', err); }
};

// export external modules
module.exports.controlSpeakers = controlSpeakers
