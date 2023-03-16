const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
require('dotenv').config()
const app = express()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

app.use(cors())

const connection = mysql.createConnection(process.env.DATABASE_URL)

app.get('/', (req, res) => {
    console.log('Hello world')
    res.send('Hello world')
}) //done

app.get('/activity', (req, res) => {
    connection.query(
        'SELECT * FROM activity',
        function(err, results, fields) {
            res.send(results)
        }
    )
})

app.get('/activitys', (req, res) => {
    connection.query(
        'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty;',
        function(err, results, fields) {
            res.send(results)
        }
    )
})

// app.get('/activitysavailable/:studentID', (req, res) => {
//     let studentID = req.params.studentID
//     connection.query(
//         'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty WHERE activity.id NOT IN(SELECT activity_status.activityID FROM activity_status WHERE activity_status.studentID=?);',
//         [studentID],
//         function(err, results, fields) {
//             if(err) { res.json({status: 'error', message: err}); return }
//             if(results.length == 0) { res.json({status: 'ok', message: 'no activitys available'}); return }
//             res.send(results)
//         }
//     )
// })

app.get('/activitysavailable/:studentID', (req, res) => {
    let studentID = req.params.studentID
    connection.query(
        'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty,(SELECT COUNT(*) FROM activity_status WHERE activityID = activity.id ) AS countenroll FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty WHERE activity.id NOT IN(SELECT activity_status.activityID FROM activity_status WHERE activity_status.studentID=?);',
        [studentID],
        function(err, results, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(results.length == 0) { res.json({status: 'ok', message: 'no activitys available'}); return }
            res.send(results)
        }
    )
}) //done

app.get('/activitysalreadyenroll/:studentID', (req, res) => {
    let studentID = req.params.studentID
    connection.query(
        'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty WHERE activity.id IN(SELECT activity_status.activityID FROM activity_status WHERE activity_status.studentID=?);',
        [studentID],
        function(err, results, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(results.length == 0) { res.json({status: 'ok', message: 'no activitys enroll'}); return }
            res.send(results)
        }
    )
}) //process

app.get('/studentgetconnectcheck/:lineID', jsonParser, (req, res) => {
    let lineID = req.params.lineID
    connection.query(
        'SELECT student_connect.lineID, student_connect.studentID, student.fname, student.lname, faculty.name AS faculty FROM student_connect JOIN student ON studentID = student.id JOIN faculty ON faculty.id = student.faculty WHERE lineID=?;',
        [lineID],
        function(err, results, fields) {
            res.send(results)
        }
    )
}) //done likely studentdisconnectcheck

app.post('/studentdisconnectcheck', jsonParser, (req, res) => {
    let lineID = req.body.lineID
    connection.query(
        'SELECT student_connect.lineID, student_connect.studentID, student.fname, student.lname, faculty.name AS faculty FROM student_connect JOIN student ON studentID = student.id JOIN faculty ON faculty.id = student.faculty WHERE lineID=?;',
        [lineID],
        function(err, line, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(line.length == 0) { res.json({status: 'ok', message: 'not yet connected'}); return }
            res.json({status: 'ok', message: 'already connected', line})
            //res.send(line)
        }
    )
}) //done

app.post('/teacherdisconnectcheck', jsonParser, (req, res) => {
    let lineID = req.body.lineID
    connection.query(
        'SELECT teacher_connect.lineID, teacher_connect.teacherID, teacher.fname, teacher.lname, faculty.name AS faculty FROM teacher_connect JOIN teacher ON teacherID = teacher.id JOIN faculty ON faculty.id = teacher.faculty WHERE lineID=?;',
        [lineID],
        function(err, line, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(line.length == 0) { res.json({status: 'ok', message: 'not yet connected'}); return }
            res.json({status: 'ok', message: 'already connected', line})
            //res.send(line)
        }
    )
}) //done teacher

app.post('/studentconnectcheck', jsonParser, (req, res) => {
    let lineID = req.body.lineID
    connection.query(
        'SELECT * FROM student_connect WHERE lineID = ?;',
        [lineID],
        function(err, line, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(line.length == 0) { res.json({status: 'ok', message: 'not yet connected'}); return }
            res.json({status: 'ok', message: 'already connected'})
        }
    )
}) //done

app.post('/teacherconnectcheck', jsonParser, (req, res) => {
    let lineID = req.body.lineID
    connection.query(
        'SELECT * FROM teacher_connect WHERE lineID = ?;',
        [lineID],
        function(err, line, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(line.length == 0) { res.json({status: 'ok', message: 'not yet connected'}); return }
            res.json({status: 'ok', message: 'already connected'})
        }
    )
}) //done teacher

app.post('/lineinsert', jsonParser, (req, res) => {
    let studentID = req.body.studentID
    let lineID = req.body.lineID
    connection.query(
        'INSERT INTO student_connect (lineID, studentID) VALUES (?, ?);',
        //INSERT INTO `student_connect` (`lineID`, `studentID`) VALUES ('test', '6300196');
        [lineID, studentID],
        function(err, results, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            res.json({status: 'ok', message: 'insert complete'})
        }
    )
}) //

app.post('/teacherlineinsert', jsonParser, (req, res) => {
    let teacherID = req.body.teacherID
    let lineID = req.body.lineID
    connection.query(
        'INSERT INTO teacher_connect (lineID, teacherID) VALUES (?, ?);',
        [lineID, teacherID],
        function(err, results, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            res.json({status: 'ok', message: 'insert complete'})
        }
    )
}) //teacher

