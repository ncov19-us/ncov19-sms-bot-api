// library imports
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

// utils
const generateSMS = require("../util/generateSMS.js");
const userCheck = require("../middleware/checkUsersMessageLimit.js");

// checking user input to make sure it's valid (in conjunction with frontend validation)
function setAndValidateVars(req, res, next) {

  if (
    req.body.postalCode.toString().length !== 5 ||
    Number.isInteger(req.body.postalCode) === false
  ) {
    // if bad input gets through somehow, catch it here and send appropriate message
    generateSMS("BAD_INPUT", req.body.phoneNumber, userCheck.myCache.get(req.body.phoneNumber));

    res.writeHead(200, { "Content-Type": "text/xml" });

    // ending route if input is invalid
    return res.end();
  } else {
    next();
  }

}

module.exports = setAndValidateVars;
