// Import required AWS SDK clients and commands for establishing DynamoDBClient
const { DynamoDBClient, GetItemCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const dbclient = new DynamoDBClient({ region: 'us-west-2' });
const contextTable = 'smartapp-context-store';

/*
  Get the value of the specified state variable stored in DynamoDB, returned as string
  */
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

/*
  Store the value of the specified state variable stored in DynamoDB as string
  */
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

/*
  Get the value for a given key from a given table
  */
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

/*
  Store an item in the specified table the value of the specified state variable stored in DynamoDB as string
  */
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

/*
function nextState( appId, currentDateTime ) {
	var nextState = null;

	
	// const today = new Date();
	// const nDayOfWeek = today.getDay();
	const nDayOfWeek = currentDateTime.getDay();
	
	const params = {
  		TableName: 'smartapp-state-machine',
  		Key: {
    			appId: { S: appId }
  		}
	};
  	
	// Return the requested state variable
	try {
		const data = await dbclient.send(new GetItemCommand(params));
		return data.Item.stateValue.S;
	} catch (err) {
		console.log("Error", err);
	}	
	
	
	
	
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
	
	
	
	return nexState;
};
*/

// Export functions
exports.getState = getState;
exports.putState = putState;
exports.getValue = getValue;
exports.putValue = putValue;
// exports.nextState = nextState;
