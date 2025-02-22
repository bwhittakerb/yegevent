//Global Variables
var eventToday = false;

//allowing for a debug argument
if (window.location.hash) {
	//check if hash argument is an int
	urlArgument = parseInt(window.location.hash.substring(1), 10);
	console.log("urlArgument is: " + urlArgument);
	if (!isNaN(urlArgument)) {
		var todaysDate = new Date();
		todaysDate.setDate(todaysDate.getDate() + urlArgument);
	}
} else { var todaysDate = new Date(); }

//function if provided date object is equal to the day but ignores time of day
function isToday(dateToTest) {
	return (dateToTest.getFullYear() === todaysDate.getFullYear()) &&
		(dateToTest.getMonth() === todaysDate.getMonth()) &&
		(dateToTest.getDate() == todaysDate.getDate());
}

//Revised day comparison checker
function isToday2(dateToTest, dateAgainst) {

	return (dateToTest.getFullYear() === dateAgainst.getFullYear()) &&
		(dateToTest.getMonth() === dateAgainst.getMonth()) &&
		(dateToTest.getDate() == dateAgainst.getDate());
}

function dateDelta(dateVar) {
	var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

	var diffDays = Math.round(Math.abs((todaysDate.getTime() - dateVar.getTime()) / (oneDay)));
	return (diffDays);
}

function isThisMonth(dateToTest) {
	return (dateToTest.getFullYear() === todaysDate.getFullYear() &&
		(dateToTest.getMonth() === todaysDate.getMonth()));
}

function daysInMonth() {
	return new Date(todaysDate.getYear(),
		todaysDate.getMonth() + 1,
		0).getDate();
}

