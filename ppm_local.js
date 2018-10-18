/**
 * Outputting the time each student spends on MP in CS125
 */

// https://github.com/motdotla/dotenv
require('dotenv').config()

// https://github.com/mongodb/node-mongodb-native
var MongoClient = require('mongodb').MongoClient

// https://github.com/chaijs/chai
var chai = require('chai')

// constants
const LOCAL_URI = process.env.LOCAL_URI
const MINUTE_IN_MILLISECONDS = 60000
const CURRENT_MP = 'MP2'

// INT MAIN
await main()
console.log("done")
// INT MAIN END


async function main() {
    
}

