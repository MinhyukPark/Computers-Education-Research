/**
 * Outputting the time each student spends on MP in CS125
 */

// https://github.com/motdotla/dotenv
require('dotenv').config();

// https://github.com/mongodb/node-mongodb-native
var MongoClient = require('mongodb').MongoClient;

// constants
const DB_URI = process.env.DB_URI;
const MINUTE_IN_MILLISECONDS = 60000

// INT MAIN
main()
// INT MAIN END
//

function output_data(active_students_table, progress_interval_table, db) {
    // console.log("output_data")
    ppm_table = {}
    for (const current_email of Object.keys(progress_interval_table)) {
        ppm_table[current_email] = 0
        counter = 0
        for (interval_index in progress_interval_table[current_email]) {
            var prev_val = ppm_table[current_email]
            var cur_val = progress_interval_table[current_email][interval_index]
            ppm_table[current_email] = Math.max(cur_val - prev_val, 0)
            counter += 1
        }
        if(counter != 0) {
            ppm_table[current_email] /= counter
        }
    }
    //console.log(ppm_table)
    for (const current_email of Object.keys(ppm_table)) {
      console.log(current_email)
      console.log(ppm_table(current_email))
    }
    db.close()
}

function replace_range_active_table(active_students_table, db) {
    //console.log("replace range")
    minute_interval_table = {}
    for (const current_email of Object.keys(active_students_table)) {
        active_students_table[current_email].sort();
        current_timestamp_arr = active_students_table[current_email]
        last_end_stamp = -1
        minute_interval_table[current_email] = []
        for (time_stamp_index in current_timestamp_arr) {
            minute_start = current_timestamp_arr[time_stamp_index][0]
            minute_end = minute_start + MINUTE_IN_MILLISECONDS
            if(minute_end - minute_start < MINUTE_IN_MILLISECONDS) {
            } else {
                while(minute_end < current_timestamp_arr[time_stamp_index][1]) {
                    minute_interval_table[current_email].push([minute_start, minute_end])
                    minute_start = minute_end
                    minute_end += MINUTE_IN_MILLISECONDS
                }
            }
            minute_interval_table[current_email].push([minute_start, minute_end])
        } 
    }
    const root_db = db.db('cs125')
    //console.log("progress")
    var progress = root_db.collection('progress')
    var progress_count = 0
    var current_progress_count = 0
    //console.log(Object.keys(minute_interval_table).length)
    progress_interval_table = {}
    progress.find().count(function (err, count) {
        progress_count = count
        //console.log(progress_count)
        progress.find().forEach(function(progress_doc) {
            if(progress_doc.students.people in active_students_table) {
                for(interval_index in minute_interval_table[progress_doc.students.people]) {
                    current_start = minute_interval_table[progress_doc.students.people][interval_index][0]
                    current_end = minute_interval_table[progress_doc.students.people][interval_index][1]
                    if(progress_doc.timestamp > current_start && progress_doc.timestamp < current_end) {
                        if(!(progress_doc.students.people in progress_interval_table)) {
                            progress_interval_table[progress_doc.students.people] = []
                        }
                        progress_interval_table[progress_doc.students.people].push(progress_doc.totalScore)
                    }
                }
            }
            current_progress_count += 1
            if(current_progress_count % 10000 == 0) {
                //console.log(current_progress_count)
            }
        }, function(err) {
            if(current_progress_count >= progress_count) {
                output_data(active_students_table, progress_interval_table, db);    
            } else if(err) throw err;
        });
    });
}

function fill_active_table(active_students_table, db) {
    //console.log("Fill active table")
    const root_db = db.db('cs125')
    var intellij = root_db.collection('intellij');
    var intellij_count = 0;
    var current_intellij_count = 0;
    intellij.find().count(function (err, count) {
        intellij_count = count
        //console.log(intellij_count)
        intellij.find().forEach(function(intellij_doc) {
            var current_email = intellij_doc.email
            if(current_email in active_students_table) {
                active_students_table[current_email].push(
                                         [intellij_doc.start, intellij_doc.end]);
            }
            current_intellij_count ++;
            if(current_intellij_count % 10000 == 0) {
                //console.log(current_intellij_count)
            }
        }, function(err) {
            if(current_intellij_count >= intellij_count) {
                replace_range_active_table(active_students_table, db);
            } else if(err) throw err;
        });
    }); 
}

function main() {
    //console.log("INT MAIN");
    MongoClient.connect(DB_URI, {useNewUrlParser: true}, function(err, db) {
        if (err) throw err;
        var active_students_table = {}

        const root_db = db.db('cs125');
        // MARK: COLLECTIONS
        var people = root_db.collection('people');        
        var MPGrades = root_db.collection('MPGrades');
        // MARK: COUNT
        var peopleCount = 0;
        var MPGradesCount = 0;

        var currentPeopleCount = 0;
        var currentQuizGradesCount = 0;

        people.find().count(function (err, count) {
            peopleCount = count;
            //console.log(peopleCount)
            MPGrades.find().count(function (err, count) {
                MPGradesCount = count;
                // console.log("total MP count is " + MPGradesCount);
                //console.log("total people count is " + peopleCount);
                // MARK: QUERY
                people.find().forEach(function(people_doc) {
                    if(people_doc.semester == "Fall2018"
                    && people_doc.student) {
                        if(!people_doc.left) {
                            active_students_table[people_doc.email] = [];
                        }
                    }
                    currentPeopleCount++;
                }, function(err) {
                    if(currentPeopleCount === peopleCount) {
                        // CUSTOM START
                        fill_active_table(active_students_table, db);
                        // CUSTOM END
                    } else if(err) throw err;
                });
            });
        });
    });
}

