/**
 * Common constants - to be called through the common module
 */

// https://github.com/motdotla/dotenv
var dotenv = require('dotenv').config()

module.exports = {
    CURRENT_SEMESTER: process.env.CURRENT_SEMESTER,
    LOCAL_URI: process.env.LOCAL_URI,
    DB_NAME: process.env.DB_NAME,
    TWO_DAYS: 1000 * 60 * 60 * 24 * 2,
    RECORD_COUNTER_THRESHOLD: 3
}
