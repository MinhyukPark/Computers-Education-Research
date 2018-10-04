/**
 * Finding any kind of significance between class attendance and 
 * other class metric
 * - currently using mainly spearman-rho correlation
 */

/*
 * [ LECTURE_RECORD_COUNT, CREDIT_COUNT, LATE + EARLY COUNT, QUIZ_COUNT, QUIZ_AVERAGE,
 *   QUIZ_TREND, HW_COUNT, HW_AVERAGE, HW_TREND, MP_COUNT, MP_AVERAGE, MP_TREND]
 * add intellij later
 *  LECTURE_RECORD_COUNT = how many entries were in
 *  CREDIT_COUNT = how many lecture entries were counted for credit
 *  LATE + EARLY COUNT = how many entries were either late or early or both
 *  QUIZ_COUNT = how many entries were in
 *  QUIZ_AVERAGE = the average of quiz grades
 *  QUIZ_TREND = compare individual first half average vs second half average
 *               and it's +1 if increased and -1 if decreased
 *  HW_COUNT = similar to quiz
 *  HW_AVERAGE = similar to quiz
 *  HW_TREND = similar to quiz
 *  MP_COUNT = similar to quiz
 *  MP_AVERAGE = similar to quiz
 *  MP_TREND = similar to quiz
 */

// https://github.com/motdotla/dotenv
require('dotenv').config();

// https://github.com/mongodb/node-mongodb-native
var MongoClient = require('mongodb').MongoClient;

// https://github.com/mljs/knn
const KNN = require('ml-knn');

// constants
const DB_URI = process.env.DB_URI;
const SPLIT = 0.8

var lecture_tables;
var quiz_tables;
var hw_tables;
var mp_tables;

/** main caller **/
ml_init()
/** main caller end **/

