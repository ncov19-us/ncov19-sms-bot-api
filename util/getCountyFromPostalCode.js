// library imports
const axios = require('axios');
// ignoring if in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: '../.env' });
}

// util imports
const generateSMS = require('./generateSMS.js');

async function getCountyFromPostalCode(postalCode) {
  // defining message body
  let badInputMessage = '';

  // initial declaration of county and state variables
  let geoData = await axios.get(`https://api.opencagedata.com/geocode/v1/google-v3-json?q=countrycode=us|postcode=${postalCode}&key=${process.env.GEOCODING_KEY}&limit=1`)
  
  // checking if provided zipcode is valid or not
  if (!geoData.data.results[0] && toPhoneNumber !== "undefined") {
    badInputMessage = generateSMS("BAD_INPUT");

  } else {
    // cleaning response to to provide Dashboard API with what it is expecting
    let formattedAddressArray = geoData.data.results[0].formatted_address.split(",");
    let state = formattedAddressArray[1].split(' ')[1];
    let countyArray = formattedAddressArray[0].split(' ');
    countyArray.pop();
    county = countyArray.join(' ');
    
    let locationInfo = {
      state: state,
      county: county,
    };
  
    return { 'locationInfo': locationInfo, 'badInputMessage': badInputMessage }
  }
}

module.exports = getCountyFromPostalCode;