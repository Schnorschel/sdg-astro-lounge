const apodApiURL = 'https://sdg-astro-api.herokuapp.com/api/Nasa/apod'
const upcomingApiURL = 'https://sdg-astro-api.herokuapp.com/api/SpaceX/launches/upcoming'
let upcomingJSON
let upcomingIndexPointer

const qS = e => document.querySelector(e)

const main = () => {
  fetchApod()
  fetchUpcoming()
}

const fetchApod = async () => {
  const resp = await fetch(apodApiURL)
  if (resp.status != 200) {
    return
  }
  const apod = await resp.json()
  // qS('.aotdContainer').style.backgroundImage = 'url("' + apod.url + '")'
  qS('.aotd').src = apod.url
  qS('.copyright').textContent = 'copyright: ' + apod.copyright + ' | title: ' + apod.title
}

const fetchUpcoming = async () => {
  const resp = await fetch(upcomingApiURL)
  if (resp.status != 200) {
    return
  }
  upcomingJSON = await resp.json()
  upcomingIndexPointer = 0
  populateMission()
}

const populateMission = () => {
  if (typeof upcomingIndexPointer === 'undefined') {
    return
  }

  const missionName = upcomingJSON[upcomingIndexPointer].mission_name
  const missionDesc = upcomingJSON[upcomingIndexPointer].details
  // qS('.missionCountdown').textContent = upcomingJSON[upcomingIndexPointer].details
  const missionLaunch = (qS('.missionLaunchsite').textContent =
    upcomingJSON[upcomingIndexPointer].launch_site.site_name_long)

  qS('.missionName').textContent = missionName(null ? 'No mission name available yet' : missionName)
  qS('.missionDescription').textContent = missionDesc(
    null ? 'No description available yet' : missionDesc
  )
  // qS('.missionCountdown').textContent = missionName (null ? 'No mission name yet' : missionName)
  qS('.missionLaunchsite').textContent = missionLaunch(
    null ? 'No launch site available yet' : missionLaunch
  )
}

document.addEventListener('DOMContentLoaded', main)
