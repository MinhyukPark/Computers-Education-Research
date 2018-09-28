/**
 * Finding any kind of significance between class attendance and 
 * other class metric
 * - currently using mainly spearman-rho correlation
 */

/*
 * [ RECORD_COUNT, CREDIT_COUNT, LATE + EARLY COUNT, QUIZ_AVERAGE, QUIZ_TREND
 *   MP_AVERAGE, MP_TREND] add intellij later
 */

// https://github.com/motdotla/dotenv
require('dotenv').config();

// https://github.com/mongodb/node-mongodb-native
var MongoClient = require('mongodb').MongoClient;

// constants
const DB_URI = process.env.DB_URI;

/* INT MAIN */

// extractLecture()
extractQuiz()
/* END INT MAIN */

function extractQuizCallback(db, active_students_table, passive_students_table) {
    N = 10
    console.log('Actives');
    for (i = 0; i < N; i ++) {
        console.log(i)
        console.log(active_students_table[Object.keys(active_students_table)[i]]);
    } 
    console.log('Passives');
    for (i = 0; i < N; i ++) {
        console.log(i)
        console.log(passive_students_table[Object.keys(passive_students_table)[i]]);
    } 
    db.close()
}

async function extractQuiz() {
    MongoClient.connect(DB_URI, {useNewUrlParser: true}, function(err, db) {
        if (err) throw err;
        var cached_table = {}
        var active_students_table = {}
        var passive_students_table = {}

        const root_db = db.db('cs125');
        // MARK: COLLECTIONS
        var people = root_db.collection('people');        
        var quizGrades = root_db.collection('quizGrades');
        // MARK: COUNT
        var peopleCount = 0;
        var quizGradesCount = 0;

        var currentPeopleCount = 0;
        var currentQuizGradesCount = 0;

        people.find().count(function (err, count) {
            peopleCount = count;
            quizGrades.find().count(function (err, count) {
                quizGradesCount = count;
                console.log("total quizGrades count is " + quizGradesCount);
                console.log("total people count is " + peopleCount);
                // MARK: QUERY
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
                        // CUSTOM START
                        quizGrades.find().forEach(function(quizGrades_doc) {
                            if(quizGrades_doc.email in cached_table
                            && quizGrades_doc.type == "quiz") {
                                if(quizGrades_doc.email in active_students_table) {
                                    active_students_table[quizGrades_doc.email]
                                                    .push(quizGrades_doc.score) 
                                } else {
                                    passive_students_table[quizGrades_doc.email]
                                                     .push(quizGrades_doc.score) 
                                }
                            }
                            currentQuizGradesCount++;
                        }, function(err) {
                            if(currentQuizGradesCount === quizGradesCount) {
                                extractQuizCallback(db, active_students_table,
                                                    passive_students_table) 
                            } else if(err) throw err;
                        });  
                        // CUSTOM END
                    } else if(err) throw err;
                });
            });
        });
    });
}


function extractLectureCallback(db, active_students_table, passive_students_table) {
    N = 10
    console.log('Actives');
    for (i = 0; i < N; i ++) {
        console.log(i)
        console.log(active_students_table[Object.keys(active_students_table)[i]]);
    } 
    console.log('Passives');
    for (i = 0; i < N; i ++) {
        console.log(i)
        console.log(passive_students_table[Object.keys(passive_students_table)[i]]);
    } 
    db.close()
}

async function extractLecture() { 
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
                                extractLectureCallback(db, active_students_table,
                                                       passive_students_table);
                            } else if(err) throw err;
                        });
                    } else if(err) throw err;
                });
            });
        });
    });
}


