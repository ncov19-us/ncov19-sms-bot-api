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

const countiesPerState = {
  TX: 254,
  GA: 159,
  VA: 134,
  KY: 120,
  M0: 115,
  KS: 105,
  IL: 102,
  NC: 100,
  IA: 99,
  TN: 95,
  NE: 93,
  IN: 92,
  OH: 88,
  MN: 87,
  MI: 83,
  MS: 82,
  OK: 77,
  AR: 75,
  WI: 72,
  PA: 67,
  FL: 67,
  AL: 67,
  SD: 66,
  LA: 64,
  CO: 64,
  NY: 62,
  CA: 58,
  MT: 56,
  WV: 55,
  ND: 53,
  SC: 46,
  ID: 44,
  WA: 39,
  OR: 36,
  NM: 33,
  UT: 29,
  AK: 27,
  MD: 24,
  WY: 23,
  NJ: 21,
  NV: 17,
  ME: 16,
  AZ: 15,
  VT: 14,
  MA: 14,
  NH: 10,
  CT: 8,
  RI: 5,
  HI: 5,
  DE: 3
};
// ======== Routes =========

// -- POST Routes --

// endpoint for users who prompt app via web app
router.post("/web", (req, res) => {
  // getting postal code from web app request
  const postalCode = req.body.zip;
  const phonenumber = req.body.phone.replace(/[,.-]/g, "");

  console.log(phonenumber);

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
      // console.log(state)
      const countyArray = formatedAddressArray[0].split(" ");
      countyArray.pop();
      county = countyArray.join(" ");
      // console.log(county);
      // declaring options for POST request to main API
      const postOptions = {
        state: state,
        county: county
      };

      // console.log("post options", postOptions);
      let countyInfo, stateInfo;

      axios
        .post(`${process.env.DASHBOARD_API_URL}/county`, postOptions)
        .then(res => {
          console.log(res.data.message);
          countyInfo = { ...res.data.message[0] };

          // post request to build comparisons to state averages to send to user
          axios
            .post(`${process.env.DASHBOARD_API_URL}/stats`, { state: state })
            .then(res => {
              let numOfCounties = countiesPerState[state];
              console.log(res.data.message);
              // let [ tested, todays_tested, confirmed, todays_confirmed, deaths, todays_deaths ] = res.data.message;
              console.log(res.data.message.todays_confirmed);
              let newCaseIncrease =
                countyInfo.new /
                (res.data.message.todays_confirmed / numOfCounties);
              let totalCaseIncrease =
                countyInfo.confirmed /
                (res.data.message.confirmed / numOfCounties);
              let newDeathIncrease =
                countyInfo.new_death /
                (res.data.message.todays_deaths / numOfCounties);
              let totalDeathIncrease =
                countyInfo.death / (res.data.message.deaths / numOfCounties);

              console.log("new", newCaseIncrease);
              // let fatalityRateIncrease = countyInfo.fatality_rate / s

              function upOrDown(num) {
                let arrow;

                if (num > 0) {
                  arrow = "\u2B06";
                  console.log("up");
                  return arrow;
                } else if (num === 0) {
                  arrow = "";
                  console.log("none");
                  return arrow;
                } else {
                  arrow = "\u2B07";
                  console.log("down");
                  return arrow;
                }
              }

              const countyMessageBody = `
${countyInfo.county_name} County, ${countyInfo.state_name}

Cases Today: ${countyInfo.new} (${upOrDown(
                newCaseIncrease
              )} ${newCaseIncrease.toFixed(2)}% from state avg.)
Total Cases: ${countyInfo.confirmed} (${upOrDown(
                totalCaseIncrease
              )} ${totalCaseIncrease.toFixed(2)}% from state avg.)
Deaths Today: ${countyInfo.new_death} (${upOrDown(
                newDeathIncrease
              )} ${newDeathIncrease.toFixed(2)}% from state avg.)
Total Deaths: ${countyInfo.death} (${upOrDown(
                totalCaseIncrease
              )} ${totalCaseIncrease.toFixed(2)}% from state avg.)
Fatality Rate: ${countyInfo.fatality_rate}
            `;

              // console.log(stateArr);
              client.messages
                .create({
                  body: countyMessageBody,
                  from: "+18133950040",
                  to: `${phonenumber}`
                })
                .then(message => console.log("test", message))
                .catch(err => console.log(err));
            })
            .catch(err => {
              console.log(err);
            });

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
        })
        .catch(err => {
          console.log(err);
          client.messages
            .create({
              body: "There was a problem on us",
              from: "+18133950040",
              to: `${phonenumber}`
            })
            .then(message => console.log("test", message))
            .catch(err => console.log(err));
        });
    })
    .catch(err => {
      // setting inital message in case of failure, request header contents
      client.messages
        .create({
          body: "Please use a 5 digit zip code.",
          from: "+18133950040",
          to: `${phonenumber}`
        })
        .then(message => console.log("test", message))
        .catch(err => console.log(err));
    });
});

