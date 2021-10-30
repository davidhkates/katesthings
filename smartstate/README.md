# smartstate

AWS Lambda utilities to store and retrieve data in DynamoDB for SmartThings SmartApps

# Instructions

- To install: **npm i @katesthings/smartstate --save**
- Prerequisites: **npm i @aws-sdk/client-dynamodb --save**
- To include: **const smartstate = require(@katesthings/smartstate);**

# Functions
* getState( context, name )
* putState( context, name, value )
* getValue( table, name )
* putValue( table, name, value )
* getHomeMode( home, type )
* putHomeMode( home, type, mode )
