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
})

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

app.get('/studentconnect', (req, res) => {
    connection.query(
        'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty;',
        function(err, results, fields) {
            res.send(results)
        }
    )
})

app.post('/connect', jsonParser, (req, res) => {
    var studentID = req.body.studentID
    var studentPassword = req.body.studentPassword
    var lineID = req.body.lineID
    connection.query(
        'INSERT INTO `student_connect` (`studentID`, `lineID`) VALUES (?, ?);',
        [studentID, lineID],
        function(err, results, fields) {
            if(err) {
                res.json({status: 'error', message: err})
                return
            }
            res.json({status: 'ok'})
        }
    )
})

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