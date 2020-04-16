// library imports
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: '../.env' });
}

// util function
const upOrDown = require('./upOrDown.js');

// function that generates appropriate message SMS message depending on the success/error case
function generateSMS(status, countyInfo) {
  // defining var to store appropriate message body
  let messageBody;

  // if all these cases are true, create success message body
  if (status === "SUCCESS" && typeof countyInfo !== "undefined") {

    // still need to find a better way to format template literals besides shift + tabbing them to beginning of line
    messageBody = `
${countyInfo.county_name} County, ${countyInfo.state_name} 🇺🇸

Today's Report: 
- Confirmed Cases: ${upOrDown(countyInfo.new)} ${countyInfo.new}
- Deaths: ${upOrDown(countyInfo.new_death)} ${countyInfo.new_death}

Total Report:
- Total Confirmed Cases: ${upOrDown(countyInfo.confirmed)} ${countyInfo.confirmed}
- Total Deaths: ${upOrDown(countyInfo.death)} ${countyInfo.death}


For more details, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
                `;

  } else if (status === "LIMIT_REACHED") {
    // if they've reached limit
    messageBody = `
You have used all of your requests for today.  Try again tomorrow!

In the meantime, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
                `
  } else if (status === "SERVER_ERROR") {
    // if there was a server error
    messageBody = `
There was a problem on our end.  Please try again later!

In the meantime, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
                `;
  } else if (status === "BAD_INPUT") {
    // if users input was not valid
    messageBody = `
I didn't understand that input.  Please use a valid US 5 digit zip code.

In the meantime, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
    `
  } else if (status === "NOT_USA") {
    messageBody = `
Sorry, our SMS service doesn't currently work in countries other than the USA.

In the meantime, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
    `
  }

  return messageBody;
}

module.exports = generateSMS;