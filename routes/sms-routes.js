const axios = require("axios");
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// authenticated twilio import
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);
// one liner to instantiate Express Router
const router = require("express").Router();


// ======== Routes =========

// -- POST Routes --

// endpoint for users who prompt app via web app
router.post("/web", (req, res) => {
  // getting postal code from web app request
  const postalCode = req.body.zip;
  let county, state;

  client.messages
    .create({
      body: messageBody,
      from: "+18133950040",
      to: `+1${req.body.phonenumber}`
    })
    .then(message => console.log("test", message))
    .catch(err => console.log(err));

    axios
    .get(
      `https://api.opencagedata.com/geocode/v1/google-v3-json?q=countrycode=us|postcode=${postalCode}&key=${process.env.GEOCODING_KEY}&limit=1`
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

          client.messages
          .create({
            body: "Success 🤮",
            from: "+18133950040",
            to: `${req.body.From}`
          })
          .then(message => console.log("test", message))
          .catch(err => console.log(err));

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
          }
        );
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


// endpoint for users who prompt app via SMS
router.post("/", (req, res) => {
  const postalCode = req.body.Body;
  console.log("req.body", req.body);

  // instantiating county and state vars
  let county, state;

  axios
    .get(
      `https://api.opencagedata.com/geocode/v1/google-v3-json?q=countrycode=us|postcode=${postalCode}&key=${process.env.GEOCODING_KEY}&limit=1`
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
          console.log(res.data.message)
          countyInfo = { ...res.data.message[0] };
          console.log(countyInfo);

          const countyMessageBody = `
${postOptions.state}
${postOptions.county} County
Confirmed cases today: ${countyInfo.todays_confirmed}
Total confirmed cases: ${countyInfo.confirmed}
Tested today: ${countyInfo.todays_tested}
Total tested: ${countyInfo.tested}
Today's deaths: ${countyInfo.todays_deaths}
Total deaths: ${countyInfo.deaths}
          `

          // const stateMessageBody = `
          // ${postOptions.state}
          // ${postOptions.county} County
          // Confirmed cases today: ${stateInfo.todays_confirmed}
          // Total confirmed cases: ${stateInfo.confirmed}
          // Tested today: ${stateInfo.todays_tested}
          // Total tested: ${stateInfo.tested}
          // Today's deaths: ${stateInfo.todays_deaths}
          // Total deaths: ${stateInfo.deaths}
          // `

          client.messages
          .create({
            body: countyMessageBody,
            from: "+18133950040",
            to: `${req.body.From}`
          })
          .then(message => console.log("test", message))
          .catch(err => console.log(err));

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
          }
        );
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
