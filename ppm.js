/**
 * Outputting the time each student spends on MP in CS125
 */

// https://github.com/motdotla/dotenv
require('dotenv').config();

// https://github.com/mongodb/node-mongodb-native
var MongoClient = require('mongodb').MongoClient;

// constants
const DB_URI = process.env.DB_URI;

// INT MAIN
main()
// INT MAIN END

function replace_range_active_table(active_students_table, db) {
    console.log(active_students_table)
}

function fill_active_table(active_students_table, db) {
    console.log("Fill active table")
    const root_db = db.db('cs125')
    var intellij = root_db.collection('intellij');
    var intellij_count = 0;
    var current_intellij_count = 0;
    intellij.find().count(function (err, count) {
        intellij_count = count
        console.log(intellij_count)
        intellij.find().forEach(function(intellij_doc) {
            var current_email = intellij_doc.email
            if(current_email in active_students_table) {
                active_students_table[current_email].push(
                                         [intellij_doc.start, intellij_doc.end]);
            }
            current_intellij_count ++;
            if(current_intellij_count % 10000 == 0) {
                console.log(current_intellij_count)
            }
        }, function(err) {
            if(current_intellij_count >= intellij_count) {
                replace_range_active_table(active_students_table, db);
            } else if(err) throw err;
        });
    }); 
}

function main() {
    console.log("INT MAIN");
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

