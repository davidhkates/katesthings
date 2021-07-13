# smartstate

Utilities using DynamoDB to store and retrieve stateful information
for SmartThings automation lambda functions

# Instructions

- To install: **npm i @katesthings/smartstate --save**
- **npm i @aws-sdk/client-dynamodb --save**
- 
- To include: **const smartstate = require(@katesthings/smartstate);**

# Functions
* getState( context, name )
* putState( context, name, value )
* getValue( table, name )
* putValue( table, name, value )
