// date/time utility functions
function inTimeWindow( startDateTime, endDateTime ) {
	
	// initialize return value
	var inTimeWindow = true;
	
	if (startDateTime != endDateTime) {
		// apply current date to start and end date/time
		const currentDate = new Date();
		startDateTime.setFullYear( currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() );
		endDateTime.setFullYear( currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() );

		// check to see if span midnight, if so, adjust basec on current time
		if ( startDateTime > endDateTime ) {
			if (currentDate > startDateTime) {
				endDateTime.setDate(endDateTime.getDate()+1);
			} else {
				startDateTime.setDate(startDateTime.getDate()-1)
			}
		}
				
		// check to see if current time is between start and end time		
		inTimeWindow = ( (currentDate >= startDateTime) && (currentDate <= endDateTime) );
	}
	return inTimeWindow;
}

function inTimeWindow( context, startTime, endTime ) {
	
	// initialize return value
	var inTimeWindow = true;
	
	const startTime = context.configStringValue('startTime');
	if (startTime) {
		const endTime = context.configStringValue('endTime');
		if (endTime) {
			inTimeWindow = inTimeWindow(startTime, endTime);
		}
	}
	return inTimeWindow;
}

function isDayOfWeek( strDayOfWeek ) {
	const today = new Date();
	const nDayOfWeek = today.getDay();
	var bDayOfWeek = false;
	switch (strDayOfWeek) {
		case 'everyday':
			bDayOfWeek = true;
			break;
		case 'weekdays':
			bDayOfWeek = ( nDayOfWeek >= 1 && nDayOfWeek <= 5 );
			break;
		case 'weekend':
			bDayOfWeek = ( nDayOfWeek==0 || nDayOfWeek==6 );
	}
	return bDayOfWeek;
}

