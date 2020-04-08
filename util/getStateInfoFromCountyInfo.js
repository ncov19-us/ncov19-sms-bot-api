// library imports
const axios = require('axios');
// ignoring if in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// util imports
const countiesPerState = require('./countiesPerState');

function getStateInfoFromCountyInfo(state, countyInfo) {
  let covidData = {}

  // post request to build comparisons to state averages to send to user
  axios.post(`${process.env.DASHBOARD_API_URL}/stats`, { state: state } )
    .then((res) => {
      // getting number of counties per state from object we made
      let numOfCounties = countiesPerState[state];

      // determining state averages
      let stateAvgDailyConfirmedCases = res.data.message.todays_confirmed / numOfCounties;
      let stateAvgTotalConfirmedCases = res.data.message.confirmed / numOfCounties;
      let stateAvgDailyDeaths = res.data.message.todays_deaths / numOfCounties;
      let stateAvgTotalDeaths = res.data.message.deaths / numOfCounties;

      // assign object key/vals for each datapoint
      // cases
      covidData.newCaseIncrease = ((countyInfo.new - stateAvgDailyConfirmedCases) / countyInfo.new) * 100;
      covidData.totalCaseIncrease = ((countyInfo.confirmed - stateAvgTotalConfirmedCases) / countyInfo.confirmed) * 100;
      // deaths
      covidData.newDeathIncrease = ((countyInfo.new_death - stateAvgDailyDeaths) / countyInfo.new_death) * 100;
      covidData.totalDeathIncrease = ((countyInfo.death - stateAvgTotalDeaths) / countyInfo.death) * 100; 

      // doing a check to make sure users never see "NaN" in case of a X / 0
      if (isNaN(covidData.newCaseIncrease)) {
        covidData.newCaseIncrease = 0;
      } else if (isNaN(covidData.totalCaseIncrease)) {
        covidData.totalCaseIncrease = 0;
      } else if (isNaN(covidData.newDeathIncrease)) {
        covidData.newDeathIncrease = 0;
      }
    })
    .catch(err => { console.log(err) })

  return covidData;
}

module.exports = getStateInfoFromCountyInfo;