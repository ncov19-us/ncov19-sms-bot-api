// library imports
const request = require("supertest"); // makes testing HTTP requests really easy

const smsRoutes = require("../routes/sms-routes");

describe("routes in sms-routes.js", () => {
  test("successfully looks up Beverly Hills info", done => {
    let mockZipCode = "90210";

    request(smsRoutes)
      .post("/")
      .send({ Body: mockZipCode })
      .expect(201)
      .then(res => {
        done(res);
      })
      .catch(err => {
        done(err);
      });
  });
});
