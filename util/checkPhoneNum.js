// library imports
// enabling easy use of environment variables through a .env file
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: '../.env' });
}


const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

async function checkPhoneNum(phoneNum) {

    value = myCache.get(phoneNum);
    console.log(value);
    if (value == undefined) {
        const obj = { msgLimit: process.env.DAILY_MESSAGE_LIMIT, msgLeft: true };
        console.log(obj);
        const success = myCache.mset([
            { key: phoneNum, val: obj },
        ])

    }
    else {
        // check if message is left 
        // if not return you used up your daily message limit. and message left is set to false
        // if left, than subtract one from the daily message limit
    }

}


module.exports = checkPhoneNum;