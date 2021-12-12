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

// Get access token
async function accessToken() {
	
	// declare access token variable to be returned
	let accessToken;
	
	try {
		// create axios sonos control object
		refreshToken = await SmartState.getSonosData('refresh-token');
		const tokenTime = await getSonosData( 'token-time', new Date() );
		const expiresIn = await getSonosData( 'expires-in' );

		// check to see if token has expired
		const currentTime = new Date();
		if ( ( currentTime - tokenTime ) / 1000 ) > expiresIn ) {
			accessToken = refreshToken();
		}
	} catch(err) { console.log('refreshToken - error getting refresh token from DynamoDB: ', err) }	
	
	return accessToken;
};


// Refresh access token
async function refreshToken() {

	// declare access token variable to be returned
	let accessToken;
	
	try {
		// create axios sonos control object
		const refresh_token = await SmartState.getSonosData('refresh-token');
			
		const urlToken = 'https://api.sonos.com/login/v3/oauth/access';

		const params = new URLSearchParams();
		params.append('grant_type', 'refresh_token');
		params.append('refresh_token', refresh_token);
		// params.append('redirect_uri', 'https%3A%2F%2F00t156cqe1.execute-api.us-west-2.amazonaws.com%2Fdev%2Fauth-callback');
	
		const config = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
				'Authorization': 'Basic ZDMxM2EyYTAtOTYwZS00ODFmLTlmYzctM2MwMmU0MzY2OTU1OjNhY2ZkZmQ5LTI3YzQtNGE3NC05NzhkLWUyN2ZlZmE0NWJkMg=='
			}
		}
		
		axios.post(urlToken, params, config).then((result) => {
			console.log('Success!  Data: ', result.data);
			
			// store tokens in DynamoDB home settings file
			const token_data = result.data;
			accessToken = token_data.access_token;
			SmartState.putSonosData( 'access-token', accessToken );
			SmartState.putSonosData( 'refresh-token', token_data.refresh_token );
		}).catch((err) => { console.log('refreshToken - error refreshing token: ', err); })
	} catch(err) { console.log('refreshToken - error getting refresh token from DynamoDB: ', err) }	
	
	// return refreshed access token
	return accessToken;
};

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
					// const speakerInfo = await context.api.devices.get(speakerId);
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
			}).catch((err) => { console.log('controlSpeakers - error getting groups/speakers: ', err); })
		}).catch((err) => { console.log('controlSpeakers - error getting household(s): ', err); })
	} catch(err) { console.log('controlSpeakers - error controlling Sonos: ', err); }
};

// export external modules
module.exports.refreshToken = refreshToken
module.exports.controlSpeakers = controlSpeakers
