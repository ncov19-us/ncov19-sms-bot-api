// library imports
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

// utils
const generateSMS = require("../util/generateSMS.js");

// function that assigns phoneNumber and zip code vars according to where the request came from and validates the inputs
function setAndValidateVars(req, res, next) {
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

  if (
    postalCode.toString().length !== 5 ||
    Number.isInteger(postalCode) === false
  ) {
    // if bad input gets through somehow, catch it here and send appropriate message
    generateSMS("BAD_INPUT", phoneNumber);

    res.writeHead(200, { "Content-Type": "text/xml" });

    // ending route if input is invalid
    return res.end();
  }

  next();
} // checking user input to make sure it's valid (in conjunction with frontend validation)

module.exports = setAndValidateVars;