/* INT MAIN */
function main() {
    console.log("INT MAIN");

    const combined_table = [lecture_tables, quiz_tables, hw_tables, mp_tables]

    let data = {}


    let labels = {}

    for (var combined_table_index in combined_table) {
        var current_active_table = combined_table[combined_table_index][0]
        var current_passive_table = combined_table[combined_table_index][1]
        var active_emails = Object.keys(current_active_table)
        var passive_emails = Object.keys(current_passive_table)
        console.log(combined_table_index);

        switch(combined_table_index) {
            case '0':
                // LECTURE

                for (var current_email_index in active_emails) {
                    var lecture_record_count = 0
                    var credit_count = 0
                    var late_early_count = 0
                    var current_email = active_emails[current_email_index]
                    for (var record_index in current_active_table[current_email]) {
                        record = current_active_table[current_email][record_index]
                        lecture_record_count += 1
                        if(record[2]) {
                            credit_count += 1
                        }
                        if(record[0] && record[1]) {
                            late_early_count += 2
                        } else if (record[0] || record[1]) {
                            late_early_count += 1
                        }
                    }
                    data[current_email] = [lecture_record_count, credit_count, late_early_count]
                    labels[current_email] = 0
                }
                for (var current_email_index in passive_emails) {
                    var lecture_record_count = 0
                    var credit_count = 0
                    var late_early_count = 0
                    var current_email = passive_emails[current_email_index]
                    for (var record_index in current_passive_table[current_email]) {
                        record = current_passive_table[current_email][record_index]
                        lecture_record_count += 1
                        if(record[2]) {
                            credit_count += 1
                        }
                        if(record[0] && record[1]) {
                            late_early_count += 2
                        } else if (record[0] || record[1]) {
                            late_early_count += 1
                        }
                    }
                    data[current_email] = [lecture_record_count, credit_count, late_early_count]
                    labels[current_email] = 1 
                }
                break
            case '1':
                for (var current_email_index in active_emails) {
                    var quiz_count = 0
                    var quiz_average = 0
                    var quiz_trend = 0

                    var sum = 0
                    var first_sum = 0
                    var second_sum = 0 
                    var current_email = active_emails[current_email_index]
                    for (var record_index in current_active_table[current_email]) {
                        record = current_active_table[current_email]
                        quiz_count += 1
                        sum += record
                        if(quiz_count < current_active_table[current_email].length) {
                            first_sum += 1
                        } else {
                            second_sum += 1
                        }
                    } 
                    quiz_average = sum / quiz_count
                    if(first_sum > second_sum) {
                        quiz_trend = -1
                    } else {
                        quiz_trend = 1
                    }
                    if(isNaN(quiz_average)) {
                        quiz_average = 0
                    }
                    data[current_email].push(quiz_count, quiz_average, quiz_trend)
                }

                for (var current_email_index in passive_emails) {
                    var quiz_count = 0
                    var quiz_average = 0
                    var quiz_trend = 0

                    var sum = 0
                    var first_sum = 0
                    var second_sum = 0 
                    var current_email = passive_emails[current_email_index]
                    for (var record_index in current_passive_table[current_email]) {
                        record = current_passive_table[current_email]
                        quiz_count += 1
                        sum += record
                        if(quiz_count < current_passive_table[current_email].length) {
                            first_sum += 1
                        } else {
                            second_sum += 1
                        }
                    } 
                    quiz_average = sum / quiz_count
                    if(first_sum > second_sum) {
                        quiz_trend = -1
                    } else {
                        quiz_trend = 1
                    }
                    if(isNaN(quiz_average)) {
                        quiz_average = 0
                    }
                    if(isNaN(hw_average)) {
                        hw_average = 0
                    }
                    data[current_email].push(quiz_count, quiz_average, quiz_trend)
                }
                // QUIZ
                break
            case '2':
                for (var current_email_index in active_emails) {
                    var hw_count = 0
                    var hw_average = 0
                    var hw_trend = 0

                    var sum = 0
                    var first_sum = 0
                    var second_sum = 0 
                    var current_email = active_emails[current_email_index]
                    for (var record_index in current_active_table[current_email]) {
                        record = current_active_table[current_email]
                        hw_count += 1
                        sum += record
                        if(hw_count < current_active_table[current_email].length) {
                            first_sum += 1
                        } else {
                            second_sum += 1
                        }
                    } 
                    hw_average = sum / hw_count
                    if(first_sum > second_sum) {
                        hw_trend = -1
                    } else {
                        hw_trend = 1
                    }
                    if(isNaN(hw_average)) {
                        hw_average = 0
                    }
                    data[current_email].push(hw_count, hw_average, hw_trend)
                }

                for (var current_email_index in passive_emails) {
                    var hw_count = 0
                    var hw_average = 0
                    var hw_trend = 0

                    var sum = 0
                    var first_sum = 0
                    var second_sum = 0 
                    var current_email = passive_emails[current_email_index]
                    for (var record_index in current_passive_table[current_email]) {
                        record = current_passive_table[current_email]
                        hw_count += 1
                        sum += record
                        if(hw_count < current_passive_table[current_email].length) {
                            first_sum += 1
                        } else {
                            second_sum += 1
                        }
                    } 
                    hw_average = sum / hw_count
                    if(first_sum > second_sum) {
                        hw_trend = -1
                    } else {
                        hw_trend = 1
                    }
                    if(isNaN(hw_average)) {
                        hw_average = 0
                    }
                    data[current_email].push(hw_count, hw_average, hw_trend)
                }
                // HW
                break
            case '3':
                // MP
                break
            default:
                console.log("ERROR - REACHED DEFAULT IN SWITCH STATEMENT")
                break
        }
    }

    var training_data = []
    var training_labels = []
    var testing_data = []
    var testing_labels = []


    for (var email_index in Object.keys(data)) {
        if(email_index < Object.keys(data).length * SPLIT) { 
            current_email = Object.keys(data)[email_index]
            training_data.push(data[current_email])
            training_labels.push(labels[current_email])
        } else {
            current_email = Object.keys(data)[email_index]
            testing_data.push(data[current_email])
            testing_labels.push(labels[current_email])
        }
    }

    console.log(training_data)
    console.log(testing_data)
    var knn = new KNN(training_data, training_labels, {k : 5});
    var result = knn.predict(testing_data)
    var error_rate = -1;
    var error_count = 0
    var total_count = 0
    for (var error_index in result) {
        if(result[error_index] !== testing_labels[error_index]) {
            error_count += 1
        }
        total_count += 1
    }
    error_rate = error_count / total_count
    console.log(`Error rate was ${error_rate}`)
}
/* END INT MAIN */

