// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

// middleware
const captcha = require("../middleware/validateCaptcha");

// authenticated twilio import
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);
// const MessagingResponse = require('twilio').twiml.MessagingResponse;

// one liner to instantiate Express Router
const router = require("express").Router();
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 86400 });

// middleware imports
const setAndValidateVars = require("../middleware/setAndValidateVars.js");

// utility imports
const getCountyFromPostalCode = require("../util/getCountyFromPostalCode.js");
const getCovidDataFromLocationInfo = require("../util/getCovidDataFromLocationInfo.js");
const generateSMS = require("../util/generateSMS.js");

// endpoint for SMS and web users
router.post("/", setAndValidateVars, async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  const postalCode = req.body.postalCode;

  // 1. check for user phone number, and get the object
  let userObj = myCache.get(phoneNumber);

  // 2. add user to cache
  if (!userObj) {
    userObj = {
      msgLimit: process.env.DAILY_MESSAGE_LIMIT - 1,
      alertedUser: false,
    };

    // setting number to cache
    myCache.set(phoneNumber, userObj);

    // 3. if user in cache
  } else {
    // 3 a. if user still has message limit
    if (userObj.msgLimit > 0) {
      // updating message limit to subtract 1
      myCache.set(phoneNumber, { ...userObj, msgLimit: userObj.msgLimit - 1 });
    }
    // 3 b. if user has no message limit and has not been alterted
    else if (userObj.msgLimit === 0 && userObj.alertedUser === false) {
      myCache.set(phoneNumber, { ...userObj, alertedUser: true });

      generateSMS("LIMIT_REACHED", phoneNumber);

      res.writeHead(200, { "Content-Type": "text/xml" });

      return res.end();
    } else if (userObj.msgLimit === 0 && userObj.alertedUser === true) {
      res.writeHead(200, { "Content-Type": "text/xml" });

      // returning immediately if user has already been alerted that they're out of messages
      return res.end();
    }
  }

  // using util function to get state/county info
  let locationInfo = await getCountyFromPostalCode(postalCode, phoneNumber);
  console.log('here', locationInfo)

  // using util function to get covid data from our dashboard API;
  const countyInfo = await getCovidDataFromLocationInfo(
    locationInfo,
    phoneNumber
  );

  // reassigning userObj to updated cache object
  userObj = myCache.get(phoneNumber);

  // checking if getCovidFromLocationInfo properly return the county info.  If not, creating error message body
  if (countyInfo.county_name) {
    // generating and sending appropriate success message
    generateSMS("SUCCESS", phoneNumber, countyInfo, userObj);
  } else {
    generateSMS("SERVER_ERROR", phoneNumber);
  }

  res.writeHead(200, { "Content-Type": "text/xml" });

  return res.end();
});

module.exports = router;
