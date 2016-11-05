//Global Variables
	var eventToday = false;
	var todaysDate = new Date();

//function if provided date object is equal to the day but ignores time of day
function isToday (dateToTest) {
	todaysDate = new Date();
	return (dateToTest.getFullYear() === todaysDate.getFullYear()) &&
					(dateToTest.getMonth() === todaysDate.getMonth()) &&
          (dateToTest.getDate() == todaysDate.getDate());
	}

//Revised day comparison checker
function isToday2 (dateToTest,dateAgainst) {
	
	return (dateToTest.getFullYear() === dateAgainst.getFullYear()) &&
					(dateToTest.getMonth() === dateAgainst.getMonth()) &&
          (dateToTest.getDate() == dateAgainst.getDate());
	}

function dateDelta(dateVar) {
	return(dateVar.getDate() - todaysDate.getDate());
}

function isThisMonth (dateToTest) {
	todaysDate = new Date()
	return (dateToTest.getFullYear() === todaysDate.getFullYear() &&
					(dateToTest.getMonth() === todaysDate.getMonth()));
	}

function daysInMonth() {
	var todaysDate = new Date();
    return new Date(todaysDate.getYear(), 
                    todaysDate.getMonth()+1, 
                    0).getDate();}

//gives nice english names to our date format output
function dateStringer (dateToFormat, includeHour = true) {
	var monthNames = [
	"January", "February", "March",
	"April", "May", "June", "July",
	"August", "September", "October",
	"November", "December"];

	var dayNames = ["Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var dayIndex = dateToFormat.getDay();
	var day = dateToFormat.getDate();
	var monthIndex = dateToFormat.getMonth();
	var year = dateToFormat.getFullYear();

	console.log(includeHour);
	if (includeHour === false) {dateToFormat.setHours(0);}

	if (dateToFormat.getHours() > 0) {
		return(dayNames[dayIndex] + ', ' + monthNames[monthIndex] + ' ' + day + ' at ' + dateToFormat.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'} ));
		}

	return(dayNames[dayIndex] + ' ' + monthNames[monthIndex] + ' ' + day);
	}

	// iterate over each element in the array
	for (var i = 0; i < cal_events.length; i++){
  	// look for the entry with a matching `code` value
  	var loopDate = new Date(cal_events[i].start);
  	if (isToday(loopDate)){
  		eventToday = true;
  		var t = document.querySelector('#productrow'),
  		td = t.content.querySelectorAll("td");
  		td[0].textContent = cal_events[i].title;
  		td[1].textContent = dateStringer(loopDate);
      
      // Clone the new row and insert it into the table
  		var tb = document.getElementsByTagName("tbody");
  		var clone = document.importNode(t.content, true);
  		tb[0].appendChild(clone);
  	
  		var txt = document.createTextNode("there's an event tonight:");
  		document.getElementById('opener').appendChild(txt);
  		}

	}
		postNoEvent(eventToday);
		var statsTxt = document.createTextNode(eventMonthStats());
		document.getElementById('stats').appendChild(statsTxt);

		//var nextEventText = document.createTextNode(nextEvent());
		//document.getElementById('nextEvent').appendChild(nextEventText);
		document.getElementById('nextEvent').innerHTML = nextEvent();

		//bottom visibility and whatnot
	if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){ //if the user agent is an iOS device
		if (("standalone" in window.navigator) && !window.navigator.standalone) { //if browser can do fullscreen but isn't
				document.getElementById('installInstructions').style.visibility = 'visible';
				}
				else if(("standalone" in window.navigator) && window.navigator.standalone) { //hide if in iOS fullscreen mode
					document.getElementById('installInstructions').style.visibility = 'hidden';
				}
	}

function eventMonthStats() {
	var totalEvents = 0;

	for (var i = 0; i < cal_events.length; i++) {
		var loopDate = new Date(cal_events[i].start);
		if (isThisMonth(loopDate)) {
			totalEvents++;
		}
	}
	return(totalEvents + ' out of ' + daysInMonth() + ' days have events this month.')
}

function postNoEvent(eventBool) {
	if (eventBool == false) {
		var noEventDateText = document.createTextNode(dateStringer(todaysDate,false)+':');
		document.getElementById('noEventDate').appendChild(noEventDateText);
		document.getElementById('noEventDate').style.visibility = 'visible';
		var noEventText = document.createTextNode('No events today');
		document.getElementById('noEvent').appendChild(noEventText);
	}
}

function nextEvent() {
	// iterate over each element in the array
	var nextDate = new Date();
	var dateIncrementer = 1;
	matchBool = false;

	while (!matchBool) {
		nextDate.setDate(nextDate.getDate() + dateIncrementer);
		for (var i = 0; i < cal_events.length; i++){
			// look for the entry with a matching `code` value
			var loopDate = new Date(cal_events[i].start);
			
			if (isToday2(loopDate,nextDate)) {
			matchBool = true;
			return('The next event is <em id="nextEventTitle"><a href="' + cal_events[i].url + '" id="incoglink">' + cal_events[i].title + '</a></em>, ' + (dateDelta(nextDate)) + ' days from now.');
				}
			}
		
		}
	}