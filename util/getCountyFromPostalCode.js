// library imports
const axios = require('axios');
// ignoring if in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: '../.env' });
}


//  util imports
const generateSMS = require('./generateSMS.js');
const stateAbbreviations = require('./stateAbbreviations.js');

async function getCountyFromPostalCode(postalCode, phoneNumber) {

  let location, locationObj;

  try {

    // storing response in var
    location = await axios.post(`${process.env.DASHBOARD_API_URL}/zip`, { zip_code: postalCode });

    locationObj = { // using state abbreviations object to convert full state name to 2 letter state code

      state: stateAbbreviations[location.data.message.state_name], // ex. CA
      county: location.data.message.county_name, // ex. Los Angeles
    };
  } catch(err) {

    // if/else to send correct error message depending on what the issue is
    if (err.response.status === 404) {
      generateSMS("SERVER_ERROR", phoneNumber);
    } else if (err.response.status === 422) {
      generateSMS("BAD_INPUT", phoneNumber);
    }

  }

  return locationObj;
}

module.exports = getCountyFromPostalCode;