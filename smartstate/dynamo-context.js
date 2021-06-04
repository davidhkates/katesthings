// Import required AWS SDK clients and commands for establishing DynamoDBClient
const { DynamoDBClient, GetItemCommand, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const dbclient = new DynamoDBClient({ region: 'us-west-2' });

/*
  Get the value of the specified state variable stored in DynamoDB, returned as string
  */
async function getState( appId, name ) {
	// console.log("Calling DynamoDB application context store to get state variable value");

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
		const data = await dbclient.send(new GetItemCommand(params));
		// console.log("Success - state variable value = ", data.Item);
		// const returnValue = data.Item.stateValue.S;
		// console.log("Value: ", returnValue);
		return data.Item.stateValue.S;
	} catch (err) {
		console.log("Error", err);
	}	
};

/*
  Store the value of the specified state variable stored in DynamoDB as string
  */
async function putState( appId, name, value ) {
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
    		// console.log(data);
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
		return data.Item.value.S;
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
    		// console.log(data);
  	} catch (err) {
    		console.error(err);
  	}
};

// Export functions
exports.getState = getState;
exports.putState = putState;
exports.getValue = getValue;
exports.getValue = putValue;
