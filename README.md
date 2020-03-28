# ncov19-sms-bot-api

## Description
An SMS bot for easily getting the latest COVID-19 updates for your area with a provided zip code.


## Setting up local testing with your Twilio phone number
1. Download the twilio CLI package with the following command:
`npm install -g twilio-cli`

2. Run the command:
`twilio login`
and then provide your Twilio account's SID and Auth Token in the inputs

3. Initialize your local machines Twilio webhook with the following command, replacing the given information with your own Twilio number and endpoint
`twilio phone-numbers:update "+15017122661" --sms-url="http://localhost:1337/sms"`
