// library imports
const app = require("./app.js");
// enabling easy use of environment variables through a .env file
require("dotenv").config(); // THIS MUST COME BEFORE TWILIO DECLARATION

// test endpoint to determine status of API
app.get("/", (req, res) => {
  res.status(200).json({ message: "API working!" });
});

// app listens on the decided port of the team/environment
app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}...`);
});
