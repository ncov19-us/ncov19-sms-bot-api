// enabling easy use of environment variables through a .env file
require('dotenv').config(); // THIS MUST COME BEFORE TWILIO DECLARATION
// using env variables for this shorthand verification
// const client = require("twilio")(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN); may not be necessary for the time being
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// one liner to instantiate Express Router
const router = require('express').Router();




// ======== Routes =========

// -- POST Routes --
router.post('/', (req, res) => {
    // twilio webhooks expects their TwiMl SML format specified here: https://www.twilio.com/docs/glossary/what-is-twilio-markup-language-twiml
    // can also use raw XML in lieu of provided helper functions
    const twiml = new MessagingResponse();

    // setting inital message, request header contents
    twiml.message("The robots are coming!");
    res.writeHead(200, { 'Content-Type': "text/xml" });
    res.end(twiml.toString());

    // // method for sending messages
    // client.messages
    // .create({
    //     body: "This is the ship that made the Kessel Run in fourteen parsecs?",
    //     from: "+17735707220",
    //     to: "+17408416256"
    // })
    // .then(message => {
    //     console.log(message.sid);
    // })
    // .catch(err => {
    //     console.log(err);
    // });
})


module.exports = router;