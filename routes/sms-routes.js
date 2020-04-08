const axios = require("axios");
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// authenticated twilio import
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
// one liner to instantiate Express Router
const router = require("express").Router();

// utililty imports
const getCountyFromZip = require('../util/getCountyFromPostalCode.js'); // api call
const upOrDown = require('../util/upOrDown.js'); // determines which arrow emoji to use based on data point
const getCovidDataFromLocationInfo = require('../util/getCovidDataFromLocationInfo');


// ======== Routes =========

// -- POST Routes --

// endpoint for SMS and web users
router.post("/web", (req, res) => {
  console.log(req.body)
  // checking to see if the request came from Twilio or from our webapp
  // "if from twilio, phoneNumber = X else if from webapp, phoneNumber = Y"

  // getting postal code from request (may come from webapp or Twilio)
  const postalCode = parseInt(req.body.zip);
  const phoneNumber = req.body.phone.replace(/[,.-]/g, "");

  // checking user input to make sure it's valid (in conjunction with frontend validation)
  if (postalCode.toString().length !== 5 || Number.isInteger(postalCode) === false) {
    // if bad input gets through somehow, catch it here as well and send appropriate message
    generateSMS("BAD_INPUT", phoneNumber);
  }
  res.status(201).json({ message: "success" });

  // no other activity on server is done unless the user can be verified (they haven't used their number limit for they day)
  client.verify
    .services(process.env.VERIFY_SERVICE_SID)
    .verifications(`${phoneNumber}`)
    .update({ status: "approved" })
    .then(async (verification) => {
      // using util function to get state/county info
      let postOptions = await getCountyFromZip(postalCode);
      // using util function to get covid data from our dashboard API
      let countyInfo = await getCovidDataFromLocationInfo(postOptions);
      // using util function to get state data based on countyInfo previously retrieved from main DB call
      let covidData = await getStateInfoFromCountyInfo(postOptions.state, countyInfo);

      // generating and sending appropriate success message
      generateSMS("SUCCESS", phoneNumber, countyInfo, covidData);
    })
    .catch(err => {
      console.log(err)
      // if user can't be verified, define and send error messaging making it clear they have reached their limit for the day
      generateSMS("LIMIT_REACHED", phoneNumber);
    })
});



              // client.messages
              //   .create({
              //     body: countyMessageBody,
              //     from: "+18133950040",
              //     to: `+1${phoneNumber}`,
              //   })
              //   .then((message) => console.log(message))
              //   .catch((err) => console.log(err));
//             })
//             .catch((err) => {
//               console.log(err);
//             });
//         })
//         .catch((err) => {
//           console.log(err);
//           client.messages
//             .create({
//               body: `
// There was a problem on our end.  Please try again later!

// Check out our online dashboard: https://ncov19.us
//                   `,
//               from: "+18133950040",
//               to: `+1${phonenumber}`,
//             })
//             .then((message) => console.log("test", message))
//             .catch((err) => console.log(err));
//         });
//     .catch((err) => {
//       console.log(err);
//       res.status(500);
//       client.messages
//         .create({
//           body: `
// Please use a 5 digit zip code.

// Check out our online dashboard: https://ncov19.us
//               `,
//           from: "+18133950040",
//           to: `+1${phonenumber}`,
//         })
//         .then((message) => console.log("test", message))
//         .catch((err) => console.log(err));
//     })
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
// });

// endpoint for users who prompt app via SMS
// router.post("/", (req, res) => {
//   const postalCode = parseInt(req.body.Body);
//   let phonenumber = req.body.From;
//   console.log(req.body.From);
//   // console.log(phonenumber);
//   // console.log(typeof postalCode)
//   // console.log(postalCode.toString().length !== 5)
//   if (
//     postalCode.toString().length !== 5 ||
//     Number.isInteger(postalCode) === false
//   ) {
//     // console.log('check')
//     client.messages
//       .create({
//         body: "Please use a 5 digit zip code.",
//         from: "+18133950040",
//         to: `${req.body.From}`,
//       })
//       .then((message) => console.log("test", message))
//       .catch((err) => console.log(err));

//     return;
//   }

//   // client.verify
//   //   .services(process.env.VERIFY_SERVICE_SID)
//   //   .verifications(`${phonenumber}`)
//   //   .update({ status: "approved" })
//   //   // .create({rateLimits: {
//   //   //   end_user_phone_number: phonenumber
//   //   // }, to: `+1${phonenumber}`, channel: 'sms'})
//   //   .then((verification) => {
//   //     console.log(verification);

//   // instantiating county and state vars
//   let county, state;

