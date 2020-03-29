const axios = require("axios");
// library for getting zipcode info to avoid implementing more HTTP requests via an API
const zipcodes = require("zipcodes");
const counties = require("us-counties");
const whichPolygon = require("which-polygon");
const findCounty = whichPolygon(counties);
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}
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

  // twilio webhooks expects their TwiMl XML format specified here: https://www.twilio.com/docs/glossary/what-is-twilio-markup-language-twiml
  // can also use raw XML in lieu of provided helper functions
  const twiml = new MessagingResponse();

  // checks if user inputted proper info
  try {
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
    // setting message in the case of success, request header contents

    twiml.message(
      `
      Here are your local updates:
      ${postOptions.state}
      ${postOptions.county}

      For more indepth info: https://ncov19.us/
      `
    );
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
    } catch (err) {
    // setting inital message in case of failure, request header contents
    twiml.message(
      `
    Sorry, I didn't understand that message.  Make sure to respond with a 5 digit zip code.

    For more indepth info: https://ncov19.us/
    `
    );
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());
  }
});

module.exports = router;
