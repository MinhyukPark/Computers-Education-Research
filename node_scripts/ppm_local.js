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

// https://github.com/moment/moment
var moment = require('moment')

const CLEAN_RUN = false
// https://github.com/jonschlinkert/data-store
var Store = require('data-store')
if(CLEAN_RUN) {
    Store = new Store({path: './cache.json'})
} else {
    Store = new Store('cache', {cwd: './'})
}


// constants
const LOCAL_URI = process.env.LOCAL_URI
const MINUTE_IN_MILLISECONDS = 60000
const FIVE_MINUTE = MINUTE_IN_MILLISECONDS * 5
const CURRENT_MP = 'MP2'

// INT MAIN
main()
async function main() {
    // console.log("start")
    var people_arr = null
    var time_arr = null
    var points_arr = null
    var matched_arr = null

    if(CLEAN_RUN) {
        people_arr = await get_people_arr()
        time_arr = await get_time_arr(people_arr)
        points_arr = await get_points_arr(time_arr)
        matched_arr = get_matched_arr(time_arr, points_arr)
        
        Store.set('people_arr', people_arr)
        Store.set('time_arr', time_arr)
        Store.set('points_arr', points_arr)
        Store.set('matched_arr', matched_arr)
        Store.save() 
    } else {
        people_arr = Store.get('people_arr')
        time_arr = Store.get('time_arr')
        points_arr = Store.get('points_arr')
        matched_arr = Store.get('matched_arr')
    }
    /* override */
    // matched_arr = get_matched_arr(time_arr, points_arr)
    // Store.set('matched_arr', matched_arr)
    /* override end */
    assert.exists(people_arr, 'people_arr assert')
    assert.exists(time_arr, 'time_arr assert')
    assert.exists(points_arr, 'points_arr assert')
    assert.exists(matched_arr, 'matched_arr assert')

    // display_time_arr(time_arr)
    var query_email = ""
    // display_points_arr(points_arr, query_email)
    display_matched_arr(matched_arr, query_email)

    // console.log("people_arr count " + Object.keys(people_arr).length)
    // console.log("time_arr count " + Object.keys(time_arr).length)
    // console.log("points_arr count" + Object.keys(points_arr).length)
    // console.log("matched_arr count" + Object.keys(matched_arr).length)
    // console.log("done")
}
   
function display_matched_arr(matched_arr, query_email) {
    if(query_email == "") {
        for (current_email of Object.keys(matched_arr)) {
            if((matched_arr[current_email]).length < 1 || matched_arr[current_email]
                .reduce((a, b) => a + b, 0) == 0) {
                continue
            }
            console.log("new student")
            console.log(current_email)
            for (cur_point of matched_arr[current_email]) {
                console.log(cur_point)
            }
        } 
    } else {
        console.log("querying " + query_email)
        console.log(matched_arr[query_email])
        for (cur_point of matched_arr[query_email]) {
            console.log(cur_point)
        }
    }
}

function display_points_arr(points_arr, query_email) {
    if(query_email == "") {
        for (current_email of Object.keys(points_arr)) {
            console.log(current_email)
            for (cur_point in points_arr[current_email]) {
                console.log(points_arr[current_email][cur_point])
            }
        } 
    } else {
        for (cur_point in points_arr[query_email]) {
            console.log(points_arr[query_email][cur_point])
        }
    }
}

function display_time_arr(time_arr) {
    for (current_email of Object.keys(time_arr)) {
        console.log(current_email)
        for (cur_time in time_arr[current_email]) {
            console.log(moment(time_arr[current_email][cur_time][0]).format("YYYY-MM-DD hh:mm a") + " to " + moment(time_arr[current_email][cur_time][1]).format("YYYY-MM-DD hh:mm a"))
        }
    }
}
// INT MAIN END


function get_matched_arr(time_arr, points_arr) {
    var matched_arr = {}
    for (current_email of Object.keys(time_arr)) {
        // console.log("matching " + current_email)
        matched_arr[current_email] = []
        var prev_point = 0
        var cur_index = 0 
        for (cur_time of time_arr[current_email]) {
            // console.log("cur time is " + cur_time)
            cur_arr = points_arr[current_email][cur_index]
            var cur_timestamp = -1
            var cur_totalscore = -1
            if(cur_arr != null) { 
                cur_timestamp = cur_arr['timestamp']
                cur_totalscore = cur_arr['totalScore']
            }
            if(cur_time[0] <= cur_timestamp && cur_timestamp < cur_time[1]) {
                // console.log("score of " + cur_totalscore + " at time " + cur_timestamp)
                matched_arr[current_email].push(cur_totalscore)
                prev_point = cur_totalscore
                cur_index += 1
            } else {
                matched_arr[current_email].push(prev_point)
            }
        }
    }

    return matched_arr
}

async function get_points_arr(time_arr) {
    const db = await MongoClient.connect(LOCAL_URI, {
        useNewUrlParser: true
    })

    assert.exists(db, "db assert")
    const root_db = db.db('CS125_LOCAL')
    assert.exists(root_db, "db assert")

    const progress = root_db.collection('progress')
    assert.exists(progress, 'progress assert')

    points_arr = {}
    for (current_email of Object.keys(time_arr)) {
        var progress_query = { 
            'students.people': current_email,
            name: CURRENT_MP
        }

        var progress_project = {
            timestamp: 1,
            totalScore: 1
        }
        
        var progress_sort = {
            timestamp: 1
        }

        var current_arr = await (progress.find(
            progress_query
        ).project(
            progress_project
        ).sort(
            progress_sort
        ).toArray())
        assert.exists(current_arr, 'current_arr assert')
        points_arr[current_email] = current_arr
    }

    db.close()
    return points_arr
}

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
                      time_arr[current_email][time_index][1]) {
                    var previous_end =
                        time_arr[current_email][time_index][1]
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

