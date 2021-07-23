// Import required AWS SDK clients and commands for establishing DynamoDBClient
const aws = require('aws-sdk');
    aws.config.update({region: 'us-west-2'});
const { DynamoDBClient, GetItemCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const dbclient = new DynamoDBClient({ region: 'us-west-2' });
const contextTable = 'smartapp-context-store';
const logTable = 'smartapp-circular-log';

// Get the value of the specified state variable stored in DynamoDB, returned as string
async function getState( context, name ) {
	// use appId as unique key combined with name for state variable 
	const appId = context.event.appId;
	
	// Set the parameters
	const params = {
  		TableName: 'smartapp-context-store',
  		Key: {
    			appId: { S: appId },
			name: { S: name },
  		},
  		ProjectionExpression: 'stateValue',
	};
  	
	// Return the requested state variable
	try {
		// console.log("Calling DynamoDB application context store to get state variable value");
		const data = await dbclient.send(new GetItemCommand(params));
		return data.Item.stateValue.S;
	} catch (err) {
		console.log("Error", err);
	}	
};

// Store the value of the specified state variable stored in DynamoDB as string
async function putState( context, name, value ) {
	// use appId as unique key combined with name for state variable 
	const appId = context.event.appId;

	// Set the parameters
	const params = {
  		TableName: 'smartapp-context-store',
  		Item: {
    			appId: { S: appId },
			name: { S: name },
			stateValue: { S: value },
  		},
	};
	
	try {
    		const data = await dbclient.send(new PutItemCommand(params));
    		console.log('Data stored in DynamoDB: ',data);
  	} catch (err) {
    		console.error(err);
  	}
};

// Get the value for a given key from a given table
async function getValue( table, key ) {
	// Set the parameters
	const params = {
  		TableName: table,
  		Key: {
    			key: { S: key }
  		},
  		ProjectionExpression: 'keyValue'
	};
  	
	// Return the requested state variable
	try {
		const data = await dbclient.send(new GetItemCommand(params));
		return data.Item.keyValue.S;
	} catch (err) {
		console.log("Error", err);
	}	
};

//  Store an item in the specified table the value of the specified state variable stored in DynamoDB as string
async function putValue( table, key, value ) {
	// Set the parameters
	const params = {
  		TableName: table,
  		Item: {
    			key: { S: key },
			keyValue: { S: value },
  		},
	};
	
	try {
    		const data = await dbclient.send(new PutItemCommand(params));
    		console.log('Data stored in DynamoDB: ',data);
  	} catch (err) {
    		console.error(err);
  	}
};

// get room control app settings
async function getAppSettings(room) {
	var dynamoDB = new aws.DynamoDB.DocumentClient();
	const params = {
  		TableName: 'smartapp-room-settings',
  		KeyConditionExpression: 'room = :room',
		ExpressionAttributeValues: {
    			':room': room
		}		
	};

	try {
		const data = await dynamoDB.query(params).promise();
		return data.Items;
	} catch (err) {
		console.log("Failure", err.message);
		return undefined;
	}
};


// write log entry to circular log
async function writeLogEntry(logRecord, category, target) {
	if (target=='console') {
		console.log(logRecord);
	} else {
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
					logCategory: category,
					logRecord: logRecord,
					timestamp: new Date().toLocaleString("en-US", {timeZone: "America/Denver"}),
				},
				TableName: logTable,
			}).promise();

			// update metadata
			if (logOffset++ == maxRecords) { logOffset = 1 };
			dynamoDB.put({
				Item: {
					logItem: 0,
					logOffset: logOffset,
				},
				TableName: logTable,
			}).promise();
			// .then( data => console.log(data.Attributes))
			// .catch(console.error);		
		})		
		.catch(console.error);
	}	
};	


// Export functions
exports.getState = getState;
exports.putState = putState;
exports.getValue = getValue;
exports.putValue = putValue;
exports.getAppSettings = getAppSettings;
exports.writeLogEntry = writeLogEntry;
