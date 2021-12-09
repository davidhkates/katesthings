//---------------------------------------------------------------------------------------
// Sonos Utility Functions - use control API to stop/start speakers
//---------------------------------------------------------------------------------------
'use strict'

// Install relevant utilities
const SmartState  = require('@katesthings/smartstate');

// Install relevant node packages
const axios = require("axios");

async function getSonosToken() {
	const access_token = await SmartState.getHomeMode('niwot', 'sonos-access-token');
	return access_token;
}

async function getGroupId(speakerName) {
	try {
		const groups_json = JSON.parse( await SmartState.getHomeMode('niwot', 'sonos-groups-json') );
		// console.log('getGroupId - groups: ', groups_json);
		const result = groups_json.find(speaker => speaker.name === speakerName);
		// console.log('getGroupId - speaker: ', result);
		return groupId = result.id;
	} catch(err) {
		console.error('Error retrieving group ID for speaker: ', speakerName);
	}
}


// Control playback on Sonos speakers
async function controlSpeaker(speaker, command) {
	  	
	// Return the requested state variable
	try {
	
		const sonosControl = axios.create({
			baseURL: 'https://api.ws.sonos.com/control/api/v1',
			timeout: 1000,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + getSonosToken()
			}
		});

		// console.log('controlSpeakers - speaker: ', speaker);
		const urlControl = '/groups/' + getGroupId(speaker) + '/playback/' + command;
		sonosControl.post(urlControl);
	} catch (err) {
		console.error(err);
	}	
};


// export external modules
module.exports.controlSpeaker = controlSpeaker
