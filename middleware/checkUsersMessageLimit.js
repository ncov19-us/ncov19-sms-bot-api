// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 86400 });

// util imports
const generateSMS = require("../util/generateSMS.js");

function checkUsersMessageLimit(req, res, next) {

  // instantiating post code and phone number
  let phoneNumber, postalCode;

  // checking to see where the request came from to handle the body appropratiately
  if (
    req.get("origin") &&
    req.get("origin").includes(process.env.WEB_REQUEST_ORIGIN)
  ) {
    postalCode = parseInt(req.body.zip);
    phoneNumber = `+1${req.body.phone.replace(/[,.-]/g, "")}`;

    // reassigning req.body to these values to use them in main route
    req.body = {
      postalCode: postalCode,
      phoneNumber: phoneNumber,
    };
  } else {
    // find out what the origin URL is from the Twilio Webhook to make this case more explicit
    postalCode = parseInt(req.body.Body);
    phoneNumber = req.body.From;

    // reassigning req.body to these values to use them in main route
    req.body = {
      postalCode: postalCode,
      phoneNumber: phoneNumber,
    };
  }

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

    req.body.userObj = userObj
  
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
  
      generateSMS("LIMIT_REACHED", phoneNumber, userObj);
  
      res.writeHead(200, { "Content-Type": "text/xml" });
  
      return res.end();
    } else if (userObj.msgLimit === 0 && userObj.alertedUser === true) {
      res.writeHead(200, { "Content-Type": "text/xml" });
  
      // returning immediately if user has already been alerted that they're out of messages
      return res.end();
    }
  }

  next();
} 

module.exports = { checkUsersMessageLimit, myCache };