function extractMPCallback(db, active_students_table, passive_students_table) {
    console.log("mp callback");
    N = 10
    // console.log('Actives');
    for (i = 0; i < N; i ++) {
        // console.log(i)
        // console.log(Object.keys(active_students_table)[i])
        // console.log(active_students_table[Object.keys(active_students_table)[i]]);
    } 
    // console.log('Passives');
    for (i = 0; i < N; i ++) {
        // console.log(i)
        // console.log(Object.keys(passive_students_table)[i])
        // console.log(passive_students_table[Object.keys(passive_students_table)[i]]);
    } 
    mp_tables = [active_students_table, passive_students_table]
    db.close()
    main();
}

function extractMP() {
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
                // console.log("total MP count is " + quizGradesCount);
                //console.log("total people count is " + peopleCount);
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
                            && quizGrades_doc.type == "homework") {
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
                                return extractMPCallback(db, active_students_table,
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


function extractHWCallback(db, active_students_table, passive_students_table) {
    console.log("hw callback start");
    N = 10
    // console.log('Actives');
    for (i = 0; i < N; i ++) {
        // console.log(i)
        // console.log(Object.keys(active_students_table)[i])
        //console.log(active_students_table[Object.keys(active_students_table)[i]]);
    } 
    //console.log('Passives');
    for (i = 0; i < N; i ++) {
        // console.log(i)
        // console.log(Object.keys(passive_students_table)[i])
        // console.log(passive_students_table[Object.keys(passive_students_table)[i]]);
    } 
    hw_tables = [active_students_table, passive_students_table]
    db.close()
    extractMP();
}

function extractHW() {
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
                // console.log("total HW count is " + quizGradesCount);
                // console.log("total people count is " + peopleCount);
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
                            && quizGrades_doc.type == "homework") {
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
                                return extractHWCallback(db, active_students_table,
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

function extractQuizCallback(db, active_students_table, passive_students_table) {
    console.log("quiz callback start");
    N = 10
    // console.log('Actives');
    for (i = 0; i < N; i ++) {
        // console.log(i)
        // console.log(Object.keys(active_students_table)[i])
        // console.log(active_students_table[Object.keys(active_students_table)[i]]);
    } 
    // console.log('Passives');
    for (i = 0; i < N; i ++) {
        // console.log(i)
        // console.log(Object.keys(passive_students_table)[i])
        // console.log(passive_students_table[Object.keys(passive_students_table)[i]]);
    } 
    quiz_tables = [active_students_table, passive_students_table]
    db.close()
    extractHW();
}

function extractQuiz() {
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
                // console.log("total quizGrades count is " + quizGradesCount);
                // console.log("total people count is " + peopleCount);
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
                                return extractQuizCallback(db, active_students_table,
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
    console.log("lecture callback start");
    N = 10
    // console.log('Actives');
    for (i = 0; i < N; i ++) {
        // console.log(i)
        // console.log(Object.keys(active_students_table)[i])
        // console.log(active_students_table[Object.keys(active_students_table)[i]]);
    } 
    // console.log('Passives');
    for (i = 0; i < N; i ++) {
        // console.log(i)
        // console.log(Object.keys(passive_students_table)[i])
        // console.log(passive_students_table[Object.keys(passive_students_table)[i]]);
    } 
    lecture_tables = [active_students_table, passive_students_table]
    db.close()
    extractQuiz();
}

function extractLecture() { 
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
                // console.log("total attendance count is " + attendanceCount);
                //console.log("total people count is " + peopleCount);
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
                                return extractLectureCallback(db, active_students_table, passive_students_table);
                            } else if(err) throw err;
                        });
                    } else if(err) throw err;
                });
            });
        });
    });
}

function ml_init() {
    console.log("ml_init start");
    extractLecture();
}