//gives nice english names to our date format output
function dateStringer(dateToFormat, includeHour = true, includeEnd = false) {
	var monthNames = [
		"January", "February", "March",
		"April", "May", "June", "July",
		"August", "September", "October",
		"November", "December"];

	var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	var dayIndex = dateToFormat.getDay();
	var day = dateToFormat.getDate();
	var monthIndex = dateToFormat.getMonth();
	var year = dateToFormat.getFullYear();
	var stringConstructor;

	if (includeHour === false) { dateToFormat.setHours(0); }

	//start initial stub of string for date info
	stringConstructor = dayNames[dayIndex] + ', ' + monthNames[monthIndex] + ' ' + day;

	//add additional time information if it's available in the dataset
	if (dateToFormat.getHours() > 0) {
		if (includeEnd) {
			stringConstructor = dateToFormat.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
				' &ndash; ' + includeEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		}
		else { stringConstructor = dateToFormat.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
	}

	return (stringConstructor);
}

function dateRangeStringer(dateList) {
	var returnDates = []
	dateList.forEach(date => {
		if ((date.split("T")).length > 1) {
			let timeOfDay = new Intl.DateTimeFormat('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			}).format(parseMountainTime(date))
			returnDates.push(timeOfDay)
		}
	});

	return returnDates.join(' &ndash; ')
}

//required to parse incoming date object as MST or MDT
function parseMountainTime(s) {
	// Ensure string is in format YYYY-MM-DDTHH:MM:SS or YYYY-MM-DD
	let dateParts = s.split("T");
	let dateStr = dateParts[0];
	let timeStr = dateParts[1] || "00:00:00"; // Default to midnight if only date is provided

	// Create a Date object assuming local time (to avoid unintended UTC shifts)
	let localDate = new Date(`${dateStr}T${timeStr}`);

	// Convert to Mountain Time (America/Denver)
	let options = { timeZone: "America/Denver", hour12: false };
	let formatter = new Intl.DateTimeFormat("en-US", {
		...options,
		year: "numeric", month: "2-digit", day: "2-digit",
		hour: "2-digit", minute: "2-digit", second: "2-digit"
	});

	// Extract adjusted MST/MDT values
	let parts = formatter.formatToParts(localDate);
	let values = Object.fromEntries(parts.map(p => [p.type, p.value]));

	// Construct a new Date object with the Mountain Time values
	return new Date(`${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`);
}


//MAIN PROGRAM KICKOFF
// iterate over each element in the array
for (var i = 0; i < cal_events.length; i++) {
	// look for the entry with a matching `code` value
	var loopDate = parseMountainTime(cal_events[i].start);
	var loopDateEnd = parseMountainTime(cal_events[i].end);
	if (isToday(loopDate)) {
		eventToday = true;

		const template = document.getElementById("eventarticle");
		const clone = template.content.cloneNode(true);

		// checks event name for loops and populates logos
		if (eventLogos = eventLogoPopulator(cal_events[i].title)) {
			eventLogos.forEach(team => {
				const [teamname, logoPath] = Object.entries(team)[0]
				const imgElement = Object.assign(document.createElement("img"), {
					src: logoPath,
					alt: `${teamname} logo`,
				});
				clone.querySelector("header picture").appendChild(imgElement)
			});
		}
		clone.querySelector("header h2").innerText = cal_events[i].title;
		clone.querySelector("p.event-time").innerHTML = `<strong class="TimeValue">${dateRangeStringer([cal_events[i].start, cal_events[i].end])}</strong>`;

		const eventarticles = document.getElementById("eventlist");
		eventarticles.appendChild(clone);

		var txt = 'There\'s an event tonight:';
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
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) { //if the user agent is an iOS device
	if (("standalone" in window.navigator) && !window.navigator.standalone) { //if browser can do fullscreen but isn't
		document.getElementById('installInstructions').style.visibility = 'visible';
	}
	else if (("standalone" in window.navigator) && window.navigator.standalone) { //hide if in iOS fullscreen mode
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
	return (totalEvents + ' out of ' + daysInMonth() + ' days have events this month.')
}

function postNoEvent(eventBool) {
	if (eventBool == false) {
		const noEventDateText = document.createTextNode(dateStringer(todaysDate, false) + ':');
		document.getElementById('noEventDate').appendChild(noEventDateText);
		document.getElementById('noEventDate').style.visibility = 'visible';
		document.getElementById('noEvent').innerText = 'No events today.';
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
		for (var i = 0; i < cal_events.length; i++) {
			// look for the entry with a matching `code` value
			var loopDate = new Date(cal_events[i].start);

			if (isToday2(loopDate, nextDate)) {
				matchBool = true;
				return ('The next event is <em id="nextEventTitle"><a href="' + cal_events[i].url + '" id="incoglink">' + cal_events[i].title + '</a></em>,' + pluralizer2(dateDelta(nextDate))); //(dateDelta(nextDate)) + '&nbsp;' + pluralizer('day',dateDelta(nextDate)) + ' from now.');
			}
		}

	}
}

// This function is to return either 'day' or 'days' properly
function pluralizer(word, number) {
	if (word === 'day' && number != 1) {
		return ('days');
	}
	else { return ('day'); }
}

function pluralizer2(daysAway) {
	if (daysAway === 1) {
		return (' tomorrow.');
	}
	else { return (' ' + daysAway + '&nbsp;' + 'days from now.'); }
}

// To determine if an oilers logo needs to be injected
function eventLogoInjector(eventsTitle) {
	var oilRegex = /oilers/i;
	if (oilRegex.test(eventsTitle)) {
		return ('<img src=\"logos/Logo_Edmonton_Oilers.svg\" />');
	}
	return null;
}

function eventLogoPopulator(eventsTitle) {
	var logoList = [];

	const oilRegex = /oilers/i;

	if (oilRegex.test(eventsTitle)) {
		logoList.push({"Oilers" : "logos/Logo_Edmonton_Oilers.svg"});
	} else {return null;}

	const matchList = {
		"Ducks": "logos/Anaheim_Ducks_logo_2024.svg",
		"Bruins": "logos/Boston_Bruins.svg",
		"Sabres": "logos/Buffalo_Sabres_Logo.svg",
		"Flames": "logos/Calgary_Flames_logo.svg",
		"Hurricanes": "logos/Carolina_Hurricanes.svg",
		"Blackhawks": "logos/Chicago_Blackhawks_logo.svg",
		"Avalanche": "logos/Colorado_Avalanche_logo.svg",
		"Blue Jackets": "logos/Columbus_Blue_Jackets_logo.svg",
		"Stars": "logos/Dallas_Stars_logo_(2013).svg",
		"Red Wings": "logos/Detroit_Red_Wings_logo.svg",
		"Panthers": "logos/Florida_Panthers_2016_logo.svg",
		"Rangers": "logos/Logo_New_York_Islanders.svg",
		"Kings": "logos/Los_Angeles_Kings_2024_Logo.svg",
		"Wild": "logos/Minnesota_Wild.svg",
		"Canadiens": "logos/Montreal_Canadiens.svg",
		"Predators": "logos/Nashville_Predators_Logo_(2011).svg",
		"Devils": "logos/New_Jersey_Devils_logo.svg",
		"Islanders": "logos/New_York_Rangers.svg",
		"Senators": "logos/Ottawa_Senators_2020-2021_logo.svg",
		"Flyers": "logos/Philadelphia_Flyers.svg",
		"Penguins": "logos/Pittsburgh_Penguins_logo_(2016).svg",
		"Sharks": "logos/SanJoseSharksLogo.svg",
		"Kraken": "logos/Seattle_Kraken_official_logo.svg",
		"Blues": "logos/St._Louis_Blues_logo.svg",
		"Lightning": "logos/Tampa_Bay_Lightning_2011.svg",
		"Maple Leafs": "logos/Toronto_Maple_Leafs_2016_logo.svg",
		"Utah": "logos/Utah_Hockey_Club_2024-25_Logo.svg",
		"Canucks": "logos/Vancouver_Canucks_logo.svg",
		"Golden Knights": "logos/Vegas_Golden_Knights_logo.svg",
		"Capitals": "logos/Washington_Capitals.svg",
		"Jets": "logos/Winnipeg_Jets_Logo_2011.svg"
	}

	let pattern = "\\b(" + Object.keys(matchList).join("|") + ")\\b";
	const regex = new RegExp(pattern, "g");

	let match;
	while ((match = regex.exec(eventsTitle)) !== null) {
		const matchedWord = match[0];
		if (matchList[matchedWord]) {
			logoList.push({[matchedWord] : matchList[matchedWord]});
		}

	}

	return logoList;

}