app.put('/lineupdate', jsonParser, (req, res) => {
    let studentID = req.body.studentID
    let lineID = req.body.lineID
    connection.query(
        'UPDATE student_connect SET studentID=? WHERE lineID=?;',
        [studentID, lineID],
        function(err, results, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(results.affectedRows === 0) { res.json({status: 'error', message: 'no lineID found'}); return }
            res.json({status: 'ok', message: 'update complete'})
        }
    )
}) //

app.put('/teacherlineupdate', jsonParser, (req, res) => {
    let teacherID = req.body.teacherID
    let lineID = req.body.lineID
    connection.query(
        'UPDATE teacher_connect SET teacherID=? WHERE lineID=?;',
        [studentID, lineID],
        function(err, results, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(results.affectedRows === 0) { res.json({status: 'error', message: 'no lineID found'}); return }
            res.json({status: 'ok', message: 'update complete'})
        }
    )
}) //teacher

app.post('/login', jsonParser, (req, res) => {
    let studentID = req.body.studentID
    let studentPassword = req.body.studentPassword
    let lineID = req.body.lineID
    connection.query(
        //'SELECT * FROM student WHERE student.id = ? AND student.pass = ?;',
        'SELECT student.id, student.fname, student.lname, student.pass, faculty.name AS faculty FROM student JOIN faculty ON faculty.id = student.faculty WHERE student.id = ? AND student.pass = ?;',
        [studentID, studentPassword],
        function(err, student, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(student.length == 0) { res.json({status: 'error', message: 'connected failed', student}); return }
            res.json({status: 'ok', message: 'connected successfully', student})
        }
    )
}) //done

app.post('/teacherlogin', jsonParser, (req, res) => {
    let teacherID = req.body.teacherID
    let teacherPassword = req.body.teacherPassword
    connection.query(
        'SELECT teacher.id, teacher.fname, teacher.lname, teacher.pass, faculty.name AS faculty FROM teacher JOIN faculty ON faculty.id = teacher.faculty WHERE teacher.id = ? AND teacher.pass = ?;',
        [teacherID, teacherPassword],
        function(err, teacher, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            if(teacher.length == 0) { res.json({status: 'error', message: 'connected failed', teacher}); return }
            res.json({status: 'ok', message: 'connected successfully', teacher})
        }
    )
}) //done teacher

app.post('/activityenroll', jsonParser, (req, res) => {
    let activityID = req.body.activityID
    let studentID = req.body.studentID
    connection.query(
        'INSERT INTO activity_status (activityID, studentID, status, timeEnroll, timeJoin) VALUES (?, ?, 0, current_timestamp(), NULL);',
        [activityID, studentID],
        function(err, results, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            res.json({status: 'ok', message: 'activity enroll successfully'})
        }
    )
}) //done

app.post('/creatactivity', jsonParser, (req, res) => {
    let activityID = req.body.activityID
    let studentID = req.body.studentID
    connection.query(
        'INSERT INTO activity_status (activityID, studentID, status, timeEnroll, timeJoin) VALUES (?, ?, 0, current_timestamp(), NULL);',
        [activityID, studentID],
        function(err, results, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            res.json({status: 'ok', message: 'activity enroll successfully'})
        }
    )
}) //processing

app.post('/activitycreate', jsonParser, (req, res) => {
    let creator = req.body.creator
    let name = req.body.name
    let detail = req.body.detail
    let location = req.body.location
    let eventDate = req.body.eventDate
    let timeStart = req.body.timeStart
    let timeEnd = req.body.timeEnd
    let hoursToReceive = req.body.hoursToReceive
    let image = req.body.image
    let year = req.body.year
    let semester = req.body.semester
    let max = req.body.max
    connection.query(
        'INSERT INTO activity (creator, name, detail, createdAt, location, eventDate, timeStart, timeEnd, hoursToReceive, image, year, semester, max) VALUES (?, ?, ?, current_timestamp(), ?, ?, ?, ?, ?, ?, ?, ?, ?);',
        [creator, name, detail, location, eventDate, timeStart, timeEnd, hoursToReceive, image, year, semester, max],
        function(err, results, fields) {
            if(err) { res.json({status: 'error', message: err}); return }
            res.json({status: 'ok', message: 'activity enroll successfully'})
        }
    )
}) //done create teacher

app.get('/countenroll/:activityID', (req, res) => {
    let activityID = req.params.activityID
    connection.query(
        'SELECT COUNT(*) FROM activity_status WHERE activityID = ?;',
        [activityID],
        function(err, results, fields) {
            res.send(results)
        }
    )
}) //count enroll per activity

app.get('/datas', (req, res) => {
    connection.query(
        'SELECT * FROM faculty',
        function(err, results, fields) {
            res.send(results)
        }
    )
})

app.listen(process.env.PORT || 3000)
//connection.end()



//UPDATE student_connect SET `lineID` = "ty" WHERE studentID = 6300196;
//SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty,activity_status.studentID AS studentID
//FROM `activity` 
//JOIN teacher ON creator = teacher.id 
//JOIN faculty ON faculty.id = teacher.faculty
//JOIN activity_status ON activity.id = activity_status.activityID
//WHERE activity_status.studentID = 6300195

//INSERT INTO activity_status (activityID, studentID, status, timeEnroll, timeJoin) VALUES ('', '', 0, current_timestamp(), NULL)