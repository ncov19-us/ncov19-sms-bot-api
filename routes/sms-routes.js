// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: '../.env' });
}
// authenticated twilio import
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
// const MessagingResponse = require('twilio').twiml.MessagingResponse;
// one liner to instantiate Express Router
const router = require("express").Router();

// utililty imports
const getCountyFromPostalCode = require('../util/getCountyFromPostalCode.js');
const getCovidDataFromLocationInfo = require('../util/getCovidDataFromLocationInfo.js');
const generateSMS = require('../util/generateSMS.js');
const countiesPerState = require('../util/countiesPerState.js')

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 86400 });

// endpoint for SMS and web users
router.post("/web", async (req, res) => {
  // instantiating post code and phone number
  let phoneNumber, postalCode;
  // checking to see where the request came from to handle the body appropratiately
  if (req.get('origin') && req.get('origin').includes(process.env.WEB_REQUEST_ORIGIN)) {
    postalCode = parseInt(req.body.zip);
    phoneNumber = `+1${req.body.phone.replace(/[,.-]/g, "")}`;
  }
  else {
    // find out what the origin URL is from the Twilio Webhook to make this case more explicit
    postalCode = parseInt(req.body.Body);
    phoneNumber = req.body.From
  }

  // 1. check for user phone number, and get the object
  let userObj = myCache.get(phoneNumber);


  // 2. add user to cache
  if (!userObj) {
    userObj = { msgLimit: process.env.DAILY_MESSAGE_LIMIT - 1, alertedUser: false };
    console.log(userObj);
    const success = myCache.set(phoneNumber, userObj);
    console.log(success);

  } else {
    // 3 a. if user still has message limit   
    if (userObj.msgLimit > 0) {
      // updating message limit to subtract 1
      myCache.set(phoneNumber, { ...userObj, msgLimit: userObj.msgLimit - 1 })
      console.log(myCache.get(phoneNumber));
    }
    // 3 b. if user has no message limit and has not been alterted
    else if (userObj.msgLimit === 0 && userObj.alertedUser === false) {
      myCache.set(phoneNumber, { ...userObj, alertedUser: true });
      let smsMessage = generateSMS("LIMIT_REACHED");

      // sending message to user and status code to twilio
      client.messages
        .create({ from: process.env.TWILIO_NUMBER, body: smsMessage, to: phoneNumber })
        .then(message => console.log(message))
        .catch(err => console.log(err));

      res.writeHead(200, { 'Content-Type': 'text/xml' });

      return res.end();
    } else if (userObj.msgLimit === 0 && userObj.alertedUser === true) {

      return res.end();
    }
  }




  // 1. check for user phone number, and get the object
  let userObj = myCache.get(phoneNumber);
  console.log(userObj);
  // 2. add user to cache
  if (!userObj) {
    userObj = { msgLimit: process.env.DAILY_MESSAGE_LIMIT - 1, alertedUser: false };
    console.log(userObj);
    const success = myCache.set(phoneNumber, userObj);
    console.log(success);

    // 3. if user in cache
  } else {
    // 3 a. if user still has message limit   
    if (userObj.msgLimit > 0) {
      // updating message limit to subtract 1
      myCache.set(phoneNumber, { ...userObj, msgLimit: userObj.msgLimit - 1 })
      console.log(myCache.get(phoneNumber));
    }
    // 3 b. if user has no message limit and has not been alterted
    else if (userObj.msgLimit === 0 && userObj.alertedUser === false) {
      myCache.set(phoneNumber, { ...userObj, alertedUser: true });
      let smsMessage = generateSMS("LIMIT_REACHED");

      // sending message to user and status code to twilio
      client.messages
        .create({ from: process.env.TWILIO_NUMBER, body: smsMessage, to: phoneNumber })
        .then(message => console.log(message))
        .catch(err => console.log(err));

      res.writeHead(200, { 'Content-Type': 'text/xml' });

      return res.end();
    }
    else if (userObj.msgLimit === 0 && userObj.alertedUser === true) {
      return res.end();
    }
  }




  // checking user input to make sure it's valid (in conjunction with frontend validation)
  if (postalCode.toString().length !== 5 || Number.isInteger(postalCode) === false) {
    // if bad input gets through somehow, catch it here as well and send appropriate message
    const smsMessage = generateSMS("BAD_INPUT");

    // sending message to user and status code to twilio
    client.messages
      .create({ from: process.env.TWILIO_NUMBER, body: smsMessage, to: phoneNumber })
      .then(message => console.log(message))
      .catch(err => console.log(err));

    res.writeHead(200, { 'Content-Type': 'text/xml' });

    return res.end();
  }


  // temporary until we get rate limit fully implemented
  (async function () {
    // using util function to get state/county info
    let { locationInfo, badInputMessage } = await getCountyFromPostalCode(postalCode);
    // console.log(locationInfo);
    // console.log(badInputMessage);

    if (badInputMessage !== '') {
      // sending message to user and status code to twilio
      client.messages
        .create({ from: process.env.TWILIO_NUMBER, body: smsMessage, to: phoneNumber })
        .then(message => console.log(message))
        .catch(err => console.log(err));

      console.log(myCache);
      res.writeHead(200, { 'Content-Type': 'text/xml' });

      return res.end();
    }

    // console.log(countiesPerState[locationInfo.state]);
    // checking the case of a valid non-US zip code
    if (!countiesPerState[locationInfo.state]) {

      let smsMessage = generateSMS("NOT_USA");

      // sending message to user and status code to twilio
      client.messages
        .create({ from: process.env.TWILIO_NUMBER, body: smsMessage, to: phoneNumber })
        .then(message => console.log(message))
        .catch(err => console.log(err));

      res.writeHead(200, { 'Content-Type': 'text/xml' });

      return res.end();
    }

    // using util function to get covid data from our dashboard API;
    const countyInfo = await getCovidDataFromLocationInfo(locationInfo, phoneNumber);

    let smsMessage;
    let userObj = myCache.get(phoneNumber);
    // checking if getCovidFromLocationInfo properly return the county info.  If not, creating error message body
    if (countyInfo.county_name) {
      // generating and sending appropriate success message
      smsMessage = generateSMS("SUCCESS", countyInfo, userObj);

    } else {
      smsMessage = generateSMS("SERVER_ERROR");
    }


    // sending message to user and status code to twilio
    client.messages
      .create({ from: process.env.TWILIO_NUMBER, body: smsMessage, to: phoneNumber })
      .then(message => console.log(message))
      .catch(err => console.log(err));

    // setting headers for response to twilio
    res.writeHead(200, { 'Content-Type': 'text/xml' });

    return res.end();
  })();

  // no other activity on server is done unless the user can be verified (they haven't used their number limit for they day)
  // client.verify
  //   .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  //   .verifications
  //   // need to find a way to rate limit without Twilio Verify API
  //   .create({ rateLimits: { end_user_phone_number: phoneNumber }, to: process.env.VERIFY_RECEIVER, channel: 'sms' })
  //   .then(verification => {
  //     // manually verifiying the user so they don't have to type in a verification code
  //     client.verify.services(process.env.TWILIO_VERIFY_SERVICE_SID)
  //       .verifications(verification.sid)
  //       .update({ status: 'approved' })
  //       .then(async (res) => {
  //         // using util function to get state/county info
  //         let postOptions = await getCountyFromPostalCode(postalCode, phoneNumber);
  //         // using util function to get covid data from our dashboard API;
  //         let countyInfo = await getCovidDataFromLocationInfo(postOptions, phoneNumber);
  //         // using util function to get state data based on countyInfo previously retrieved from main DB call
  //         let covidData = await getStateInfoFromCountyInfo(postOptions.state, countyInfo);
  //         // generating and sending appropriate success message
  //         generateSMS("SUCCESS", phoneNumber, countyInfo, covidData);
  //       })
  //       .catch(err => { console.log(err) })
  //   })
  //   .catch(err => {
  //     console.log(err)
  //     // if user can't be verified, define and send error messaging making it clear they have reached their limit for the day
  //     generateSMS("LIMIT_REACHED", phoneNumber);
  //   })
});

module.exports = router;
