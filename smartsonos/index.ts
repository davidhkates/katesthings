//---------------------------------------------------------------------------------------
// Sonos Utility Functions - use control API to stop/start speakers
//---------------------------------------------------------------------------------------
'use strict'

// Install relevant utilities
const SmartState  = require('@katesthings/smartstate');

// Install relevant node packages
const axios = require("axios");


// Store stateful Sonos data in DynamoDB home setting table
async function getSonosData( key ) {
	return await SmartState.getHomeMode( 'niwot', 'sonos-' + key );
};

async function putSonosData( key, value ) {
	await SmartState.putHomeMode( 'niwot', 'sonos-' + key, value );
};

// Refresh access token
async function refreshToken() {

	// declare access token variable to be returned
	let accessToken;
	
	try {
		// create axios sonos control object
		const refreshToken = await getSonosData('refresh-token');
		console.log('refreshToken - retrieved refresh token: ', refreshToken);
			
		const urlToken = 'https://api.sonos.com/login/v3/oauth/access';

		const params = new URLSearchParams();
		params.append('grant_type', 'refresh_token');
		params.append('refresh_token', refreshToken);
		// params.append('redirect_uri', 'https%3A%2F%2F00t156cqe1.execute-api.us-west-2.amazonaws.com%2Fdev%2Fauth-callback');
		console.log('refreshToken - initialized parameters: ', params);
	
		const config = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
				'Authorization': 'Basic ZDMxM2EyYTAtOTYwZS00ODFmLTlmYzctM2MwMmU0MzY2OTU1OjNhY2ZkZmQ5LTI3YzQtNGE3NC05NzhkLWUyN2ZlZmE0NWJkMg=='
			}
		}
		
		console.log('refreshToken - refreshing access token');
		axios.post(urlToken, params, config).then((result) => {
			console.log('refreshToken - Success!  Data: ', result.data);
			
			// store tokens in DynamoDB home settings file
			const token_data = result.data;
			accessToken = token_data.access_token;
			
			putSonosData( 'token-time', new Date() );
			putSonosData( 'access-token', token_data.access_token );
			putSonosData( 'refresh-token', token_data.refresh_token );
			putSonosData( 'expires-in', token_data.expires_in.toString() );
			
			// putSonosToken( tokenData );
		}).catch((err) => { console.log('refreshToken - error refreshing token: ', err); })
	} catch(err) { console.log('refreshToken - error getting refresh token from DynamoDB: ', err) }	
	
	// return refreshed access token
	return accessToken;
};

// Get access token
async function getAccessToken() {
	
	// declare access token variable to be returned
	let accessToken;

	try {
		// create axios sonos control object
		console.log('getAccessToken - getting Sonos data from DyanmoDB');
		accessToken = await getSonosData('access-token');
		const tokenTime = new Date( await getSonosData( 'token-time' ) );
		const expiresIn = await getSonosData( 'expires-in' );

		// check to see if token has expired
		const currentTime: any = new Date();
		const elapsedTime = (currentTime.getTime() - tokenTime.getTime()) / 1000;
		console.log('getAccessToken - token-time: ', tokenTime, ', expires-in: ', expiresIn, ', time gap: ', elapsedTime );
		if ( elapsedTime > expiresIn ) {
			console.log('getAccessToken - token expired, need to refresh: ', elapsedTime);
			accessToken = await refreshToken();
		}
	} catch(err) { console.log('getAccessToken - error getting refresh token from DynamoDB: ', err) }	
	
	return accessToken;
};


// Control playback on Sonos speakers
async function controlSpeakers(context, speakers, command) {
	  	
	try {
		// create axios sonos control object
		// const access_token = await SmartState.getHomeMode('niwot', 'sonos-access-token');
		const access_token = await getAccessToken();
		const sonosControl = axios.create({
			baseURL: 'https://api.ws.sonos.com/control/api/v1',
			timeout: 5000,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + access_token
			}
		});

		// get household id
		console.log('controlSpeakers - getting households');
		sonosControl.get('households').then((result) => {
			const householdId = result.data.households[0].id;			
			console.log('controlSpeakers - household ID: ', householdId);
			// putSonosData( 'household-id', idHousehold );

			// get sonos groups and devices
			sonosControl.get('households/' + householdId + '/groups').then((result) => {
				const sonosGroups = result.data.groups;
				console.log('controlSpeakers - Sonos groups: ', sonosGroups);
			
				// pause all specified speakers
				// for (const speaker of context.config.roomSpeakers) {
				const speakerDevices = context.config[speakers];
				for (const speaker of speakerDevices) {
					const speakerId = speaker.deviceConfig.deviceId;
					// const speakerInfo = await context.api.devices.get(speakerId);
					context.api.devices.get(speakerId).then((speakerInfo) => {
						const speakerName = speakerInfo.name;						// SmartSonos.controlSpeaker(speakerInfo.name, 'pause');
						
						console.log('controlSpeakers - find speaker: ', speakerName, ', speakerId: ', speakerId);
						const result = sonosGroups.find(speaker => speaker.name === speakerName);
						console.log('controlSpeakers - result of find: ', result);
						const groupId = result.id;

						const command = 'pause';
						const urlControl = '/groups/' + groupId + '/playback/' + command;
						// sonosControl.post(urlControl);
						sonosControl.post(urlControl).then((result) => {
							console.log('controlSpeakers - Success!  Data: ', result.data);;
						}).catch((err) => { console.log('controlSpeakers - error controlling speaker: ', err, ', command: ', command); })
					})
				}
			}).catch((err) => { console.log('controlSpeakers - error getting groups/speakers: ', err); })
		}).catch((err) => { console.log('controlSpeakers - error getting household(s): ', err); })
	} catch(err) { console.log('controlSpeakers - error controlling Sonos: ', err); }
};


// export external modules
// module.exports.getAccessToken = getAccessToken
module.exports.controlSpeakers = controlSpeakers
