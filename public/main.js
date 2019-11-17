const apodApiURL = 'https://sdg-astro-api.herokuapp.com/api/Nasa/apod'
const upcomingApiURL = 'https://sdg-astro-api.herokuapp.com/api/SpaceX/launches/upcoming'
let upcomingJSON
let upcomingIndexPointer
let cardTimerID
let countDownTimerID

const qS = e => document.querySelector(e)

const main = () => {
  fetchApod()
  fetchUpcoming()
  // advanceCardDelayed()
  countDownTimerID = setInterval(startCountDownTimer, 1000)
  cardTimerID = setInterval(displayNextMission, 10000)
}

// Since % doesn't handle negative numbers as expected...
const mod = (n, m) => {
  return ((n % m) + m) % m
}

const isDefinedAndAssigned = data => {
  if (typeof data !== 'undefined') {
    if (data != null) {
      return true
    }
  }
  return false
}

const startCountDownTimer = () => {
  console.log('Started startCountDownTimer()')
  if (!isMissionDataLoaded()) {
    console.log('Mission data not available')
    if (isDefinedAndAssigned(countDownTimerID)) {
      clearInterval(countDownTimerID)
    }
    return
  }
  const deadline = upcomingJSON[upcomingIndexPointer].launch_date_unix * 1000
  console.log('Deadline: ' + deadline)
  if (typeof deadline === 'undefined' || deadline == null) {
    return
  }
  const now = new Date().getTime()
  const t = deadline - now
  console.log('Time left: ' + t)
  const days = Math.floor(t / (1000 * 60 * 60 * 24))
  const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((t % (1000 * 60)) / 1000)
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
  // qS('.days').textContent = days
  // qS('.hours').textContent = hours
  // qS('.minutes').textContent = minutes
  // qS('.seconds').textContent = seconds
  if (t < 0) {
    clearInterval(countDownTimerID)
    qS('.countDown').textContent = 'Launched!'
    // qS('.days').textContent = '0'
    // qS('.hours').textContent = '0'
    // qS('.minutes').textContent = '0'
    // qS('.seconds').textContent = '0'
  }
}

// Given number returns 's' if number is 0 or >1; to append to words to make them plural
// If number == 1 returns ''
const PluralS = number => {
  return number === 1 ? '' : 's'
}

const advanceCardDelayed = () => {
  if (typeof cardTimerID === 'undefined' || cardTimerID == null) {
    cardTimerID = setTimeout(displayNextMissionCycling, 10000)
  } else {
    clearTimeout(cardTimerID)
  }
}

const stopCountDownTimer = () => {
  if (typeof countDownTimerID !== 'undefined') {
    if (countDownTimerID != null) {
      clearTimeout(countDownTimerID)
    }
  }
}

const displayNextMissionCycling = () => {
  displayNextMission()
  cardTimerID = null
  advanceCardDelayed()
}

// Fetch the data for the Astro-Photo Of the Day by API
const fetchApod = async () => {
  const resp = await fetch(apodApiURL)
  if (resp.status != 200) {
    console.log('An error occurred fetching data from ' + apodApiURL)
    return
  }
  const apod = await resp.json()
  // qS('.aotdContainer').style.backgroundImage = 'url("' + apod.url + '")'
  // qS('.aotd').src = apod.url
  qS('.aotdContainer').style.backgroundImage = 'url("' + apod.url + '")'
  qS('.copyright').textContent = 'copyright: ' + apod.copyright + ' | title: ' + apod.title
}

// Fetch the upcoming SpaceX missions by API
const fetchUpcoming = async () => {
  const resp = await fetch(upcomingApiURL)
  if (resp.status != 200) {
    console.log('An error occurred fetching data from ' + upcomingApiURL)
    return
  }
  upcomingJSON = await resp.json()
  removePastMissions()
  upcomingJSON.sort((a, b) => parseInt(a.launch_date_unix) - parseInt(b.launch_date_unix))
  upcomingIndexPointer = 0
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
  // Move the pointer to the currently displayed mission back by one (with wrap-around at last array element to 0)
  upcomingIndexPointer = mod(upcomingIndexPointer - 1, upcomingJSON.length)
  // Show the new mission data on the card
  populateMissionData()
  // advanceCardDelayed()
  countDownTimerID = setInterval(startCountDownTimer, 1000)
}

const isMissionDataLoaded = () => {
  return typeof upcomingIndexPointer !== 'undefined'
}

// Display mission with index number saved in upcomingIndexPointer on card
const populateMissionData = () => {
  if (!isMissionDataLoaded()) {
    console.log('Mission data not available')
    return
  }

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

document.addEventListener('DOMContentLoaded', main)
qS('.leftArrow').addEventListener('click', displayPrevMission)
qS('.rightArrow').addEventListener('click', displayNextMission)
