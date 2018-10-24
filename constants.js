// https://github.com/motdotla/dotenv
var dotenv = require('dotenv').config()

module.exports = {
    CURRENT_SEMESTER: process.env.CURRENT_SEMESTER,
    LOCAL_URI: process.env.LOCAL_URI,
    DB_NAME: process.env.DB_NAME
}
