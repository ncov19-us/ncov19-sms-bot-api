# ncov19-sms-bot-api

## Description
An SMS bot for easily getting the latest COVID-19 updates for your area with a provided zip code.

## Running the API locally
1. Clone or fork + clone this repository to the desired directory on your machine

2. `cd` into `ncov19-sms-bot-api`

3. Run the command:
`npm install`
to install required project dependencies

## Setting up local testing with your Twilio phone number
1. Download the twilio CLI package with the following command:
`npm install -g twilio-cli`

2. Run the command:
`twilio login`
and then provide your Twilio account's SID and Auth Token in the inputs

3. Initialize your local machines Twilio webhook with the following command, replacing the given information with your own Twilio number and endpoint
`twilio phone-numbers:update "+15017122661" --sms-url="http://localhost:1337/sms"`
