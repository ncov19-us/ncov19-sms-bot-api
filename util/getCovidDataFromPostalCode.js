// library imports
const axios = require('axios');
// ignoring if in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: '../.env' });
}


//  util imports
const generateSMS = require('./generateSMS.js');
const userCheck = require('../middleware/checkUsersMessageLimit.js');

async function getCovidDataFromPostalCode(postalCode, phoneNumber) {

  let locationBody, location;

  try {

    // storing response in var
    locationBody = await axios.post(`${process.env.DASHBOARD_API_URL}/zip`, { zip_code: postalCode });
    // console.log(location.data.message)
    location = locationBody.data.message;

  } catch(err) {

    // if/else to send correct error message depending on what the issue is
    if (err.response.status === 404) {
      generateSMS("SERVER_ERROR", phoneNumber, postalCode, userCheck.myCache.get(phoneNumber));
    } else if (err.response.status === 422) {
      generateSMS("NOT_USA", phoneNumber, postalCode, userCheck.myCache.get(phoneNumber));
    }

  }

  // returning object that is returned from API call
  return location;
}

module.exports = getCovidDataFromPostalCode;