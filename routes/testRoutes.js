// express router
const router = require("express").Router();

// custom middleware
const captcha = require("../middleware/validateCaptcha");

// A space to declare test routes for dev purposes
router.post("/", captcha.validateToken, (req, res) => {
  return res.status(200).json({ message: "its goooood" });
});

module.exports = router;
