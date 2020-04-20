// library imports
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

// middleware
const captcha = require("../middleware/validateCaptcha");

// one liner to instantiate Express Router
const router = require("express").Router();

// middleware imports
const userCheck = require("../middleware/checkUsersMessageLimit.js");
const setAndValidateVars = require("../middleware/setAndValidateVars.js");

// utility imports
const getCountyFromPostalCode = require("../util/getCountyFromPostalCode.js");
const getCovidDataFromLocationInfo = require("../util/getCovidDataFromLocationInfo.js");
const generateSMS = require("../util/generateSMS.js");

// endpoint for SMS and web users
router.post("/", userCheck.checkUsersMessageLimit, setAndValidateVars, async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const postalCode = req.body.postalCode;

  // using util function to get state/county info
  let locationInfo = await getCountyFromPostalCode(postalCode, phoneNumber);
  // console.log('here', locationInfo)

  // using util function to get covid data from our dashboard API;
  const countyInfo = await getCovidDataFromLocationInfo(
    locationInfo,
    phoneNumber
  );

  // reassigning userObj to updated cache object
  userObj = userCheck.myCache.get(phoneNumber);

  try {
    // checking if getCovidFromLocationInfo properly return the county info.  If not, creating error message body
    if (countyInfo.county_name) {
      // generating and sending appropriate success message
      generateSMS("SUCCESS", phoneNumber, userObj, countyInfo);
    }
  
  } catch(err) {
  }

  res.writeHead(200, { "Content-Type": "text/xml" });

  return res.end();
});

module.exports = router;
