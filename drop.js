/**
 * Finding any kind of significance between class attendance and 
 * other class metric
 * - currently using mainly spearman-rho correlation
 */

// https://github.com/motdotla/dotenv
require('dotenv').config();

// https://github.com/mongodb/node-mongodb-native
var MongoClient = require('mongodb').MongoClient;
function extractFeatureCallBack(table) {
}

function extractFeature() { 
    MongoClient.connect(DB_URI, {useNewUrlParser: true}, function(err, db) {
        if (err) throw err;
        // connection is made
        var active_students_table = {}; 
        var passive_students_table = {}; 
   

        const root_db = db.db('cs125');
        // MARK: COLLECTIONS
        var lectureAttendance = root_db.collection('lectureAttendance');
        // MARK: COUNT
        var attendanceCount = 0;
        lectureAttendance.find().count(function (err, count) {
            attendanceCount = count;
            return;
        });
        // MARK: QUERY
        var currentAttendanceCount = 0;
        lectureAttendance.find().forEach(function(attendance_doc) {
            if (!(attendance_doc.email in table)) {
                if(attendance_doc.emali
                table[attendance_doc.email] = {}; 
                table[attendance_doc.email][att] = [];
                table[attendance_doc.email][gra] = [0, 0, 0, 0];
            }
            table[attendance_doc.email][att].push(attendance_doc.percentage);
            currentAttendanceCount++;
        }, function(err) {
            if(currentAttendanceCount === attendanceCount) {
                extractFeatureCallback(table);
            } else if(err) throw err;
        });
}


