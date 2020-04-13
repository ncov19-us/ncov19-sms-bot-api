# [SMS App](https://sms.ncov19.us/) Back End

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) [![CodeFactor](https://www.codefactor.io/repository/github/ncov19-us/ncov19-sms-bot-api/badge)](https://www.codefactor.io/repository/github/ncov19-us/ncov19-sms-bot-api) 

## 1️⃣ Description 📄

An SMS bot for easily getting the latest COVID-19 updates for your area with a provided zip code.

## 2️⃣ Tech Stack 📚

 - React/Express/Node.js
 - Twilio
 - Supertest

## 3️⃣ Usage 💻

### Running the API locally

1. Clone or fork + clone this repository to the desired directory on your machine

2. `cd` into `ncov19-sms-bot-api`

3. Run the command:
   `npm install`
   to install required project dependencies

### Setting up local testing with your Twilio phone number

1. Download the twilio CLI package with the following command:
   `npm install -g twilio-cli`

2. Run the command:
   `twilio login`
   and then provide your Twilio account's SID and Auth Token in the inputs

3. Initialize your local machines Twilio webhook with the following command, replacing the given information with your own Twilio number and endpoint
   `twilio phone-numbers:update "<phone-number>" --sms-url="http://localhost:5000/sms"` (sends you a text with your personal phone number registered to twilio.)

### Testing
Unit/Integration tests are being done with Jest and Supertest respectively. To run tests, just make sure you have installed all project dependencies with `npm install` and then run `npm run test`.

## 4️⃣ Contributors

[<img src="https://github.com/favicon.ico" width="20"> ](https://github.com/ElijahMcKay)    [ <img src="https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca" width="20"> ](https://www.linkedin.com/in/elijahmckay/)    [<img src="https://twitter.com/favicon.ico" width="20">](https://twitter.com/ElijahMcKay10)    **[Elijah McKay](https://github.com/ElijahMcKay)**    |    Maintainer | Core Dev

[<img src="https://github.com/favicon.ico" width="20"> ](https://github.com/azrap)    [ <img src="https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca" width="20"> ](https://www.linkedin.com/in/azrapanjwani/)    [<img src="https://twitter.com/favicon.ico" width="20">](https://twitter.com/AzraP)    **[Azra Panjwani](https://github.com/azrap)**    |    Contributor

[<img src="https://github.com/favicon.ico" width="20"> ](https://github.com/ken1286)    [ <img src="https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca" width="20"> ](https://www.linkedin.com/in/kenridenour/)     **[Ken Ridenour](https://github.com/ken1286)**    |    Contributor

## 5️⃣ Contributing

Please note we have a [CODE OF CONDUCT](./CODE_OF_CONDUCT.md). Please follow it in all your interactions with the project.

### Issue/Bug Request

 **If you are having an issue with the existing project code, please submit a bug report under the following guidelines:**
 - Check first to see if your issue has already been reported.
 - Check to see if the issue has recently been fixed by attempting to reproduce the issue using the latest master branch in the repository.
 - Create a live example of the problem.
 - Submit a detailed bug report including your environment & browser, steps to reproduce the issue, actual and expected outcomes,  where you believe the issue is originating from, and any potential solutions you have considered.

### Feature Requests

We would love to hear from you about new features which would improve this app and further the aims of our project. Please provide as much detail and information as possible to show us why you think your new feature should be implemented.

### Pull Requests

If you have developed a patch, bug fix, or new feature that would improve this app, please submit a pull request. It is best to communicate your ideas with the developers first before investing a great deal of time into a pull request to ensure that it will mesh smoothly with the project.

Remember that this project is licensed under the MIT license, and by submitting a pull request, you agree that your work will be, too.

#### Pull Request Guidelines

- Ensure any install or build dependencies are removed before the end of the layer when doing a build.
- Update the README.md with details of changes to the interface, including new plist variables, exposed ports, useful file locations and container parameters.
- Ensure that your code conforms to our existing code conventions and test coverage.
- Include the relevant issue number, if applicable.
- You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

### Attribution

These contribution guidelines have been adapted from [this good-Contributing.md-template](https://gist.github.com/PurpleBooth/b24679402957c63ec426).
