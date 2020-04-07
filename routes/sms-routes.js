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
  DE: 3,
};

// let rateLimitSid;

// client.verify.services(process.env.RATE_LIMIT_SID)
// .rateLimits
// .create({
//   description: 'Limit verifications by End User Phone Number',
//   uniqueName: 'end_user_phone_number'
// })
// .then(rate_limit => rateLimitSid = rate_limit.sid)
// .catch(err => console.log(err))
// console.log(rateLimitSid)

// ======== Routes =========

router.post('/', (req, res) => {
  res.status(201).json({message: "nice"})
})

// -- POST Routes --

// endpoint for users who prompt app via web app
router.post("/web", (req, res) => {
  // getting postal code from web app request
  console.log(req.body);
  const postalCode = parseInt(req.body.zip);
  const phonenumber = req.body.phone.replace(/[,.-]/g, "");
  console.log(phonenumber);
  if (
    postalCode.toString().length !== 5 ||
    Number.isInteger(postalCode) === false
  ) {
    client.messages
      .create({
        body: 
        `
        Please use a 5 digit zip code.

        Check out our online dashboard: https://ncov19.us
        `,
        from: "+18133950040",
        to: `${req.body.From}`,
      })
      .then((message) => console.log("test", message))
      .catch((err) => console.log(err));

    return;
  }
  console.log(`+1${phonenumber}`);
  res.status(201).json({message: "success"})
  // res.status(201).json({message: "nice"})
  // client.verify
  //   .services(process.env.VERIFY_SERVICE_SID)
  //   .verifications(`${phonenumber}`)
  //   .update({ status: "approved" })
  //   // .create({rateLimits: {
  //   //   end_user_phone_number: phonenumber
  //   // }, to: `+1${phonenumber}`, channel: 'sms'})
  //   .then((verification) => {
  //     console.log(verification);
      // instantiating county and state vars
      let county, state;

      axios
        .get(
          `https://api.opencagedata.com/geocode/v1/google-v3-json?q=countrycode=us|postcode=${postalCode}&key=${process.env.GEOCODING_KEY}&limit=1`
        )
        .then((res) => {
          // console.log(res.status(201)))
          const formatedAddressArray = res.data.results[0].formatted_address.split(
            ","
          );
          console.log("FORMATED ADDRESS ARRAY", formatedAddressArray);
          state = formatedAddressArray[1].split(" ")[1];
          // console.log(state)
          const countyArray = formatedAddressArray[0].split(" ");
          countyArray.pop();
          county = countyArray.join(" ");
          // console.log(county);
          // declaring options for POST request to main API
          const postOptions = {
            state: state,
            county: county,
          };

          console.log("post options", postOptions);
          let countyInfo, stateInfo;

          axios
            .post(`${process.env.DASHBOARD_API_URL}/county`, postOptions)
            .then((res) => {
              // console.log(res.data.message);
              countyInfo = { ...res.data.message[0] };

              // post request to build comparisons to state averages to send to user
              axios
                .post(`${process.env.DASHBOARD_API_URL}/stats`, {
                  state: state,
                })
                .then((res) => {
                  let numOfCounties = countiesPerState[state];

                  let newCaseIncrease =
                    countyInfo.new /
                    (res.data.message.todays_confirmed / numOfCounties);
                  let totalCaseIncrease =
                    countyInfo.confirmed /
                    (res.data.message.confirmed / numOfCounties);
                  let newDeathIncrease =
                    countyInfo.new_death /
                    (res.data.message.todays_deaths / numOfCounties);

                  if (isNaN(newCaseIncrease)) {
                    newCaseIncrease = 0;
                  } else if (isNaN(totalCaseIncrease)) {
                    totalCaseIncrease = 0;
                  } else if (isNaN(newDeathIncrease)) {
                    newDeathIncrease = 0;
                  }

                  function upOrDown(num) {
                    let arrow;

                    if (num > 0) {
                      arrow = "\u2B06";

                      return arrow;
                    } else if (num === 0) {
                      arrow = "\u2B06";

                      return arrow;
                    } else {
                      arrow = "\u2B07";

                      return arrow;
                    }
                  }
                  console.log("new case increase", newCaseIncrease);
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
                  client.messages
                    .create({
                      body: countyMessageBody,
                      from: "+18133950040",
                      to: `+1${phonenumber}`,
                    })
                    .then((message) => console.log(message))
                    .catch((err) => console.log(err));
                })
                .catch((err) => {
                  console.log(err);
                });
            })
            .catch((err) => {
              console.log(err);
              client.messages
                .create({
                  body: 
                  `
There was a problem on our end.  Please try again later!

Check out our online dashboard: https://ncov19.us
                  `,
                  from: "+18133950040",
                  to: `+1${phonenumber}`,
                })
                .then((message) => console.log("test", message))
                .catch((err) => console.log(err));
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500);
          client.messages
            .create({
              body: 
              `
Please use a 5 digit zip code.

Check out our online dashboard: https://ncov19.us
              `,
              from: "+18133950040",
              to: `+1${phonenumber}`,
            })
            .then((message) => console.log("test", message))
            .catch((err) => console.log(err));
        });
    })
//     .catch((err) => {
//       client.messages
//         .create({
//           body:
//             `
// You have used all of your requests for today.  

// Check out our online dashboard: https://ncov19.us
//             `,
//           from: "+18133950040",
//           to: `+1${phonenumber}`,
//         })
//         .then((message) => console.log(message))
//         .catch((err) => console.log(err));

//         console.log('test')
//     });
// // });

// endpoint for users who prompt app via SMS
router.post("/", (req, res) => {
  const postalCode = parseInt(req.body.Body);
  let phonenumber = req.body.From;
  console.log(req.body.From);
  // console.log(phonenumber);
  // console.log(typeof postalCode)
  // console.log(postalCode.toString().length !== 5)
  if (
    postalCode.toString().length !== 5 ||
    Number.isInteger(postalCode) === false
  ) {
    // console.log('check')
    client.messages
      .create({
        body: "Please use a 5 digit zip code.",
        from: "+18133950040",
        to: `${req.body.From}`,
      })
      .then((message) => console.log("test", message))
      .catch((err) => console.log(err));

    return;
  }

  client.verify
    .services(process.env.VERIFY_SERVICE_SID)
    .verifications(`${phonenumber}`)
    .update({ status: "approved" })
    // .create({rateLimits: {
    //   end_user_phone_number: phonenumber
    // }, to: `+1${phonenumber}`, channel: 'sms'})
    .then((verification) => {
      console.log(verification);

      // instantiating county and state vars
      let county, state;

      axios
        .get(
          `https://api.opencagedata.com/geocode/v1/google-v3-json?q=countrycode=us|postcode=${postalCode}&key=${process.env.GEOCODING_KEY}&limit=1`
        )
        .then((res) => {
          // console.log(res.status(201)))
          const formatedAddressArray = res.data.results[0].formatted_address.split(
            ","
          );
          console.log("FORMATED ADDRESS ARRAY", formatedAddressArray);
          state = formatedAddressArray[1].split(" ")[1];
          // console.log(state)
          const countyArray = formatedAddressArray[0].split(" ");
          countyArray.pop();
          county = countyArray.join(" ");
          // console.log(county);
          // declaring options for POST request to main API
          const postOptions = {
            state: state,
            county: county,
          };

          console.log("post options", postOptions);
          let countyInfo, stateInfo;

          axios
            .post(`${process.env.DASHBOARD_API_URL}/county`, postOptions)
            .then((res) => {
              // console.log(res.data.message);
              countyInfo = { ...res.data.message[0] };

              // post request to build comparisons to state averages to send to user
              axios
                .post(`${process.env.DASHBOARD_API_URL}/stats`, {
                  state: state,
                })
                .then((res) => {
                  let numOfCounties = countiesPerState[state];

                  let newCaseIncrease =
                    countyInfo.new /
                    (res.data.message.todays_confirmed / numOfCounties);
                  let totalCaseIncrease =
                    countyInfo.confirmed /
                    (res.data.message.confirmed / numOfCounties);
                  let newDeathIncrease =
                    countyInfo.new_death /
                    (res.data.message.todays_deaths / numOfCounties);

                  if (isNaN(newCaseIncrease)) {
                    newCaseIncrease = 0;
                  } else if (isNaN(totalCaseIncrease)) {
                    totalCaseIncrease = 0;
                  } else if (isNaN(newDeathIncrease)) {
                    newDeathIncrease = 0;
                  }

                  function upOrDown(num) {
                    let arrow;

                    if (num > 0) {
                      arrow = "\u2B06";

                      return arrow;
                    } else if (num === 0) {
                      arrow = "\u2B06";

                      return arrow;
                    } else {
                      arrow = "\u2B07";

                      return arrow;
                    }
                  }
                  console.log("new case increase", newCaseIncrease);
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
                  client.messages
                    .create({
                      body: countyMessageBody,
                      from: "+18133950040",
                      to: `${phonenumber}`,
                    })
                    .then((message) => console.log(message))
                    .catch((err) => console.log(err));
                })
                .catch((err) => {
                  console.log(err);
                });
            })
            .catch((err) => {
              console.log(err);
              client.messages
                .create({
                  body: 
                  `
There was a problem on our end.  Please try again later!

Check out our online dashboard: https://ncov19.us
                  `,
                  from: "+18133950040",
                  to: `${phonenumber}`,
                })
                .then((message) => console.log("test", message))
                .catch((err) => console.log(err));
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500);
          client.messages
            .create({
              body: 
              `
Please use a 5 digit zip code.

Check out our online dashboard: https://ncov19.us
              `,
              from: "+18133950040",
              to: `${phonenumber}`,
            })
            .then((message) => console.log("test", message))
            .catch((err) => console.log(err));
        });
    })
    .catch((err) => {
      client.messages
        .create({
          body:
            `
You have used all of your requests for today.  

Check out our online dashboard: https://ncov19.us
            `,
          from: "+18133950040",
          to: `${phonenumber}`,
        })
        .then((message) => console.log(message))
        .catch((err) => console.log(err));
    });
});

module.exports = router;
