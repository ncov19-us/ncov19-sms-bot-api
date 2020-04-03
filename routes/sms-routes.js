const axios = require("axios");
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// using env variables for this shorthand verification
// const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); may not be necessary for the time being
const MessagingResponse = require("twilio").twiml.MessagingResponse;

// one liner to instantiate Express Router
const router = require("express").Router();
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

// ======== Routes =========

// -- POST Routes --
router.post("/web", (req, res) => {
  // destructuring user input from request body
  // console.log("REQ.BODY", req.body);
  console.log("request: ", req.headers.host);
  // console.log("REQ.BODY", req);

  console.log(process.env.FRONTEND_URL);
  console.log(req);

  if (req.headers.host.includes(req.headers.host)) {
    const messageBody = `
    Message from web app!
    `;
    console.log(req.body);

    client.messages
      .create({
        body: messageBody,
        from: "+18133950040",
        to: `+1${req.body.phone}`
      })
      .then(message => console.log("test", message))
      .catch(err => console.log(err));
  } else {
  }
});

router.post("/", (req, res) => {
  const postalcode = req.body.Body;
  console.log("req.body", req.body);
  // twilio webhooks expects their TwiMl XML format specified here: https://www.twilio.com/docs/glossary/what-is-twilio-markup-language-twiml
  // can also use raw XML in lieu of provided helper functions
  // initiating a new messaging object, to be appended to later (see ~line 90ish)
  const twiml = new MessagingResponse();

  // checks if user inputted proper info
  let county = "";
  let state = "";
  axios
    .get(
      `https://api.opencagedata.com/geocode/v1/google-v3-json?q=countrycode=us|postcode=${postalcode}&key=${process.env.GEOCODING_KEY}&limit=1`
    )
    .then(res => {
      const formatedAddressArray = res.data.results[0].formatted_address.split(
        ","
      );
      // console.log("FORMATED ADDRESS ARRAY", formatedAddressArray);
      state = formatedAddressArray[1].split(" ")[1];
      const countyArray = formatedAddressArray[0].split(" ");
      countyArray.pop();
      county = countyArray.join(" ");
      // console.log(county);
      // declaring options for POST request to main API
      const postOptions = {
        state: state,
        county: county
      };

      console.log("post options", postOptions);

      let stateInfo = {};
      axios
        .post(`${process.env.DASHBOARD_API_URL}/county`, postOptions)
        .then(res => {
          countyInfo = { ...res.data.message[0] };
          console.log(countyInfo);

          client.messages
          .create({
            body: "Success",
            from: "+18133950040",
            to: `${req.body.From}`
          })
          .then(message => console.log("test", message))
          .catch(err => console.log(err));

          // twiml.message(
          //   `
          //   Here are your local updates:
            
          //   For more indepth info: https://ncov19.us/
            
          //   Confirmed cases: ${countyInfo.confirmed}
          //   New cases: ${countyInfo.new}
          //   Total deaths: ${countyInfo.death}
          //   New deaths: ${countyInfo.new_death}
          //   Fatality rate: ${countyInfo.fatality_rate}
          //   Last update: ${countyInfo.last_update}
            
          //   `
          // );
          // ${postOptions.state}
          // ${postOptions.county} County
          // Confirmed cases today: ${stateInfo.todays_confirmed}
          // Total confirmed cases: ${stateInfo.confirmed}
          // Tested today: ${stateInfo.todays_tested}
          // Total tested: ${stateInfo.tested}
          // Today's deaths: ${stateInfo.todays_deaths}
          // Total deaths: ${stateInfo.deaths}
          // res.writeHead(200, { "Content-Type": "text/xml" });
          // res.end(twiml.toString());
        })
        .catch(err => {
          console.log(err);
          client.messages
            .create({
              body: "There was a problem on our end",
              from: "+18133950040",
              to: `${req.body.From}`
            })
            .then(message => console.log("test", message))
            .catch(err => console.log(err));
          // setting inital message in case of failure, request header contents
          // twiml.message(
          // `
          // Sorry, there was an error on our end. Please try again later.

          // In the meantime, check out our online dashboard: https://ncov19.us/
          // `
          // );

          // err.writeHead(500, { "Content-Type": "text/xml" });
          // err.end(twiml.toString());
        });
    })
    .catch(err => {
      // setting inital message in case of failure, request header contents
      client.messages
      .create({
        body: "Please use a 5 digit zip code.",
        from: "+18133950040",
        to: `${req.body.From}`
      })
      .then(message => console.log("test", message))
      .catch(err => console.log(err));
    });
});

module.exports = router;
