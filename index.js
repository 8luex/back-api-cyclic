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

app.get('/studentgetconnectcheck/:lineID', jsonParser, (req, res) => {
    let lineID = req.params.lineID
    connection.query(
        'SELECT student_connect.lineID, student_connect.studentID, student.fname, student.lname, faculty.name AS faculty FROM student_connect JOIN student ON studentID = student.id JOIN faculty ON faculty.id = student.faculty WHERE lineID=?;',
        [lineID],
        function(err, results, fields) {
            res.send(results)
        }
    )
}) //done

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