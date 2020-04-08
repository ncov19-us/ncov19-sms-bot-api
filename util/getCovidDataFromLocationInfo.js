// library imports
const axios = require('axios');
// ignoring if in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}


// function makes a post request to the main dashboard API to query and return COVID-19 info based on location data provided by user
function getCovidDataFromLocationInfo(postOptions) {
  let countyInfo;

  // main POST request to dashboard API
  axios.post(`${process.env.DASHBOARD_API_URL}/county`, postOptions)
    .then((res) => {
      countyInfo = { ...res.data.message[0] };
    })
    .catch(err => { console.log(err) });

  return countyInfo;
}

module.exports = getCovidDataFromLocationInfo;