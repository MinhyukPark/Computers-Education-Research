/**
 * Outputting the time each student spends on MP in CS125
 */

// https://github.com/motdotla/dotenv
require('dotenv').config()

// https://github.com/mongodb/node-mongodb-native
var MongoClient = require('mongodb').MongoClient

// https://github.com/chaijs/chai
var assert = require('chai').assert

// https://github.com/lodash/lodash
var _ = require('lodash')

// constants
const LOCAL_URI = process.env.LOCAL_URI
const MINUTE_IN_MILLISECONDS = 60000
const CURRENT_MP = 'MP1'

// INT MAIN
main()
async function main() {
    console.log("start")
    var people_arr = await get_people_arr()
    console.log("people_arr count " + Object.keys(people_arr).length)
    var time_arr = await get_time_arr(people_arr)
    console.log("time_arr count " + Object.keys(time_arr).length)
    console.log("done")
}
// INT MAIN END

async function get_time_arr(people_arr) {
    const db = await MongoClient.connect(LOCAL_URI, {
        useNewUrlParser: true
    })

    assert.exists(db, "db assert")
    const root_db = db.db('CS125_LOCAL')
    assert.exists(root_db, "db assert")

    const intellij = root_db.collection('intellij')
    assert.exists(intellij, 'intellij assert')


    for (current_email in people_arr) {
        console.log("email: " + current_email)
        var intellij_query = { 
            email: current_email,
            MP: CURRENT_MP
        }

        var intellij_project = {
            start: 1,
            end: 1
        }
        
        var current_arr = await (intellij.find(
            intellij_query
        ).project(
            intellij_project
        ).toArray())
        assert.exists(current_arr, 'current_arr assert')
        console.log(current_arr)
    }

    db.close()
    return 
}
async function get_people_arr() {
    const db = await MongoClient.connect(LOCAL_URI, {
        useNewUrlParser: true
    })

    assert.exists(db, "db assert")
    const root_db = db.db('CS125_LOCAL')
    assert.exists(root_db, "db assert")

    const people = root_db.collection('people')
    assert.exists(people, 'people assert')

    var people_query = {
        student: true,
        active: true,
        semester: 'Fall2018'
    }

    var people_arr = await (people.find(people_query).toArray())
    people_count = people_arr.length
    assert.exists(people_count, 'people_count assert')

    db.close()
    return _.keyBy(people_arr, 'email')
}

