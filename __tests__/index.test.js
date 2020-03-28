// library imports
const request = require("supertest"); // makes testing HTTP requests really easy

// file import
const index = require("../index.js");

describe("test route located in index.js", () => {
  test("returns message confirming API is up", done => {
    // request(index)
    //   .get("/")
    //   .expect(200, done);
    request(index)
      .get("/")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((err, res) => {
        if (err) done(err);
        done(err);
      })
  });
});
