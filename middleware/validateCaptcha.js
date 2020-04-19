const axios = require("axios");

module.exports = { validateToken };

function validateToken(req, res, next) {
  // check the req is coming from the browser
  if (
    req.get("origin") &&
    req.get("origin").includes(process.env.WEB_REQUEST_ORIGIN)
  ) {
    // grab the captcha token off the request
    const { captcha } = req.body;

    if (captcha === "" || captcha === undefined || captcha === null) {
      return res
        .status(422)
        .json({
          success: false,
          msg: "Please be sure to complete the captcha",
        });
    }

    const secrect = process.env.CAPTCHA_VERIFICATION;
    const verify_url = `https://www.google.com/recaptcha/api/siteverify?secret=${secrect}&response=${captcha}`;

    axios
      .post(verify_url)
      .then((response) => {
        if (response.data.success === true) {
          next();
        } else {
          return res
            .status(200)
            .json({ success: false, msg: "captcha verified, bot" });
        }
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .json({ success: false, msg: "internal server error" });
      });
  } else {
    next();
  }
}
