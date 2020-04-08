// library imports

// ignoring if in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

function getCountyFromPostalCode(postalCode) {
  // initial declaration of county and state variables
  let state, county, locationInfo;

  axios.get(`https://api.opencagedata.com/geocode/v1/google-v3-json?q=countrycode=us|postcode=${postalCode}&key=${process.env.GEOCODING_KEY}&limit=1`)
    .then((res) => {
      // formatting address property for the main DB API call
      const formatedAddressArray = res.data.results[0].formatted_address.split(
        ","
      );

      state = formatedAddressArray[1].split(" ")[1];
      // console.log(state)
      const countyArray = formatedAddressArray[0].split(" ");
      countyArray.pop();

      // formatting county properly after splitting uneccessary text
      county = countyArray.join(" ");

      // capturing options for POST request to main API
      locationInfo = {
        state: state,
        county: county,
      };

    })
    .catch(err => { console.log(err) })

  // returning state/county info
  return postOptions;
}

module.exports = getCountyFromPostalCode;