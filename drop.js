/**
 * Finding any kind of significance between class attendance and 
 * other class metric
 * - currently using mainly spearman-rho correlation
 */

// https://github.com/motdotla/dotenv
require('dotenv').config();

// https://github.com/mongodb/node-mongodb-native
var MongoClient = require('mongodb').MongoClient;

// constants
const DB_URI = process.env.DB_URI;

// INT MAIT

extractFeature()

// END INT MAIT
function extractFeatureCallback(db, active_students_table, passive_students_table) {
    console.log(active_students_table);
    console.log(passive_students_table);
    db.close()
}

async function extractFeature() { 
    MongoClient.connect(DB_URI, {useNewUrlParser: true}, function(err, db) {
        if (err) throw err;
        // connection is made
        var cached_table = {};
        var active_students_table = {}; 
        var passive_students_table = {}; 
   

        const root_db = db.db('cs125');
        // MARK: COLLECTIONS
        var lectureAttendance = root_db.collection('lectureAttendance');
        var people = root_db.collection('people');        
        // MARK: COUNT
        var attendanceCount = 0;
        var peopleCount = 0;
        lectureAttendance.find().count(function (err, count) {
            attendanceCount = count;
            people.find().count(function (err, count) {
                peopleCount = count;
                console.log("total attendance count is " + attendanceCount);
                console.log("total people count is " + peopleCount);
                // MARK: QUERY
                var currentPeopleCount = 0;
                people.find().forEach(function(people_doc) {
                    if(people_doc.semester == "Fall2018"
                    && people_doc.student) {
                        if(!(people_doc.email in cached_table)) {
                            cached_table[people_doc.email] = 0;
                        }
                        if(people_doc.left) {
                            passive_students_table[people_doc.email] = [];
                        } else {
                            active_students_table[people_doc.email] = [];
                        }
                    }
                    currentPeopleCount++;
                }, function(err) {
                    if(currentPeopleCount === peopleCount) {
                        var currentAttendanceCount = 0;
                        lectureAttendance.find().forEach(function(attendance_doc) {
                            if (attendance_doc.email in cached_table) {
                                if(attendance_doc.email in active_students_table) {
                                    active_students_table[attendance_doc.email].push([
                                    attendance_doc.cameLate,
                                    attendance_doc.leftEarly,
                                    attendance_doc.credit]);
                                } else {
                                    passive_students_table[attendance_doc.email].push([
                                    attendance_doc.cameLate,
                                    attendance_doc.leftEarly,
                                    attendance_doc.credit]);
                                }
                            }
                            currentAttendanceCount++;
                        }, function(err) {
                            if(currentAttendanceCount === attendanceCount) {
                                extractFeatureCallback(db, active_students_table,
                                                       passive_students_table);
                            } else if(err) throw err;
                        });
                    } else if(err) throw err;
                });
            });
        });
    });
}


