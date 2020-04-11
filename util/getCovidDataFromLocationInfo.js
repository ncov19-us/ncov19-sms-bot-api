// library imports
const axios = require('axios');
// ignoring if in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: '../.env' });
}

// util imports
const countiesPerState = require('./countiesPerState.js');
const generateSMS = require('./generateSMS.js');

// function makes a post request to the main dashboard API to query and return COVID-19 info based on location data provided by user
async function getCovidDataFromLocationInfo(postOptions, toPhoneNumber) {
  // doing a check to make sure the "state" field is a valid state inside the USA
  if (!countiesPerState[postOptions.state]) {
    generateSMS("NOT_USA", toPhoneNumber)
  }
  // main POST request to dashboard API
  let countyData = await axios.post(`${process.env.DASHBOARD_API_URL}/county`, postOptions);

  let countyInfo = { ...countyData.data.message[0] };

  return countyInfo;
}

module.exports = getCovidDataFromLocationInfo;