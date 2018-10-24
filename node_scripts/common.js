/**
 * Common functions
 */

var exports = {}

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

var get_fresh_store = exports.get_fresh_store = function() {
    return new Store('cache', {cwd: './'})
}

var get_cached_store = exports.get_cached_store = function() {
    return new Store({path: './cache.json'})
}

var get_people_arr = exports.get_people_arr = async function() {
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

    var people_arr = await (people.find(people_query).toArray())
    people_count = people_arr.length
    assert.exists(people_count, 'people_count assert')

    db.close()
    return _.keyBy(people_arr, 'email')
}

module.exports = exports
