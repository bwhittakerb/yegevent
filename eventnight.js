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
	var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
	var firstDate = new Date(2008,01,12);
	var secondDate = new Date(2008,01,22);

	var diffDays = Math.round(Math.abs((todaysDate.getTime() - dateVar.getTime())/(oneDay)));
	return(diffDays);
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
	
	//this hack sets the MST time zone offset. it's ugly
	//dateToFormat.setHours(dateToFormat.getHours()+7);
	//includeEnd.setHours(includeEnd.getHours()+7);

	if (includeHour === false) {dateToFormat.setHours(0);}

	//start initial stub of string for date info
	stringConstructor = dayNames[dayIndex] + ', ' + monthNames[monthIndex] + ' ' + day;

	//add additional time information if it's available in the dataset
	if (dateToFormat.getHours() > 0) {
		if (includeEnd) {
			stringConstructor = dateToFormat.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'}) + 
			' &ndash; ' + includeEnd.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'});
		}
		else {stringConstructor = dateToFormat.toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'});}
		}

	return(stringConstructor);
	}

//required to parse incoming date object as MST or MDT
function parseISOLocal(s) {
  var b = s.split(/\D/);
  return new Date(b[0], b[1]-1, b[2], b[3], b[4], b[5]);
}

//MAIN PROGRAM KICKOFF
// iterate over each element in the array
for (var i = 0; i < cal_events.length; i++){
	// look for the entry with a matching `code` value
	var loopDate = parseISOLocal(cal_events[i].start);
	var loopDateEnd = parseISOLocal(cal_events[i].end);
	if (isToday(loopDate)){
		eventToday = true;
		/* 
		var t = document.querySelector('#productrow'),
		td = t.content.querySelectorAll("td");
		td[0].innerHTML = eventLogoInjector(cal_events[i].title);
		td[1].innerText = dateStringer(loopDate,null,loopDateEnd);
	  
	  // Clone the new row and insert it into the table
		var tb = document.getElementsByTagName("tbody");
		var clone = document.importNode(t.content, true);
		tb[0].appendChild(clone);

		var txt = 'there\'s an event tonight:';
		document.getElementById('opener').innerText = txt;
		}
		*/
		var t = document.querySelector('#eventtemplate'),
		td = t.content.querySelectorAll("td");
		td[0].innerHTML = eventLogoInjector(cal_events[i].title);
		td[1].childNodes[1].querySelector("dt").innerHTML = cal_events[i].title;
		td[1].childNodes[1].querySelector("dd").innerHTML = dateStringer(loopDate,null,loopDateEnd);
	  
	  // Clone the new row and insert it into the table
		var tb = document.getElementsByTagName("tbody");
		var clone = document.importNode(t.content, true);
		tb[0].appendChild(clone);

		var txt = 'there\'s an event tonight:';
		document.getElementById('opener').innerText = txt;
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
		//this makes the event table completely invisible
		document.getElementById('producttable').style.background = 'white';
		var noEventText = document.createTextNode('No events today');
		document.getElementById('noEvent').appendChild(noEventText);
	}
}

function nextEvent() {
	// iterate over each element in the array
	//this clones the currently set today's date
	var nextDate = new Date(+todaysDate);
	var dateIncrementer = 1;
	matchBool = false;

	while (!matchBool) {
		nextDate.setDate(nextDate.getDate() + dateIncrementer);
		for (var i = 0; i < cal_events.length; i++){
			// look for the entry with a matching `code` value
			var loopDate = new Date(cal_events[i].start);
			
			if (isToday2(loopDate,nextDate)) {
				matchBool = true;
				return('The next event is <em id="nextEventTitle"><a href="' + cal_events[i].url + '" id="incoglink">' + cal_events[i].title + '</a></em>,' + pluralizer2(dateDelta(nextDate))); //(dateDelta(nextDate)) + '&nbsp;' + pluralizer('day',dateDelta(nextDate)) + ' from now.');
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

function pluralizer2(daysAway) {
	if (daysAway === 1) {
		return(' tomorrow.');
	}
	else {return (' ' + daysAway + '&nbsp;' + 'days from now.');}
}

// To determine if an oilers logo needs to be injected
function eventLogoInjector(eventsTitle) {
	var oilRegex = /oilers/i;
	if (oilRegex.test(eventsTitle)) {
		return('<img src=\"logos/Logo_Edmonton_Oilers.svg\" />');
	}
	return null;
}


