// library imports
const server = require("./app.js");
// enabling easy use of environment variables through a .env file
require('dotenv').config(); // THIS MUST COME BEFORE TWILIO DECLARATION

// server listens on the decided port of the team/environment
server.listen(process.env.PORT, () => { console.log(`Listening on port ${process.env.PORT}...`) })
