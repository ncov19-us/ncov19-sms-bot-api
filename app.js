// library imports
const express = require("express");
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}
const cors = require("cors"); // easily manage cors access
const helmet = require("helmet"); // hide server technology being used

// instantiating server
const app = express();

// middleware
app.use(express.urlencoded({ extended: true })); // learn more about this middleware here: https://expressjs.com/en/5x/api.html#express.urlencoded
app.use(helmet());
app.use(cors({ origin: "*" }));

// route imports
const smsRoutes = require("./routes/sms-routes.js");

// creating routes
app.use("/sms", smsRoutes); // sms bot routes

module.exports = app;
