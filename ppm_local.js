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
const FIVE_MINUTE = MINUTE_IN_MILLISECONDS * 5
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

    time_arr = {}
    for (current_email in people_arr) {
        var intellij_query = { 
            email: current_email,
            MP: CURRENT_MP
        }

        var intellij_project = {
            start: 1,
            end: 1
        }
        
        var intellij_sort = {
            start: 1
        }

        var current_arr = await (intellij.find(
            intellij_query
        ).project(
            intellij_project
        ).sort(
            intellij_sort
        ).toArray())
        assert.exists(current_arr, 'current_arr assert')
        time_arr[current_email] = []

        if(current_arr.length < 1) {
            console.log(current_email + " has fewer than 1 entry")
            continue
        }

        var time_index = 0
        time_arr[current_email].push([0, 0])
        for (interval_index in current_arr) {
            current_interval = current_arr[interval_index]
            // interval already allocated
            if(current_interval.start >=
                time_arr[current_email][time_index][0] &&
               current_interval.end <=
                time_arr[current_email][time_index][1]) {
                continue
            // interval is on the border
            } else if(
      current_interval.start <= time_arr[current_email][time_index][1] &&
         current_interval.end > time_arr[current_email][time_index][1]) {

                while(current_interval.end >
                      time_arr[current_email][time_index][1]) {
                    var previous_end =
                        time_arr[current_email][time_index][1]
                    time_arr[current_email].push(
                          [previous_end, previous_end + FIVE_MINUTE])
                    time_index += 1
                }
            } else if(
      current_interval.start > time_arr[current_email][time_index][1] &&
         current_interval.end > time_arr[current_email][time_index][1]) {
                time_arr[current_email].push(
           [current_interval.start,current_interval.start + FIVE_MINUTE])
                time_index += 1
                while(current_interval.end >
                      time_arr[current_email][time_index - 1][1]) {
                    var previous_end =
                        time_arr[current_email][time_index - 1][1]
                    time_arr[current_email].push(
                          [previous_end, previous_end + FIVE_MINUTE])
                    time_index += 1
                }
                
            }

        }
    }

    db.close()
    return time_arr
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

