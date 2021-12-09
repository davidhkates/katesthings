//---------------------------------------------------------------------------------------
// Sonos Utility Functions - use control API to stop/start speakers
//---------------------------------------------------------------------------------------
'use strict'

// Install relevant utilities
const SmartState  = require('@katesthings/smartstate');

// Install relevant node packages
const axios = require("axios");
const qs = require("qs");

async function getSonosToken() {
	const access_token = SmartState.getHomeMode('niwot', 'sonos-access-token');
	return access_token;
}

async function getGroupId(speakerName) {
	const 
}

// Sonos authorization callback
async function playSpeakers( context, speakers ) {
	  	
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

		
		const urlControl = '/groups/' + groupId + '/playback/play';
		sonosControl.post(urlControl);

			
	
		// console.log("Calling DynamoDB application context store to get state variable value");
		const data = await dbclient.send(new GetItemCommand(params));
		return data.Item.stateValue.S;
	} catch (err) {
		console.error(err);
	}	
};

exports.authCallback = (event, context, callback) => {
	const authCode = event.queryStringParameters.code;
	// console.log('Event: ', event);
	// console.log('Code: ', authCode);

	/*
	const message = {'message': 'Auth Code: ' + authCode};

	callback(null, {
		statusCode: 200,
		body: JSON.stringify(message),
		headers: {'Content-Type': 'application/json'}
	});
	*/
	
	// if (authCode) {
	
		const urlToken = 'https://api.sonos.com/login/v3/oauth/access';

		const params = new URLSearchParams();
		params.append('grant_type', 'authorization_code');
		params.append('code', authCode);
		params.append('redirect_uri', 'https%3A%2F%2F00t156cqe1.execute-api.us-west-2.amazonaws.com%2Fdev%2Fauth-callback');
	
		const config = {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
				'Authorization': 'Basic ZDMxM2EyYTAtOTYwZS00ODFmLTlmYzctM2MwMmU0MzY2OTU1OjNhY2ZkZmQ5LTI3YzQtNGE3NC05NzhkLWUyN2ZlZmE0NWJkMg=='
			}
		}
		
		axios.post(urlToken, params, config).then((result) => {
			console.log('Success!  Data: ', result.data);
			
			const sonosControl = axios.create({
				baseURL: 'https://api.ws.sonos.com/control/api/v1',
				timeout: 1000,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': result.data.token_type + ' ' + result.data.access_token
				}
			});
			
			// store tokens in DynamoDB home settings file
			const token_data = result.data;
			putSonosData( 'access-token', token_data.access_token );
			putSonosData( 'refresh-token', token_data.refresh_token );

			/*
			const households: any = getSonosData( sonosControl, 'households' );
			const idHousehold = households.data.households[0].id;
			const devices: any = getSonosData( sonosControl, 'households/' + idHousehold + '/groups');

			callback(null, {
				statusCode: 200,
				body: JSON.stringify({'Households': idHousehold}),
				headers: {'Content-Type': 'application/json'}
			});
			*/
			
			/*
			const householdPromise = callSonosAPI( token_data, 'households' );
			console.log('Households: ', householdPromise);
			const householdList = async () => {
				const listValue = await householdPromise;
				console.log('Households: ', listValue);
			};
			*/
			
			sonosControl.get('households').then((result) => {
				const idHousehold = result.data.households[0].id;
				console.log('Households: ', result.data);
				putSonosData( 'household-id', idHousehold );
				
				
				sonosControl.get('households/' + idHousehold + '/groups').then((result) => {
					console.log('Groups: ', result.data.groups);
					console.log('Stringified: ', JSON.stringify(result.data.groups));
					// putSonosData( 'groups-json', JSON.stringify(result.data.groups) );
					putSonosData( 'groups-json', result.data.groups );
				});

				// callback(null, {body: JSON.stringify({'Households': idHousehold})});
				callback(null, {body: 'Success!  Tokens and groups stored in DynamoDB smartapp-home-settings'});
				/*
				callback(null, {
					statusCode: 200,
					body: JSON.stringify({'Households': idHousehold}),
					headers: {'Content-Type': 'application/json'}
				});
				*/
			})
			
		}).catch((err) => {
			console.log('Error: ', err);
		})		
	// }
};


// Sonos authorization callback
exports.tokenCallback = (event, context, callback) => {
	// const token = event.queryStringParameters.code;
	console.log('Event: ', event);

	const message = {'message': 'Token received'};

	callback(null, {
		statusCode: 200,
		body: JSON.stringify(message),
		headers: {'Content-Type': 'application/json'}
	});
};


// export external modules
// module.exports.authCallback  = authCallback
// module.exports.tokenCallback = tokenCallback
