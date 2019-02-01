/**
 * Common functions
 */

var exports = {}
/* node modules */
var constants = exports.constants = require('./constants')

// https://github.com/mongodb/node-mongodb-native
var MongoClient = exports.MongoClient = require('mongodb').MongoClient

// https://github.com/lodash/lodash
var _ = exports._ = require('lodash')

var assert = exports.assert = require('chai').assert

// https://github.com/moment/moment
var moment = exports.moment = require('moment')

// https://github.com/jonschlinkert/data-store
var Store = exports.Store = require('data-store')
/* node modules end */


/* functions */
var get_fresh_store = exports.get_fresh_store = function() {
    return new Store('cache', {cwd: './'})
}

var get_cached_store = exports.get_cached_store = function() {
    return new Store({path: './cache.json'})
}

var get_rand_int = exports.get_rand_int = function(max) {
    return Math.floor(Math.random() * Math.floor(max))
}

var get_prune_people_arr = exports.get_prune_people_arr = async function(drop_date_arr, people_arr) {
    ret_arr = []
    const db = await MongoClient.connect(constants.LOCAL_URI, {
        useNewUrlParser: true
    })

    assert.exists(db, "db assert")
    const root_db = db.db(constants.DB_NAME)
    assert.exists(root_db, "db assert")

    const bestChanges = root_db.collection("bestChanges")
    assert.exists(bestChanges, "bestChanges assert")

    for(current in people_arr) {
        console.log(current)
        record_counter = 0
        current_student = current

        var bestChanges_query = {
            email: current_student
        }

        var bestChanges_project = {}
        bestChanges_project["timestamp"] = 1

        var bestChanges_sort = {
            "timestamp": 1 
        }

        current_arr = await (bestChanges.find(
            bestChanges_query
        ).project(
            bestChanges_project
        ).sort(
            bestChanges_sort
        ).toArray())
        for (current of current_arr) {
            if(new Date(drop_date_arr[current_student]["state"]["updated"]) < new Date(current["timestamp"])) {
                break
            }
            record_counter += 1
        }
        if(record_counter >= constants.RECORD_COUNTER_THRESHOLD) {
            ret_arr.push(people_arr[current_student])
        }
    }
    db.close()
    return _.keyBy(ret_arr, 'email')
}

var get_drop_date_arr = exports.get_drop_date_arr = async function() {
    const db = await MongoClient.connect(constants.LOCAL_URI, {
        useNewUrlParser: true
    })

    assert.exists(db, "db assert")
    const root_db = db.db(constants.DB_NAME)
    assert.exists(root_db, "db assert")

    const peopleChanges = root_db.collection('peopleChanges')
    assert.exists(peopleChanges, 'peopleChanges assert')

    var peopleChanges_query = {
        type: "left",
        semester: constants.CURRENT_SEMESTER
    }

    var peopleChanges_project = {
        email: 1,
        "state.updated": 1
    }

    var drop_date_arr = await (peopleChanges.find(peopleChanges_query).project(peopleChanges_project).toArray())

    db.close()
    return _.keyBy(drop_date_arr, 'email')
}

var get_active_people_arr = exports.get_active_people_arr = async function() {
    const db = await MongoClient.connect(constants.LOCAL_URI, {
        useNewUrlParser: true
    })

    assert.exists(db, "db assert")
    const root_db = db.db(constants.DB_NAME)
    assert.exists(root_db, "db assert")

    const people = root_db.collection('people')
    assert.exists(people, 'people assert')

    var people_query = {
        student: true,
        active: true,
        semester: constants.CURRENT_SEMESTER
    }

    var active_people_arr = await (people.find(people_query).toArray())
    active_people_count = active_people_arr.length
    assert.exists(active_people_count, 'active_people_count assert')

    db.close()
    return _.keyBy(active_people_arr, 'email')
}

var get_inactive_people_arr = exports.get_inactive_people_arr = async function() {
    const db = await MongoClient.connect(constants.LOCAL_URI, {
        useNewUrlParser: true
    })

    assert.exists(db, "db assert")
    const root_db = db.db(constants.DB_NAME)
    assert.exists(root_db, "db assert")

    const people = root_db.collection('people')
    assert.exists(people, 'people assert')

    var people_query = {
        student: true,
        active: false,
        semester: constants.CURRENT_SEMESTER
    }

    var people_arr = await (people.find(people_query).toArray())
    people_count = people_arr.length
    assert.exists(people_count, 'people_count assert')

    db.close()
    return _.keyBy(people_arr, 'email')
}

var get_intellij_arr = exports.get_intellij_arr = async function (people_arr, current_mp) {
    const db = await MongoClient.connect(constants.LOCAL_URI, {
        useNewUrlParser: true
    })

    assert.exists(db, "db assert")
    const root_db = db.db(constants.DB_NAME)
    assert.exists(root_db, "db assert")

    const intellij = root_db.collection('intellij')
    assert.exists(intellij, 'intellij assert')

    intellij_arr = {}
    for (current_email in people_arr) {
        var intellij_query = { 
            email: current_email,
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
        intellij_arr[current_email] = []


        if(current_arr.length < 1) {
            console.log(current_email + " has fewer than 1 entry")
            continue
        }
    }
    db.close()
    return intellij_arr
}

var get_progress_arr = exports.get_progress_arr = async function (people_arr) {
    const db = await MongoClient.connect(constants.LOCAL_URI, {
        useNewUrlParser: true
    })

    assert.exists(db, "db assert")
    const root_db = db.db(constants.DB_NAME)
    assert.exists(root_db, "db assert")

    const progress = root_db.collection('progress')
    assert.exists(progress, 'progress assert')

    progress_arr = {}
    for (current_email in people_arr) {
        var progress_query = { 
            'students.people': current_email
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
        progress_arr[current_email] = current_arr
    }

    db.close()
    return progress_arr
}
/* functions end */

module.exports = exports