// global variables
/*
let appSettings: any = {};
let bCheckSettings: boolean = false;
let logSettings = 'dynamo';	// console to log to CloudWatch console, dynamo to log to DynamoDB log, else don't log
const logCategory = 'RoomControl';
const logMessageTypes = ['INFO', 'ERROR', 'DEBUG', 'ENTRY', 'EXIT'];


async function getAppSettings(room) {
	var dynamoDB = new aws.DynamoDB.DocumentClient();
	dynamoDB.get({
		TableName: 'smartapp-room-settings',
		Key: {
			room: room,
		},
	}).promise()
	.then(function(data) {
		return data.Items;
	})
	.catch(console.error);		
};

// write log entry to circular log
async function console.log(logRecord, recordType="INFO") {
	// check to make sure message type should be logged
	if (logMessageTypes.includes(recordType)) {
		
		// send log to destination specified in logSettings
		// TODO: make logSettings a JSON object
		if (logSettings==='console') {
			console.log(logRecord);
		} else if (logSettings==='dynamo') {
			const dynamoDB = new aws.DynamoDB.DocumentClient();
			const logTable = 'smartapp-circular-log';

			// get metadata from circular log file
			dynamoDB.get({
				TableName: logTable,
				Key: {
					logItem: 0,	// record 0 contains circular log metadata
				},
			}).promise()
			.then(function(data) {		
				let logOffset: number = data.Item.logOffset;
				const maxRecords: number = data.Item.maxRecords;

				// write log record to next entry in circular table
				dynamoDB.put({
					Item: {
						logItem: logOffset,
						logCategory: recordType,
						logRecord: logRecord,
						timestamp: new Date().toLocaleString("en-US", {timeZone: "America/Denver"}),
					},
					TableName: logTable,
				}).promise();

				// update metadata
				if (logOffset++ == maxRecords) { logOffset = 1 };
				dynamoDB.update({
					Key: {
						logItem: 0
					},				
					AttributeUpdates: {
						logOffset: {
							Action: 'PUT',
							Value: logOffset
						},
					},
					TableName: logTable,
				}).promise()
				// .then( data => console.log(data.Attributes))
				.catch(console.error);		
			})		
			.catch(console.error);
		}
	}
};	

async function getCurrentSettings(context) {
	// mark bCheckSettings true regardless of outcome
	bCheckSettings = true;
	
	// check to see if settings database room name specified
	const roomName: string = context.configStringValue('roomName');
	console.log('Room name specified: ' + roomName);
	
	if (roomName) {
		// find settings from database for current app
		const items: any = await getAppSettings(roomName);
		console.log('Room settings found: ' + bCheckSettings);

		if (items) {

			// get local time and day of week for today
			const daysOfWeek = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];
			const localToday = new Date().toLocaleString("en-US", {timeZone: "America/Denver"});
			const localDate = new Date(localToday);
			console.log('Current settings assigne local date constants: ' + localDate.toString());
			const strLocalTime = localDate.getHours().toString().padStart(2,'0') + localDate.getMinutes().toString().padStart(2,'0');
			const strDayOfWeek = daysOfWeek[localDate.getDay()];
			console.log('Current settings constants assigned: day: ' + strDayOfWeek + ', time: ' + strLocalTime);

			// find state data for current day/time
			for (const item of items) {
				if (item.daysofweek.includes(strDayOfWeek) && 
						( (!item.startTime && !item.endTime) ||
						(strLocalTime>=item.startTime) && (strLocalTime<item.endTime) ) ) {
					return item;
					break;
				}
			}
		}
		console.log('Room settings retrieved');
	}
};

function getSettingValue(context, settingName) {
	// declare variable to return stateVariables
	let settingValue: string;

	// get current settings if not already checked
	if (!bCheckSettings) {
		getCurrentSettings(context);
	}
	
	// see if settings found in smartapp DynamoDB database
	if (appSettings) {
		settingValue = appSettings[settingName];
	// } else if (!bAppOnly) {
	} else {
		settingValue ??= context.configStringValue(settingName);
		console.log('Get setting value: ' + settingName + ', ' + settingValue);
	}
	return settingValue;
};


// convert time in hhmm format to javascript date object
function convertDateTime( hhmm ) {
	let returnValue: Date = null;
	if (hhmm) {
		const now = new Date();
		// const tzOffset = now.getUTCHours() - now.getHours();
		const tzOffset = now.getUTCHours() - parseInt(now.toLocaleString("en-US", {timeZone: "America/Denver", hour12: false, hour: "numeric"}), 10);
		const localDate: string = new Date().toLocaleString("en-US", {timeZone: "America/Denver", year: "numeric", month: "2-digit", day: "2-digit"});
		const localTime: any = new Date(parseInt(localDate.substr(6, 4), 10), parseInt(localDate.substr(0, 2), 10)-1, parseInt(localDate.substr(3, 2), 10),
			parseInt(hhmm.substr(0, 2), 10), parseInt(hhmm.substr(2, 2), 10));
		console.log('Local time: ' + localTime + " " + localDate + ', time zone offset: ' + tzOffset);
		const returnValue: Date = new Date(localTime.valueOf() + (tzOffset>0 ? tzOffset : 24+tzOffset)*60*60*1000);
		console.log('Converted date/time: ' + returnValue.toLocaleString("en-US", {timeZone: "America/Denver"}));
	}
	return returnValue;
};


// schedule activities for current end time
async function scheduleEndHandler(context) {
	// Schedule endTime activities based on specified endBehavior setting
	const endTime = getSettingValue(context, 'endTime');
	if (endTime) {
		const endDateTime = convertDateTime(endTime);
		const endBehavior = getSettingValue(context, 'endBehavior') ?? 'checkNext';
		console.log('Run end time handler at: ' + endDateTime.toLocaleString("en-US", {timeZone: "America/Denver"}) + ', behavior: ' + endBehavior);
		SmartState.putState(context, 'endBehavior', endBehavior);
		await context.api.schedules.runOnce('endTimeHandler', endDateTime);
	}
};
*/


// Export date/time functions
exports.inTimeWindow = inTimeWindow;
exports.isDayOfWeek = isDayOfWeek;
