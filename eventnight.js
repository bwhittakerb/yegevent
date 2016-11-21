//Global Variables
var eventToday = false;

//allowing for a debug argument
if (window.location.hash) {
	//check if hash argument is an int
	urlArgument = parseInt(window.location.hash.substring(1),10);
	console.log("urlArgument is: " + urlArgument);
	if (!isNaN(urlArgument)) {
		var todaysDate = new Date();
		todaysDate.setDate(todaysDate.getDate() + urlArgument);
	}
} else {var todaysDate = new Date();}

//function if provided date object is equal to the day but ignores time of day
function isToday (dateToTest) {
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
	return (dateToTest.getFullYear() === todaysDate.getFullYear() &&
					(dateToTest.getMonth() === todaysDate.getMonth()));
	}

function daysInMonth() {
    return new Date(todaysDate.getYear(), 
                    todaysDate.getMonth()+1, 
                    0).getDate();}

//gives nice english names to our date format output
function dateStringer (dateToFormat, includeHour = true, includeEnd = false) {
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
	var stringConstructor;

	if (includeHour === false) {dateToFormat.setHours(0);}

	//start initial stub of string for date info
	stringConstructor = dayNames[dayIndex] + ', ' + monthNames[monthIndex] + ' ' + day;

	//add additional time information if it's available in the dataset
	if (dateToFormat.getHours() > 0) {
		if (includeEnd) {
			stringConstructor = stringConstructor + '\n' + dateToFormat.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'}) + 
			' to ' + includeEnd.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'});
		}
		else {stringConstructor = stringConstructor + ' at ' + dateToFormat.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'});}
		}

	return(stringConstructor);
	}


//MAIN PROGRAM KICKOFF
// iterate over each element in the array
for (var i = 0; i < cal_events.length; i++){
	// look for the entry with a matching `code` value
	var loopDate = new Date(cal_events[i].start);
	var loopDateEnd = new Date(cal_events[i].end);
	if (isToday(loopDate)){
		eventToday = true;
		var t = document.querySelector('#productrow'),
		td = t.content.querySelectorAll("td");
		td[0].innerHTML = cal_events[i].title;
		td[1].innerText = dateStringer(loopDate,null,loopDateEnd);
	  
	  // Clone the new row and insert it into the table
		var tb = document.getElementsByTagName("tbody");
		var clone = document.importNode(t.content, true);
		tb[0].appendChild(clone);

		var txt = document.createTextNode("there's an event tonight:");
		document.getElementById('opener').appendChild(txt);
		}

	}

//Test for event
postNoEvent(eventToday);

//post event stats
var statsTxt = document.createTextNode(eventMonthStats());
document.getElementById('stats').appendChild(statsTxt);

//post upcoming event
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
	//this clones the currently set today's date
	var nextDate = new Date(+todaysDate);
	console.log("todaysDate here is: " + todaysDate);
	console.log("nextDate variable is currently: " + nextDate);
	var dateIncrementer = 1;
	matchBool = false;

	while (!matchBool) {
		nextDate.setDate(nextDate.getDate() + dateIncrementer);
		for (var i = 0; i < cal_events.length; i++){
			// look for the entry with a matching `code` value
			var loopDate = new Date(cal_events[i].start);
			
			if (isToday2(loopDate,nextDate)) {
				matchBool = true;
				return('The next event is <em id="nextEventTitle"><a href="' + cal_events[i].url + '" id="incoglink">' + cal_events[i].title + '</a></em>, ' + (dateDelta(nextDate)) + ' ' + pluralizer('day',dateDelta(nextDate)) + ' from now.');
				}
			}
		
		}
	}

// This function is to return either 'day' or 'days' properly
function pluralizer(word, number) {
	if (word === 'day' && number != 1) {
		return('days');
	}
	else {return('day');}
}