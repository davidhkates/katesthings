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

// Export date/time functions
exports.inTimeWindow = inTimeWindow;
