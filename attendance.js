/**
 * Finding correlation between class attendance and quiz grades
 */

var MongoClient = require('mongodb').MongoClient;
var Correlation = require('node-correlation');

var url = ***REMOVED***

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
        console.log(i);
        console.log(getCorrelation(beginnerTable, i));
    } 
    process.exit(0);
}


function parseBeginnerResults(table) {
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
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

function getCorrelation(table, T) {
    student_attendance = []
    student_grades = []
    var temp_cur = 0;
    var count = 0;
    for (var student in table) {
        temp_cur = 0;
        count = 0;
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
        
        count = 0; 
        var totalGrade = 0;
        for (var grade in table[student][gra]) {
            totalGrade += parseInt(table[student][gra][grade]);
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
    return Correlation.calc(student_attendance, student_grades);
}

function parseResults(table) {
    var i;
    for (i = minT; i <= maxT; i += 0.01) {
        // MARK: PARSE RESULTS ALL
        //console.log(i);
        //console.log(getCorrelation(table, i));
    } 
    parseBeginnerResults(table);
}

function callback(db, table) {
    db.close();
    // console.log(table);
    parseResults(table);
}

MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
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

    quizGrades.find({name: {$in: ['Q10', 'Q11', 'Q12']}}).count(function (err, count) {
        quizGradeCount = count;
        return;
    });

    var currentAttendanceCount = 0;
    var currentGradeCount = 0;


    lectureAttendance.find().forEach(function(attendance_doc) {
        if (!(attendance_doc.email in table)) {
            table[attendance_doc.email] = {}; 
            table[attendance_doc.email][att] = [];
            table[attendance_doc.email][gra] = [];
        }
        table[attendance_doc.email][att].push(attendance_doc.percentage);
        currentAttendanceCount++;
    }, function(err) {
        if(currentGradeCount + currentAttendanceCount === quizGradeCount + attendanceCount) {
            callback(db, table);
        } else if(err) throw err;
    });
    
    quizGrades.find({name: {$in: ['Q10', 'Q11', 'Q12']}}).forEach(function(grade_doc) {
        if (!(grade_doc.email in table)) {
            table[grade_doc.email] = {}; 
            table[grade_doc.email][att] = [];
            table[grade_doc.email][gra] = [];
        }
        table[grade_doc.email][gra].push(grade_doc.score);
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



