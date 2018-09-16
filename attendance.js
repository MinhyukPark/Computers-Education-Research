/**
 * Finding any kind of significance between class attendance and 
 * other class metric
 */

// https://github.com/motdotla/dotenv
require('dotenv').config();

// https://github.com/drodrigues/node-correlation
var Correlation = require('node-correlation');

// https://github.com/ericrange/spearman-rho
var SpearmanRHO = require('spearman-rho');

// https://github.com/mongodb/node-mongodb-native
var MongoClient = require('mongodb').MongoClient;

// https://github.com/simple-statistics/simple-statistics
var ss = require('simple-statistics')

// constants
const DB_URI = process.env.DB_URI;
const minT = 0.0;
const maxT = 1.0;
const att = "Attendance";
const gra = "QuizGrades";

function beginner_callback(db, email_arr, table) {
    db.close();
    var beginnerTable = {}
    // console.log('beginner results');
    for (var email in email_arr) {
        if(email_arr[email] in table) {
            beginnerTable[email_arr[email]] = table[email_arr[email]];
        }
    }

    var i;
    for (i = minT; i <= maxT; i += 0.01) {
        applyThreshold(beginnerTable, i);
    } 
    // process.exit(0);
}


function parseBeginnerResults(table) {
    MongoClient.connect(DB_URI, {useNewUrlParser: true}, function(err, db) {
        if (err) throw err;
        // connection is made
        var email_arr = []; 
        const root_db = db.db('Spring2018');
        var people = root_db.collection('people');
        var beginnerCount = 0;

        people.find({'survey.ap.summary':{$eq: 0}}).count(function (err, count) {
            beginnerCount = count;
            return;
        });

        var currentBeginnerCount = 0;
    
        people.find({'survey.ap.summary':{$eq: 0}}).forEach(function(people_doc) {
            email_arr.push(people_doc.email)
            currentBeginnerCount++;
        }, function(err) {
            if(currentBeginnerCount === beginnerCount) {
                beginner_callback(db, email_arr, table);
            } else if(err) throw err;
        });
        
    });
}

function applyThreshold(table, T) {
    student_attendance = []
    student_grades = []
    student_emails = []
    var temp_cur = 0;
    var count = 0;
    for (var student in table) {
        temp_cur = 0;
        count = 0;
        student_emails.push(student);
        var totalAttendance = 0;
        for (var attendance in table[student][att]) {
            if(table[student][att][attendance] >= T) {
                totalAttendance ++;
            }
            count ++; 
        } 
        if(isNaN(totalAttendance * 1.0 / count)) {
            student_attendance.push(0);
        } else {
            student_attendance.push(Math.floor(100 * (totalAttendance * 1.0  / count)));
            temp_cur = Math.floor(100 * (totalAttendance * 1.0 / count));
        }
        
    }

    for (var email in student_emails) {
        count = 0; 
        var totalGrade = 0;
        for (var grade in table[student_emails[email]][gra]) {
            totalGrade += parseInt(table[student_emails[email]][gra][grade]);
            count += 100;
        } 
        if(isNaN(totalGrade * 1.0 / count)) {
            student_grades.push(0);
        } else {
             
            //console.log(totalGrade * 1.0 / count);
            student_grades.push(Math.floor(100 * (totalGrade * 1.0  / count)));
            // temp_cur = Math.floor(100 * (totalGrade * 1.0 / count));
        }
    }
    //console.log(student_attendance);
    // console.log(student_grades);
    //
    getCorrelation(student_attendance, student_grades, T);
    // return getSignificance(student_attendance, student_grades);
}

function getSignificance(student_attendance, student_grades) {
    console.log(student_attendance);
    console.log(student_grades); 
}

function getCorrelationCallback(value, T) {
    console.log(T);
    console.log(value);
}


function getCorrelation(student_attendance, student_grades, T) {
    // return Correlation.calc(student_attendance, student_grades);
    var spearmanRHO = new SpearmanRHO(student_attendance, student_grades);
    spearmanRHO.calc().then(function(value) {
        getCorrelationCallback(value, T);
    });
    //.then(function(value) {
    //    return value;
    //});
}

function parseResults(table) {
    var i;
    for (i = minT; i <= maxT; i += 0.01) {
        // MARK: PARSE RESULTS ALL
        //console.log(i);
        //console.log(applyThreshold(table, i));
    } 
    parseBeginnerResults(table);
}


function callback(db, table) {
    db.close();
    // console.log(table);
    parseResults(table);
}



MongoClient.connect(DB_URI, {useNewUrlParser: true}, function(err, db) {
    if (err) throw err;
    // connection is made
    var table = {}; 
    const root_db = db.db('Spring2018');
    var attendanceCount = 0;
    var quizGradeCount = 0;

    var lectureAttendance = root_db.collection('lectureAttendance');
    var quizGrades = root_db.collection('quizGrades');

    lectureAttendance.find().count(function (err, count) {
        attendanceCount = count;
        return;
    });
    // MARK: query
    quizGrades.find({name: {$in: ['Q9', 'Q10', 'Q11', 'Q12']}}).count(function (err, count) {
        quizGradeCount = count;
        return;
    });

    var currentAttendanceCount = 0;
    var currentGradeCount = 0;


    lectureAttendance.find().forEach(function(attendance_doc) {
        if (!(attendance_doc.email in table)) {
            table[attendance_doc.email] = {}; 
            table[attendance_doc.email][att] = [];
            table[attendance_doc.email][gra] = [0, 0, 0, 0];
        }
        table[attendance_doc.email][att].push(attendance_doc.percentage);
        currentAttendanceCount++;
    }, function(err) {
        if(currentGradeCount + currentAttendanceCount === quizGradeCount + attendanceCount) {
            callback(db, table);
        } else if(err) throw err;
    });
    
    // MARK: query 
    quizGrades.find({name: {$in: ['Q9', 'Q10', 'Q11', 'Q12']}}).forEach(function(grade_doc) {
        if (!(grade_doc.email in table)) {
            table[grade_doc.email] = {}; 
            table[grade_doc.email][att] = [];
            table[grade_doc.email][gra] = [0, 0, 0, 0];
        }
        var gra_index = -1;
        if(grade_doc.name === 'Q9') {
            gra_index = 0; 
        } else if (grade_doc.name === 'Q10') {
            gra_index = 1; 
        } else if (grade_doc.name === 'Q11') { 
            gra_index = 2; 
        } else if (grade_doc.name === 'Q12') {
            gra_index = 3; 
        } else if (grade_doc.name === 'E0') {
            table[grade_doc.email][gra] = [grade_doc.score];
        }
        
        if(gra_index != -1 && table[grade_doc.email][gra][gra_index] < grade_doc.score) {
            table[grade_doc.email][gra].push(grade_doc.score);
        }
        currentGradeCount++;
    }, function(err) {
        if(currentGradeCount + currentAttendanceCount === quizGradeCount + attendanceCount) {
            callback(db, table);
        } else if(err) throw err;
        //console.log(table);
    });
});
    // close connection
//});