// endpoint for users who prompt app via SMS
router.post("/", (req, res) => {
  const postalCode = req.body.Body;
  // console.log("req.body", req.body);

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
      // console.log(state)
      const countyArray = formatedAddressArray[0].split(" ");
      countyArray.pop();
      county = countyArray.join(" ");
      // console.log(county);
      // declaring options for POST request to main API
      const postOptions = {
        state: state,
        county: county
      };

      // console.log("post options", postOptions);
      let countyInfo, stateInfo;

      axios
        .post(`${process.env.DASHBOARD_API_URL}/county`, postOptions)
        .then(res => {
          console.log(res.data.message);
          countyInfo = { ...res.data.message[0] };

          // post request to build comparisons to state averages to send to user
          axios
            .post(`${process.env.DASHBOARD_API_URL}/stats`, { state: state })
            .then(res => {
              let numOfCounties = countiesPerState[state];
              console.log(res.data.message);
              // let [ tested, todays_tested, confirmed, todays_confirmed, deaths, todays_deaths ] = res.data.message;
              console.log(res.data.message.todays_confirmed);
              let newCaseIncrease =
                countyInfo.new /
                (res.data.message.todays_confirmed / numOfCounties);
              let totalCaseIncrease =
                countyInfo.confirmed /
                (res.data.message.confirmed / numOfCounties);
              let newDeathIncrease =
                countyInfo.new_death /
                (res.data.message.todays_deaths / numOfCounties);
              let totalDeathIncrease =
                countyInfo.death / (res.data.message.deaths / numOfCounties);

              console.log("new", newCaseIncrease);
              // let fatalityRateIncrease = countyInfo.fatality_rate / s

              function upOrDown(num) {
                let arrow;

                if (num > 0) {
                  arrow = "\u2B06";
                  console.log("up");
                  return arrow;
                } else if (num === 0) {
                  arrow = "";
                  console.log("none");
                  return arrow;
                } else {
                  arrow = "\u2B07";
                  console.log("down");
                  return arrow;
                }
              }

              const countyMessageBody = `
${countyInfo.county_name} County, ${countyInfo.state_name}

Cases Today: ${countyInfo.new} (${upOrDown(
                newCaseIncrease
              )} ${newCaseIncrease.toFixed(2)}% from state avg.)
Total Cases: ${countyInfo.confirmed} (${upOrDown(
                totalCaseIncrease
              )} ${totalCaseIncrease.toFixed(2)}% from state avg.)
Deaths Today: ${countyInfo.new_death} (${upOrDown(
                newDeathIncrease
              )} ${newDeathIncrease.toFixed(2)}% from state avg.)
Total Deaths: ${countyInfo.death} (${upOrDown(
                totalCaseIncrease
              )} ${totalCaseIncrease.toFixed(2)}% from state avg.)
Fatality Rate: ${countyInfo.fatality_rate}
            `;

              // console.log(stateArr);
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
            });

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
        })
        .catch(err => {
          console.log(err);
          client.messages
            .create({
              body: "There was a problem on us",
              from: "+18133950040",
              to: `${req.body.From}`
            })
            .then(message => console.log("test", message))
            .catch(err => console.log(err));
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
