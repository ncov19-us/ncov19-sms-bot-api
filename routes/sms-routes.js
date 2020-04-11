const axios = require("axios");
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: '../.env' });
}
// authenticated twilio import
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
// one liner to instantiate Express Router
const router = require("express").Router();

// utililty imports
const getCountyFromPostalCode = require('../util/getCountyFromPostalCode.js');
const getCovidDataFromLocationInfo = require('../util/getCovidDataFromLocationInfo.js');
const getStateInfoFromCountyInfo = require('../util/getStateInfoFromCountyInfo');
const generateSMS = require('../util/generateSMS');


// endpoint for SMS and web users
router.post("/web", (req, res) => {
  // instantiating post code and phone number
  let phoneNumber, postalCode;

  // checking to see where the request came from to handle the body appropratiately
  if (req.get('origin') && req.get('origin').includes(process.env.WEB_REQUEST_ORIGIN)) {
    postalCode = parseInt(req.body.zip);
    phoneNumber = `+1${req.body.phone.replace(/[,.-]/g, "")}`;

  } else {
    // find out what the origin URL is from the Twilio Webhook?
    postalCode = parseInt(req.body.Body);
    phoneNumber = req.body.From
  }

  // checking user input to make sure it's valid (in conjunction with frontend validation)
  if (postalCode.toString().length !== 5 || Number.isInteger(postalCode) === false) {
    // if bad input gets through somehow, catch it here as well and send appropriate message
    generateSMS("BAD_INPUT", phoneNumber);

    return
  }
  // no other activity on server is done unless the user can be verified (they haven't used their number limit for they day)
  client.verify
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications
    // need to find a way to rate limit without Twilio Verify API
    .create({ rateLimits: { end_user_phone_number: phoneNumber }, to: process.env.VERIFY_RECEIVER, channel: 'sms' })
    .then(verification => {
      // manually verifiying the user so they don't have to type in a verification code
      client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications(verification.sid)
        .update({ status: 'approved' })
        .then(async (res) => {
          // using util function to get state/county info
          let postOptions = await getCountyFromPostalCode(postalCode, phoneNumber);
          // using util function to get covid data from our dashboard API;
          let countyInfo = await getCovidDataFromLocationInfo(postOptions, phoneNumber);
          // using util function to get state data based on countyInfo previously retrieved from main DB call
          let covidData = await getStateInfoFromCountyInfo(postOptions.state, countyInfo);
          // generating and sending appropriate success message
          generateSMS("SUCCESS", phoneNumber, countyInfo, covidData);
        })
        .catch(err => { console.log(err) })
    })
    .catch(err => {
      console.log(err)
      // if user can't be verified, define and send error messaging making it clear they have reached their limit for the day
      generateSMS("LIMIT_REACHED", phoneNumber);
    })
});

module.exports = router;
