const apodApiURL = 'https://sdg-astro-api.herokuapp.com/api/Nasa/apod' // API URL for astro photo of the day
const upcomingApiURL = 'https://sdg-astro-api.herokuapp.com/api/SpaceX/launches/upcoming' // API URL for upcoming SpaceX missions
let upcomingJSON // variable to hold JSON/object array of upcoming SpaceX missions
let upcomingIndexPointer // integer index pointer for array element number of mission to display on card on page
let cardTimerID // Timer Id for 10sec-timer that advances contents on cards
let countDownTimerID // Time Id for Countdown timer of mission that shows on visible card

const qS = e => document.querySelector(e) // shorthand function to access HTML tag content

// main function being called by page load event listener
const main = () => {
  fetchApod() // fetch Astro photo of the day data from API
  fetchUpcoming() // fetch upcoming SpaceX mission data from API and save in global variable upcomingJSON
  // advanceCardDelayed()
  countDownTimerID = setInterval(startCountDownTimer, 1000) // start the 1-sec countdown timer for the mission visible on page
  cardTimerID = setInterval(displayNextMission, 10000) // start the 10-sec timer to show subsequent mission data
}

// Substitute modulo function for negative numbers, since % doesn't handle negative numbers as expected...
const mod = (n, m) => {
  return ((n % m) + m) % m
}

// Function to determine if JS variable has been defined or, if defined, assigned a value
const isDefinedAndAssigned = data => {
  if (typeof data !== 'undefined') {
    if (data != null) {
      return true
    }
  }
  return false
}

// Function to display countdown on visible card on page
const startCountDownTimer = () => {
  // console.log('Started startCountDownTimer()')
  // check if mission data has been loaded through API
  if (!isMissionDataLoaded()) {
    // console.log('Mission data not available')
    // check if a countdown timer has been previously created and clear it if so
    if (isDefinedAndAssigned(countDownTimerID)) {
      clearInterval(countDownTimerID)
    }
    return
  }
  // Retrieve the launch date of the currently visible mission
  const deadline = upcomingJSON[upcomingIndexPointer].launch_date_unix * 1000
  // console.log('Deadline: ' + deadline)
  // verify an actual launch date exists and exit if it doesn't
  if (typeof deadline === 'undefined' || deadline == null) {
    return
  }
  // get the timestamp for the current date/time
  const now = new Date().getTime()
  const t = deadline - now // find out the time remaining until launch date/time
  // console.log('Time left: ' + t)
  // If the launch date/time is in the past kill the timer, display 'Launched!' on the page and exit the function
  if (t < 0) {
    clearInterval(countDownTimerID)
    qS('.countDown').textContent = 'Launched!'
    return
  }
  // Calculate the parts of the countdown timer
  const days = Math.floor(t / (1000 * 60 * 60 * 24))
  const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((t % (1000 * 60)) / 1000)
  // Display the parts of the countdown timer on the page
  qS('.countDown').textContent =
    days +
    ' day' +
    PluralS(days) +
    ', ' +
    hours +
    ' hour' +
    PluralS(hours) +
    ', ' +
    minutes +
    ' minute' +
    PluralS(minutes) +
    ', ' +
    seconds +
    ' second' +
    PluralS(seconds)
}

// Given number returns 's' if number is 0 or >1; to append to words to make them plural, or leave them singular
// If number == 1 returns ''
const PluralS = number => {
  return number === 1 ? '' : 's'
}

// const advanceCardDelayed = () => {
//   if (typeof cardTimerID === 'undefined' || cardTimerID == null) {
//     cardTimerID = setTimeout(displayNextMissionCycling, 10000)
//   } else {
//     clearTimeout(cardTimerID)
//   }
// }

// Stop the Countdown timer if it exists
const stopCountDownTimer = () => {
  if (typeof countDownTimerID !== 'undefined') {
    if (countDownTimerID != null) {
      clearTimeout(countDownTimerID)
    }
  }
}

// const displayNextMissionCycling = () => {
//   displayNextMission()
//   cardTimerID = null
//   advanceCardDelayed()
// }

// Fetch the data for the Astro-Photo Of the Day by API and display it on the page
const fetchApod = async () => {
  const resp = await fetch(apodApiURL)
  if (resp.status !== 200) {
    console.log('An error occurred fetching data from ' + apodApiURL)
    return
  }
  const apod = await resp.json()
  // qS('.aotdContainer').style.backgroundImage = 'url("' + apod.url + '")'
  // qS('.aotd').src = apod.url
  qS('.aotdContainer').style.backgroundImage = 'url("' + apod.url + '")'
  qS('.copyright').textContent =
    'copyright: ' +
    (apod.copyright === null ? 'not provided' : apod.copyright) +
    ' | title: ' +
    (apod.title === null ? 'not provided' : apod.title)
}

