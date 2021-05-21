// date/time utility functions
function inTimeWindow( startDateTime, endDateTime ) {
	
	// initialize return value
	var inTimeWindow = true;
	
	if ( startDateTime ) {
		// apply current date to start and end date/time
		const currentDate = new Date();
		startDateTime.setFullYear( currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() );
		inTimeWindow = ( currentDate >= startDateTime );
		
		if ( endDateTime && inTimeWindow ) {
			endDateTime.setFullYear( currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() );

			// if times cross midnight, add a day to end date/time
			if ( startDateTime > endDateTime ) {
				endDateTime.setDate(endDateTime.getDate() + 1);
			}
			inTimeWindow = ( currentDate <= endDateTime );
		}
	}
	return inTimeWindow;
}