//   axios
//     .get(
//       `https://api.opencagedata.com/geocode/v1/google-v3-json?q=countrycode=us|postcode=${postalCode}&key=${process.env.GEOCODING_KEY}&limit=1`
//     )
//     .then((res) => {
//       // console.log(res.status(201)))
//       const formatedAddressArray = res.data.results[0].formatted_address.split(
//         ","
//       );
//       console.log("FORMATED ADDRESS ARRAY", formatedAddressArray);
//       state = formatedAddressArray[1].split(" ")[1];
//       // console.log(state)
//       const countyArray = formatedAddressArray[0].split(" ");
//       countyArray.pop();
//       county = countyArray.join(" ");
//       // console.log(county);
//       // declaring options for POST request to main API
//       const postOptions = {
//         state: state,
//         county: county,
//       };

//       console.log("post options", postOptions);
//       let countyInfo, stateInfo;

//       axios
//         .post(`${process.env.DASHBOARD_API_URL}/county`, postOptions)
//         .then((res) => {
//           // console.log(res.data.message);
//           countyInfo = { ...res.data.message[0] };

//           // post request to build comparisons to state averages to send to user
//           axios
//             .post(`${process.env.DASHBOARD_API_URL}/stats`, {
//               state: state,
//             })
//             .then((res) => {
//               let numOfCounties = countiesPerState[state];

//               let newCaseIncrease =
//                 countyInfo.new /
//                 (res.data.message.todays_confirmed / numOfCounties);
//               let totalCaseIncrease =
//                 countyInfo.confirmed /
//                 (res.data.message.confirmed / numOfCounties);
//               let newDeathIncrease =
//                 countyInfo.new_death /
//                 (res.data.message.todays_deaths / numOfCounties);
//               let totalDeathIncrease =
//                 countyInfo.death / (res.data.message.deaths / numOfCounties);

//               if (isNaN(newCaseIncrease)) {
//                 newCaseIncrease = 0;
//               } else if (isNaN(totalCaseIncrease)) {
//                 totalCaseIncrease = 0;
//               } else if (isNaN(newDeathIncrease)) {
//                 newDeathIncrease = 0;
//               }

//               function upOrDown(num) {
//                 let arrow;

//                 if (num > 0) {
//                   arrow = "\u2B06";

//                   return arrow;
//                 } else if (num === 0) {
//                   arrow = "\u2B06";

//                   return arrow;
//                 } else {
//                   arrow = "\u2B07";

//                   return arrow;
//                 }
//               }
//               console.log("new case increase", newCaseIncrease);
//               const countyMessageBody = `
// ${countyInfo.county_name} County, ${countyInfo.state_name}

// Cases Today: ${countyInfo.new} (${upOrDown(
//                 newCaseIncrease
//               )} ${newCaseIncrease.toFixed(2)}% from state avg.)
// Total Cases: ${countyInfo.confirmed} (${upOrDown(
//                 totalCaseIncrease
//               )} ${totalCaseIncrease.toFixed(2)}% from state avg.)
// Deaths Today: ${countyInfo.new_death} (${upOrDown(
//                 newDeathIncrease
//               )} ${newDeathIncrease.toFixed(2)}% from state avg.)
// Total Deaths: ${countyInfo.death} (${upOrDown(
//                 totalDeathIncrease
//               )} ${totalDeathIncrease.toFixed(2)}% from state avg.)
// Fatality Rate: ${countyInfo.fatality_rate}
//                   `;
//               client.messages
//                 .create({
//                   body: countyMessageBody,
//                   from: "+18133950040",
//                   to: `${phonenumber}`,
//                 })
//                 .then((message) => console.log(message))
//                 .catch((err) => console.log(err));
//             })
//             .catch((err) => {
//               console.log(err);
//             });
//         })
//         .catch((err) => {
//           console.log(err);
//           client.messages
//             .create({
//               body: `
// There was a problem on our end.  Please try again later!

// Check out our online dashboard: https://ncov19.us
//                   `,
//               from: "+18133950040",
//               to: `${phonenumber}`,
//             })
//             .then((message) => console.log("test", message))
//             .catch((err) => console.log(err));
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500);
//       client.messages
//         .create({
//           body: `
// Please use a 5 digit zip code.

// Check out our online dashboard: https://ncov19.us
//               `,
//           from: "+18133950040",
//           to: `${phonenumber}`,
//         })
//         .then((message) => console.log("test", message))
//         .catch((err) => console.log(err));
//     });
// })
//     .catch((err) => {
//       client.messages
//         .create({
//           body:
//             `
// You have used all of your requests for today.

// Check out our online dashboard: https://ncov19.us
//             `,
//           from: "+18133950040",
//           to: `${phonenumber}`,
//         })
//         .then((message) => console.log(message))
//         .catch((err) => console.log(err));
//     });
// });

module.exports = router;