// Fetch the upcoming SpaceX missions by API and display the data on the page
const fetchUpcoming = async () => {
  const resp = await fetch(upcomingApiURL)
  if (resp.status != 200) {
    console.log('An error occurred fetching data from ' + upcomingApiURL)
    return
  }
  upcomingJSON = await resp.json()
  removePastMissions() // Remove missions that launched in the past, because this is the "@"Upcoming SpaceX Missions" page
  upcomingJSON.sort((a, b) => parseInt(a.launch_date_unix) - parseInt(b.launch_date_unix)) // Sort the missions by launch date
  upcomingIndexPointer = 0 // Set the pointer for the mission to be displayed to the first mission in the retrieved JSON array
  populateMissionData()
}

// Remove past missions from global array
const removePastMissions = () => {
  const now = new Date() // get now in UNIX epoch unit
  // console.log('Now: ' + parseInt(now.getTime() / 1000))
  for (let i = 0; i < upcomingJSON.length; i++) {
    // const msg = 'Mission "' + upcomingJSON[i].mission_name + ' [' + i + ']" (' + upcomingJSON[i].launch_date_unix + ')'
    if (parseInt(upcomingJSON[i].launch_date_unix) < parseInt(now.getTime() / 1000)) {
      // console.log(msg + ' <- removed')
      upcomingJSON.splice(i, 1)
    } else {
      // console.log(msg)
    }
  }
}

// Display next mission in array on card
const displayNextMission = () => {
  stopCountDownTimer()
  qS('.countDown').textContent = ''
  // Advance the pointer to the currently displayed mission by one (with wrap-around to 0 at last array element)
  upcomingIndexPointer = (upcomingIndexPointer + 1) % upcomingJSON.length
  // Show the new mission data on the card
  populateMissionData()
  // advanceCardDelayed()
  // startCountDownTimer()
  countDownTimerID = setInterval(startCountDownTimer, 1000)
}

// Display previous mission in array on card
const displayPrevMission = () => {
  stopCountDownTimer()
  qS('.countDown').textContent = ''
  // Move the pointer to the currently displayed mission back by one (with wrap-around to last array element at 0)
  upcomingIndexPointer = mod(upcomingIndexPointer - 1, upcomingJSON.length)
  // Show the new mission data on the card
  populateMissionData()
  // advanceCardDelayed()
  countDownTimerID = setInterval(startCountDownTimer, 1000)
}

// Function to check if mission data has been loaded and displayed
const isMissionDataLoaded = () => {
  return typeof upcomingIndexPointer !== 'undefined'
}

// Display mission with index number saved in upcomingIndexPointer on card
const populateMissionData = () => {
  if (!isMissionDataLoaded()) {
    console.log('Mission data not available')
    return
  }

  // Display mission name and (x of y) after it, where x is ordinal number of current mission shown and y is number of total missions loaded
  const missionName =
    upcomingJSON[upcomingIndexPointer].mission_name +
    ' (' +
    (upcomingIndexPointer + 1) +
    ' of ' +
    upcomingJSON.length +
    ')'
  const missionDesc = upcomingJSON[upcomingIndexPointer].details
  let missionCountdown = upcomingJSON[upcomingIndexPointer].launch_date_unix
  const missionLaunch = upcomingJSON[upcomingIndexPointer].launch_site.site_name_long

  if (missionCountdown != null) {
    const LaunchDate = new Date(missionCountdown * 1000)
    missionCountdown = LaunchDate.toLocaleString()
  }

  qS('.missionName').textContent = missionName == null ? 'No mission name available yet' : missionName
  qS('.missionDescription').textContent = missionDesc == null ? 'No description available yet' : missionDesc
  qS('.missionCountdown').textContent = missionCountdown == null ? 'No launch date yet' : missionCountdown
  qS('.missionLaunchsite').textContent = missionLaunch == null ? 'No launch site available yet' : missionLaunch
}

// Event listeners
document.addEventListener('DOMContentLoaded', main)
qS('.leftArrow').addEventListener('click', displayPrevMission)
qS('.rightArrow').addEventListener('click', displayNextMission)
