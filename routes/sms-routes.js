// enabling easy use of environment variables through a .env file
require('dotenv').config(); // THIS MUST COME BEFORE TWILIO DECLARATION
// using env variables for this shorthand verification
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// one liner to instantiate Express Router
const router = require('express').Router();




// ======== Routes =========

// -- POST Routes --


module.exports = router;