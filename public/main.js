const apodApiURL = 'https://sdg-astro-api.herokuapp.com/api/Nasa/apod'
const upcomingApiURL = 'https://sdg-astro-api.herokuapp.com/api/SpaceX/launches/upcoming'
let upcomingJSON
let upcomingIndexPointer
let cardTimerID
let countDownTimeID

const qS = e => document.querySelector(e)

const main = () => {
  fetchApod()
  fetchUpcoming()
  // advanceCard()
  countDownTimeID = setInterval(startCountDown, 1000)
}

const isDefinedAndAssigned = data => {
  if (typeof data !== 'undefined') {
    if (data != null) {
      return true
    }
  }
  return false
}

const startCountDown = () => {
  if (!isMissionDataLoaded()) {
    console.log('Mission data not available')
    if (isDefinedAndAssigned(countDownTimeID)) {
      clearInterval(countDownTimeID)
    }
    return
  }
  const deadline = upcomingJSON[upcomingIndexPointer].launch_date_unix * 1000
  if (typeof deadline === 'undefined' || deadline == null) {
    return
  }
  const now = new Date().getTime()
  const t = deadline - now
  const days = Math.floor(t / (1000 * 60 * 60 * 24))
  const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((t % (1000 * 60)) / 1000)
  qS('.days').textContent = days
  qS('.hours').textContent = hours
  qS('.minutes').textContent = minutes
  qS('.seconds').textContent = seconds
  if (t < 0) {
    clearInterval(countDownTimeID)
    // qS('demo').textContent = 'TIME UP'
    qS('.days').textContent = '0'
    qS('.hours').textContent = '0'
    qS('.minutes').textContent = '0'
    qS('.seconds').textContent = '0'
  }
}

const advanceCard = () => {
  if (typeof cardTimerID === 'undefined' || cardTimerID == null) {
    cardTimerID = setTimeout(displayNextMissionCycling, 10000)
  }
  // clearTimeout(cardTimerID)
}

const displayNextMissionCycling = () => {
  displayNextMission()
  cardTimerID = null
  advanceCard()
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
  qS('.aotd').src = apod.url
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
  upcomingJSON.sort((a, b) => a.launch_date_unix - b.launch_date_unix)
  upcomingIndexPointer = 0
  populateMissionData()
}

// Remove past missions from global array
const removePastMissions = () => {
  const now = new Date() // get now in UNIX epoch unit
  for (let i = 0; i < upcomingJSON.length; i++) {
    if (upcomingJSON[i].launch_date_unix < now.getTime() / 1000) {
      upcomingJSON.splice(i, 1)
    }
  }
}

// Display next mission in array on card
const displayNextMission = () => {
  upcomingIndexPointer = (upcomingIndexPointer + 1) % upcomingJSON.length
  populateMissionData()
  // advanceCard()
}

// Display previous mission in array on card
const displayPrevMission = () => {
  upcomingIndexPointer = (upcomingIndexPointer - 1) % upcomingJSON.length
  populateMissionData()
  // advanceCard()
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
qS('.leftButton').addEventListener('click', displayPrevMission)
qS('.rightButton').addEventListener('click', displayNextMission)
