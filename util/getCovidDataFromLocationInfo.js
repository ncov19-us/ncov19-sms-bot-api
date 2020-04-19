// library imports
const axios = require('axios');
// ignoring if in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: '../.env' });
}

// util 
const generateSMS = require('./generateSMS.js');

// function makes a post request to the main dashboard API to query and return COVID-19 info based on location data provided by user
async function getCovidDataFromLocationInfo(locationInfo) {
  let countyData;

  try {
    // main POST request to dashboard API
    countyData = await axios.post(`${process.env.DASHBOARD_API_URL}/county`, locationInfo);

  } catch (err) {
    console.log(err);
    // handling error if dashboard API down
    generateSMS("SERVER_ERROR");

    return messageBody;
  }

  let countyInfo = { ...countyData.data.message[0] };

  return countyInfo;
}

module.exports = getCovidDataFromLocationInfo;