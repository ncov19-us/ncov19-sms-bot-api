const axios = require("axios");
// library for getting zipcode info to avoid implementing more HTTP requests via an API
const zipcodes = require("zipcodes");
const counties = require("us-counties");
const whichPolygon = require("which-polygon");
const findCounty = whichPolygon(counties);
// enabling easy use of environment variables through a .env file
require("dotenv").config(); // THIS MUST COME BEFORE TWILIO DECLARATION
// using env variables for this shorthand verification
// const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); may not be necessary for the time being
const MessagingResponse = require("twilio").twiml.MessagingResponse;

// one liner to instantiate Express Router
const router = require("express").Router();

// ======== Routes =========

// -- POST Routes --
router.post("/", (req, res) => {
  // destructuring user input from request body
  const { Body } = req.body;
  // if (input is valid) {
  //     make request to main API and continue
  // } else {
  //     go ahead and create error message
  // }

  // this already provides city/state, but current dashboard API is expecting county/state
  const { latitude, longitude, state } = zipcodes.lookup(Body);

  // using this library to get county from coords
  // look into `node -–max-old-space-size=8192 your-file.js` or potentially running us-counties as its own process to help RAM performance
  const { NAMELSAD10 } = findCounty([longitude, latitude]);

  // declaring options for POST request to main API
  const postOptions = {
    state: state,
    county: NAMELSAD10
  };

  console.log(postOptions);

  // where the API call to DB will go
  // axios.post(`${process.env.NCOV19_API_ENDPOINT}`, postOptions)
  // .then(res => {
  //     console.log(res);
  // })
  // .catch(err => {
  //     console.log(err);
  // })

  // twilio webhooks expects their TwiMl SML format specified here: https://www.twilio.com/docs/glossary/what-is-twilio-markup-language-twiml
  // can also use raw XML in lieu of provided helper functions
  const twiml = new MessagingResponse();

  // setting inital message, request header contents
  twiml.message("The robots are coming!");
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());

  // // method for sending messages
  // client.messages
  // .create({
  //     body: "This is the ship that made the Kessel Run in fourteen parsecs?",
  //     from: "+17735707220",
  //     to: "+17408416256"
  // })
  // .then(message => {
  //     console.log(message.sid);
  // })
  // .catch(err => {
  //     console.log(err);
  // });
});

module.exports = router;
