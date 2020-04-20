// library imports
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

// authenticated twilio import
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

// util function
const upOrDown = require("./upOrDown.js");
const edgeCases = require("./edgeCases.js");

// function that generates appropriate message SMS message depending on the success/error case
function generateSMS(status, phoneNumber, postalCode, userObj, countyInfo) {
  // defining var to store appropriate message body
  let messageBody;

  // if all these cases are true, create success message body
  if (status === "SUCCESS" && typeof countyInfo !== "undefined") {
    // still need to find a better way to format template literals besides shift + tabbing them to beginning of line
    messageBody = `
${countyInfo.county_name} ${
      edgeCases[countyInfo.county_name]
        ? `${edgeCases[countyInfo.county_name].trim()}`
        : "County"
    }, ${countyInfo.state_name} 🇺🇸

Today's Report: 
- Confirmed Cases: ${upOrDown(countyInfo.new)} ${countyInfo.new}
- Deaths: ${upOrDown(countyInfo.new_death)} ${countyInfo.new_death}

Total Report:
- Total Confirmed Cases: ${upOrDown(countyInfo.confirmed)} ${
      countyInfo.confirmed
    }
- Total Deaths: ${upOrDown(countyInfo.death)} ${countyInfo.death}

Remaining Messages: ${userObj.msgLimit}

For more details, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
                `;
  } else if (status === "LIMIT_REACHED") {
    // if they've reached limit
    messageBody = `
You have used all of your messages for today.  Try again tomorrow!

In the meantime, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
                `;
  } else if (status === "SERVER_ERROR") {
    // if there was a server error
    messageBody = `
There was a problem on our end.  Please try again later!

Remaining Messages: ${userObj.msgLimit}

In the meantime, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
                `;
  } else if (status === "BAD_INPUT") {
    // if users input was not valid
    messageBody = `
I didn't understand that input.  Please use a valid US 5 digit zip code.

Remaining Messages: ${userObj.msgLimit}

In the meantime, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
    `;
  } else if (status === "NOT_USA") {
    messageBody = `
Sorry, our SMS service doesn't currently work in countries other than the USA.

Remaining Messages: ${userObj.msgLimit}

In the meantime, visit COVID-19 Tracker 🌍: 
- https://ncov19.us
    `;
  } else if (status === "TEST") {
    messageBody = "test";
  }

  // sending message to user and status code to twilio
  client.messages
    .create({
      from: process.env.TWILIO_NUMBER,
      body: messageBody,
      to: phoneNumber,
    })
    .then((message) => {
      if(countyInfo.county_name) {
        let info = {
          status: status,
          ourNum: message.from,
          userNum: message.to,
          postalCode: postalCode,
          created: message.dateCreated,
          location: {
            county: countyInfo.county_name,
            state: countyInfo.state_name
          },
          uri: `https://api.twilio.com${message.uri}`,
        };
  
        console.log('Success: ', info);
      } else {
        let info = {
          status: status,
          ourNum: process.env.TWILIO_NUMBER,
          userNum: phoneNumber,
          userPostalCode: postalCode
        };
        console.log('No County Info: ', info)
      }
    })
    .catch((err) => {
      let errInfo = {
        status: status,
        ourNum: process.env.TWILIO_NUMBER,
        userNum: phoneNumber,
        userPostalCode: postalCode
      };
      console.log('Failure: ', errInfo);
    });
}

module.exports = generateSMS;
