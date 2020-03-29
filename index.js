// library imports
const app = require("./app.js");
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

const PORT = process.env.PORT || 5000;

// test endpoint to determine status of API
app.get("/", (req, res) => {
  res.status(200).json({ message: "API working!" });
});

// app listens on the decided port of the team/environment
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

module.exports = app;
