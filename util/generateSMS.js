// library imports
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: '../.env' });
}
// authenticated twilio import
const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

// util function
const upOrDown = require('./upOrDown.js');

// function that generates appropriate message SMS message depending on the success/error case
function generateSMS(status, toPhoneNumber, countyInfo, covidData) {
  // defining var to store appropriate message body
  let messageBody;

  // if all these cases are true, create success message body
  if (status === "SUCCESS" && typeof countyInfo !== "undefined" && covidData !== "undefined") {

    // still need to find a better way to format template literals besides shift + tabbing them to beginning of line
    messageBody =`
${countyInfo.county_name} County, ${countyInfo.state_name}

Cases Today: ${countyInfo.new} (${upOrDown(covidData.newCaseIncrease)} ${covidData.newCaseIncrease.toFixed(2)}% from state avg.)
Total Cases: ${countyInfo.confirmed} (${upOrDown(covidData.totalCaseIncrease)} ${covidData.totalCaseIncrease.toFixed(2)}% from state avg.)
Deaths Today: ${countyInfo.new_death} (${upOrDown(covidData.newDeathIncrease)} ${covidData.newDeathIncrease.toFixed(2)}% from state avg.)
Total Deaths: ${countyInfo.death} (${upOrDown(covidData.totalDeathIncrease)} ${covidData.totalDeathIncrease.toFixed(2)}% from state avg.)
Fatality Rate: ${countyInfo.fatality_rate}

For more info, check out our online dashboard: https://ncov19.us
                `;

  } else if (status === "LIMIT_REACHED") {
    // if they've reached limit
    messageBody =`
You have used all of your requests for today.

Check out our online dashboard: https://ncov19.us
                `
  } else if (status === "SERVER_ERROR") {
    // if there was a server error
    messageBody =`
There was a problem on our end.  Please try again later!

In the meantime, check out our online dashboard: https://ncov19.us
                `;
  } else if (status === "BAD_INPUT") {
    // if users input was not valid
    messageBody =`
I didn't understand that input.  Please use a 5 digit zip code.

Check out our online dashboard: https://ncov19.us    
    `
  } else if (status === "NOT_USA") {
    messageBody =`
Sorry, our SMS service doesn't currently work in countries other than the USA.

In the meantime, check out our online dashboard: https://ncov19.us
    `   
  }

  // sending appropriate message body
  client.messages
  .create({
    body: messageBody,
    from: process.env.TWILIO_NUMBER,
    to: toPhoneNumber,
  })
  .then((message) => console.log(message))
  .catch((err) => console.log(err));
}

module.exports = generateSMS;