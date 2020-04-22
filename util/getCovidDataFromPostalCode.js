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

  let res, location;

  try {
    // console.log(postalCode)
    // console.log(phoneNumber)
    // storing response in var
    res = await axios.post(`${process.env.DASHBOARD_API_URL}/zip`, { zip_code: postalCode });
    // console.log(`Status code: ${res.status}`);
    // console.log(`Status text: ${res.statusText}`);
    // console.log(`Request method: ${res.request.method}`);
    // console.log(`Path: ${res.request.path}`);
    location = res.data.message;


  } catch (err) {
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