const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
require('dotenv').config()
const app = express()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const axios = require('axios')
const line = require('@line/bot-sdk')
const bcrypt = require('bcrypt')
const saltRounds = 10

const jwt = require('jsonwebtoken')
const e = require('express')
const secret = 'linebluezo'

const config = {
  channelAccessToken:
    '2TDhgW9gktEOWPWKcxj+1ir0vcYXezbDQAoI/xpPI+aOvY3CHmGHAwhAu6QoFs2B5eqWtmCaFxG8hFZfs6Upg21BHVPk7+jdNQKR8IngJYLcPhdV+ymxS1jpFt2FIWpnb231ZDo1gm3I9aPnacDqWAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '4da739fa6e17b8a7c7200d27acaa23b0',
}

const client = new line.Client(config)

app.use(cors())

const connection = mysql.createConnection(process.env.DATABASE_URL)

app.get('/', (req, res) => {
  console.log('Hello world')
  res.send('Hello world')
}) //done

app.get('/activity', (req, res) => {
  connection.query('SELECT * FROM activity', function (err, results, fields) {
    res.send(results)
  })
})

app.get('/activitys', (req, res) => {
  connection.query(
    'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty, (SELECT COUNT(*) FROM activity_status WHERE activityID = activity.id) AS countenroll FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty ORDER BY activity.id DESC;',
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      res.send(results)
    }
  )
})

app.get('/activitys/:activityID', (req, res) => {
  let activityID = req.params.activityID
  connection.query(
    'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty, (SELECT COUNT(*) FROM activity_status WHERE activityID = activity.id) AS countenroll FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty WHERE activity.id = ? ORDER BY activity.id DESC;',
    [activityID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      res.send(results)
    }
  )
}) //activitys get just 1

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
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (results.length == 0) {
        res.json({ status: 'ok', message: 'no activitys available' })
        return
      }
      res.send(results)
    }
  )
}) //done

// app.get('/activitysalreadyenroll/:studentID', (req, res) => {
//     let studentID = req.params.studentID
//     connection.query(
//         'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty WHERE activity.id IN(SELECT activity_status.activityID FROM activity_status WHERE activity_status.studentID=?);',
//         [studentID],
//         function(err, results, fields) {
//             if(err) { res.json({status: 'error', message: err}); return }
//             if(results.length == 0) { res.json({status: 'ok', message: 'no activitys enroll'}); return }
//             res.send(results)
//         }
//     )
// }) //done old

app.get('/activitysalreadyenroll/:studentID', (req, res) => {
  let studentID = req.params.studentID
  connection.query(
    'SELECT activityID AS id, teacher.id AS creator, activity.name, activity.detail, activity.createdAt, activity.location, activity.eventDate, activity.timeStart, activity.timeEnd, activity.hoursToReceive, activity.image, activity.year, activity.semester, activity.max,' +
      'teacher.fname AS teacherfname,' +
      'teacher.lname AS teacherlname,' +
      'faculty.name AS faculty,' +
      'status, timeEnroll, timeJoin, studentID' +
      ' FROM activity_status' +
      ' JOIN activity ON activityID = activity.id' +
      ' JOIN teacher ON creator = teacher.id' +
      ' JOIN faculty ON faculty.id = teacher.faculty' +
      ' WHERE studentID = ?;',
    [studentID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (results.length == 0) {
        res.json({ status: 'ok', message: 'no activitys enroll' })
        return
      }
      res.send(results)
    }
  )
}) //done old

app.get('/teachercreated/:teacherID', (req, res) => {
  let teacherID = req.params.teacherID
  connection.query(
    'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty WHERE activity.creator = ?;',
    [teacherID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (results.length == 0) {
        res.json({ status: 'ok', message: 'no activitys created' })
        return
      }
      res.send(results)
    }
  )
}) //teacher created

app.get('/teacheredit/:activityID', (req, res) => {
  let activityID = req.params.activityID
  connection.query(
    'SELECT activity.id,activity.creator,activity.name,activity.detail,activity.createdAt,activity.location,activity.eventDate,activity.timeStart,activity.timeEnd,activity.hoursToReceive,activity.image,activity.year,activity.semester,activity.max,teacher.fname AS teacherfname,teacher.lname AS teacherlname,faculty.name AS faculty FROM `activity` JOIN teacher ON creator = teacher.id JOIN faculty ON faculty.id = teacher.faculty WHERE activity.id = ?;',
    [activityID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (results.length == 0) {
        res.json({ status: 'ok', message: 'no activitys created' })
        return
      }
      res.send(results)
    }
  )
}) //teacher edit

app.get('/studentgetconnectcheck/:lineID', jsonParser, (req, res) => {
  let lineID = req.params.lineID
  connection.query(
    'SELECT student_connect.lineID, student_connect.studentID, student.fname, student.lname, faculty.name AS faculty FROM student_connect JOIN student ON studentID = student.id JOIN faculty ON faculty.id = student.faculty WHERE lineID=?;',
    [lineID],
    function (err, results, fields) {
      res.send(results)
    }
  )
}) //done likely studentdisconnectcheck

app.post('/studentdisconnectcheck', jsonParser, (req, res) => {
  let lineID = req.body.lineID
  connection.query(
    'SELECT student_connect.lineID, student_connect.studentID, student.fname, student.lname, faculty.name AS faculty FROM student_connect JOIN student ON studentID = student.id JOIN faculty ON faculty.id = student.faculty WHERE lineID=?;',
    [lineID],
    function (err, line, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (line.length == 0) {
        res.json({ status: 'ok', message: 'not yet connected' })
        return
      }
      res.json({ status: 'ok', message: 'already connected', line })
      //res.send(line)
    }
  )
}) //done

app.post('/teacherdisconnectcheck', jsonParser, (req, res) => {
  let lineID = req.body.lineID
  connection.query(
    'SELECT teacher_connect.lineID, teacher_connect.teacherID, teacher.fname, teacher.lname, faculty.name AS faculty FROM teacher_connect JOIN teacher ON teacherID = teacher.id JOIN faculty ON faculty.id = teacher.faculty WHERE lineID=?;',
    [lineID],
    function (err, line, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (line.length == 0) {
        res.json({ status: 'ok', message: 'not yet connected' })
        return
      }
      res.json({ status: 'ok', message: 'already connected', line })
      //res.send(line)
    }
  )
}) //done teacher

app.post('/studentconnectcheck', jsonParser, (req, res) => {
  let lineID = req.body.lineID
  connection.query('SELECT * FROM student_connect WHERE lineID = ?;', [lineID], function (err, line, fields) {
    if (err) {
      res.json({ status: 'error', message: err })
      return
    }
    if (line.length == 0) {
      res.json({ status: 'ok', message: 'not yet connected' })
      return
    }
    res.json({ status: 'ok', message: 'already connected' })
  })
}) //done

app.post('/teacherconnectcheck', jsonParser, (req, res) => {
  let lineID = req.body.lineID
  connection.query('SELECT * FROM teacher_connect WHERE lineID = ?;', [lineID], function (err, line, fields) {
    if (err) {
      res.json({ status: 'error', message: err })
      return
    }
    if (line.length == 0) {
      res.json({ status: 'ok', message: 'not yet connected' })
      return
    }
    res.json({ status: 'ok', message: 'already connected' })
  })
}) //done teacher

app.post('/lineinsert', jsonParser, (req, res) => {
  let studentID = req.body.studentID
  let lineID = req.body.lineID
  connection.query(
    'INSERT INTO student_connect (lineID, studentID) VALUES (?, ?);',
    //INSERT INTO `student_connect` (`lineID`, `studentID`) VALUES ('test', '6300196');
    [lineID, studentID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      res.json({ status: 'ok', message: 'insert complete' })
    }
  )
}) //

app.post('/teacherlineinsert', jsonParser, (req, res) => {
  let teacherID = req.body.teacherID
  let lineID = req.body.lineID
  connection.query('INSERT INTO teacher_connect (lineID, teacherID) VALUES (?, ?);', [lineID, teacherID], function (err, results, fields) {
    if (err) {
      res.json({ status: 'error', message: err })
      return
    }
    res.json({ status: 'ok', message: 'insert complete' })
  })
}) //teacher

app.put('/lineupdate', jsonParser, (req, res) => {
  let studentID = req.body.studentID
  let lineID = req.body.lineID
  connection.query('UPDATE student_connect SET studentID=? WHERE lineID=?;', [studentID, lineID], function (err, results, fields) {
    if (err) {
      res.json({ status: 'error', message: err })
      return
    }
    if (results.affectedRows === 0) {
      res.json({ status: 'error', message: 'no lineID found' })
      return
    }
    res.json({ status: 'ok', message: 'update complete' })
  })
}) //

app.put('/teacherlineupdate', jsonParser, (req, res) => {
  let teacherID = req.body.teacherID
  let lineID = req.body.lineID
  connection.query('UPDATE teacher_connect SET teacherID=? WHERE lineID=?;', [teacherID, lineID], function (err, results, fields) {
    if (err) {
      res.json({ status: 'error', message: err })
      return
    }
    if (results.affectedRows === 0) {
      res.json({ status: 'error', message: 'no lineID found' })
      return
    }
    res.json({ status: 'ok', message: 'update complete' })
  })
}) //teacher

app.post('/login', jsonParser, (req, res) => {
  let studentID = req.body.studentID
  let studentPassword = req.body.studentPassword
  studentPassword = bcrypt.hashSync(studentPassword, saltRounds)
  let lineID = req.body.lineID
  connection.query(
    //'SELECT * FROM student WHERE student.id = ? AND student.pass = ?;',
    'SELECT student.id, student.fname, student.lname, student.pass, faculty.name AS faculty FROM student JOIN faculty ON faculty.id = student.faculty WHERE student.id = ? AND student.pass = ?;',
    [studentID, studentPassword],
    function (err, student, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (student.length == 0) {
        res.json({ status: 'error', message: 'connected failed', student })
        return
      }
      client.linkRichMenuToUser(lineID, 'richmenu-7d6845b74c3ab4ee9930f9e626af79f3')
      res.json({ status: 'ok', message: 'connected successfully', student })
    }
  )
}) //done

app.post('/teacherlogin', jsonParser, (req, res) => {
  let teacherID = req.body.teacherID
  let teacherPassword = req.body.teacherPassword
  teacherPassword = bcrypt.hashSync(teacherPassword, saltRounds)
  let lineID = req.body.lineID
  connection.query(
    'SELECT teacher.id, teacher.fname, teacher.lname, teacher.pass, faculty.name AS faculty FROM teacher JOIN faculty ON faculty.id = teacher.faculty WHERE teacher.id = ? AND teacher.pass = ?;',
    [teacherID, teacherPassword],
    function (err, teacher, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (teacher.length == 0) {
        res.json({ status: 'error', message: 'connected failed', teacher })
        return
      }
      client.linkRichMenuToUser(lineID, 'richmenu-dbc3db4798a5c797d2607651a74aa2ea')
      res.json({ status: 'ok', message: 'connected successfully', teacher })
    }
  )
}) //done teacher

app.post('/activityenroll', jsonParser, (req, res) => {
  let activityID = req.body.activityID
  let studentID = req.body.studentID
  connection.query(
    'INSERT INTO activity_status (activityID, studentID, status, timeEnroll, timeJoin) VALUES (?, ?, 0, current_timestamp(), NULL);',
    [activityID, studentID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      res.json({ status: 'ok', message: 'activity enroll successfully' })
    }
  )
}) //done

app.get('/whoenroll/:activityID', (req, res) => {
  let activityID = req.params.activityID
  connection.query(
    'SELECT activityID, studentID, student.fname, student.lname, faculty.name AS faculty, status FROM activity_status JOIN student ON studentID = student.id JOIN faculty ON faculty.id = student.faculty WHERE activityID = ?;',
    [activityID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (results.length == 0) {
        res.json({ status: 'ok', message: 'no one enroll' })
        return
      }
      res.send(results)
    }
  )
}) //done

app.post('/creatactivity', jsonParser, (req, res) => {
  let activityID = req.body.activityID
  let studentID = req.body.studentID
  connection.query(
    'INSERT INTO activity_status (activityID, studentID, status, timeEnroll, timeJoin) VALUES (?, ?, 0, current_timestamp(), NULL);',
    [activityID, studentID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      res.json({ status: 'ok', message: 'activity enroll successfully' })
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
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      res.json({ status: 'ok', message: 'activity enroll successfully' })
    }
  )
}) //done create teacher

app.get('/countenroll/:activityID', (req, res) => {
  let activityID = req.params.activityID
  connection.query('SELECT COUNT(*) FROM activity_status WHERE activityID = ?;', [activityID], function (err, results, fields) {
    res.send(results)
  })
}) //count enroll per activity

app.put('/setactivitystatustrue', jsonParser, (req, res) => {
  let activityID = req.body.activityID
  let studentID = req.body.studentID
  connection.query(
    'UPDATE activity_status SET status = 1, timeJoin = current_timestamp() WHERE activityID = ? AND studentID = ?;',
    [activityID, studentID],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (results.affectedRows === 0) {
        res.json({ status: 'error', message: 'affected Rows is 0' })
        return
      }
      res.json({ status: 'ok', message: 'update activity true complete' })
    }
  )
}) // set activity_status = 1

app.post('/adminlogin', jsonParser, (req, res) => {
  let user = req.body.user
  let pass = req.body.pass
  connection.query('SELECT * FROM admin WHERE user = ?;', [user], function (err, result, fields) {
    if (err) {
      res.json({ status: 'error', message: err })
      return
    }
    if (result.length == 0) {
      res.json({ status: 'error', message: 'login failed', result })
      return
    }
    bcrypt.compare(pass, result[0].pass, function (err, isLogin) {
      if (isLogin) {
        let token = jwt.sign({ user: result[0].user }, secret, { expiresIn: '1h' })
        res.json({ status: 'ok', message: 'login successfully', result, token })
      } else {
        res.json({ status: 'error', message: 'login failed', result })
      }
    })
  })
}) //done admin login

app.post('/authen', jsonParser, (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    let decoded = jwt.verify(token, secret)
    res.json({ status: 'ok', decoded })
  } catch (err) {
    res.json({ status: 'error', message: err.message })
  }
}) //done jwt authen

app.put('/editactivity', jsonParser, (req, res) => {
  let name = req.body.name
  let detail = req.body.detail
  let location = req.body.location
  let eventDate = req.body.eventDate
  let timeStart = req.body.timeStart
  let timeEnd = req.body.timeEnd
  let hoursToReceive = req.body.hoursToReceive
  let image = req.body.image
  let max = req.body.max
  let id = req.body.id
  connection.query(
    'UPDATE activity SET name = ?, detail = ?, location = ?, eventDate = ?, timeStart = ?, timeEnd = ?, hoursToReceive = ?, image = ?, max = ? WHERE activity.id = ?;',
    [name, detail, location, eventDate, timeStart, timeEnd, hoursToReceive, image, max, id],
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      if (results.affectedRows === 0) {
        res.json({ status: 'error', message: 'affected Rows is 0' })
        return
      }
      res.json({ status: 'ok', message: 'update activity complete' })
    }
  )
}) //

app.get('/teachers', (req, res) => {
  connection.query(
    'SELECT teacher.id,teacher.fname,teacher.lname,faculty.name AS faculty, (SELECT COUNT(*) FROM activity WHERE creator = teacher.id) AS countactivity FROM `teacher` JOIN faculty ON faculty.id = teacher.faculty;',
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      res.send(results)
    }
  )
}) // teacher list

app.get('/students', (req, res) => {
  connection.query(
    'SELECT student.id,student.fname,student.lname,faculty.name AS faculty, (SELECT SUM(activity.hoursToReceive) FROM activity WHERE activity.id IN(SELECT activity_status.activityID FROM activity_status WHERE activity_status.studentID = student.id AND activity_status.status = 1)) AS sumhours FROM student JOIN faculty ON faculty.id = student.faculty;',
    function (err, results, fields) {
      if (err) {
        res.json({ status: 'error', message: err })
        return
      }
      res.send(results)
    }
  )
}) // student list

app.get('/studenthour/:studentID', (req, res) => {
  let studentID = req.params.studentID
  connection.query(
    'SELECT student.id,student.fname,student.lname,faculty.name AS faculty, (SELECT SUM(activity.hoursToReceive) FROM activity WHERE activity.id IN(SELECT activity_status.activityID FROM activity_status WHERE activity_status.studentID = student.id AND activity_status.status = 1)) AS sumhours FROM student JOIN faculty ON faculty.id = student.faculty WHERE student.id = ?;',
    [studentID],
    function (err, results, fields) {
      res.send(results)
    }
  )
}) // a student and hours

app.get('/datas', (req, res) => {
  connection.query('SELECT * FROM faculty', function (err, results, fields) {
    res.send(results)
  })
})

app.get('/getlineid/:studentID', jsonParser, (req, res) => {
  let studentID = req.params.studentID
  connection.query('SELECT lineID, studentID FROM student_connect WHERE studentID=?;', [studentID], function (err, results, fields) {
    res.send(results)
    console.log(results)
  })
}) //done getlineid

app.post('/linecompleted', jsonParser, (req, res) => {
  let name = req.body.name
  let hoursToReceive = req.body.hoursToReceive
  let userId = req.body.userId

  const lineAPIEndpoint = 'https://api.line.me/v2/bot/message/push'

  const message = {
    to: userId + '',
    messages: [
      {
        type: 'flex',
        altText: 'ยืนยันการทำกิจกรรม',
        contents: {
          type: 'bubble',
          hero: {
            type: 'image',
            url: 'https://i.ytimg.com/vi/aIk2AWuZWiE/oar2.jpg?sqp=-oaymwEYCJUDENAFSFqQAgHyq4qpAwcIARUAAIhC&rs=AOn4CLATvc9XPfL2gtJ9CVmYRjMR0qeiUQ',
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'cover',
            action: {
              type: 'uri',
              label: 'Line',
              uri: 'https://linecorp.com/',
            },
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'ยืนยันการทำกิจกรรม',
                weight: 'bold',
                size: 'lg',
                contents: [],
              },
              {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                margin: 'lg',
                contents: [
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: name + '',
                        size: 'sm',
                        color: '#666666',
                        flex: 5,
                        wrap: true,
                        contents: [],
                      },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    backgroundColor: '#FFFFFFFF',
                    contents: [
                      {
                        type: 'text',
                        text: 'ชั่วโมงที่ได้รับ',
                        size: 'sm',
                        color: '#AAAAAA',
                        flex: 2,
                        wrap: true,
                        contents: [],
                      },
                      {
                        type: 'text',
                        text: hoursToReceive + ' ชั่วโมง',
                        size: 'sm',
                        color: '#666666',
                        flex: 4,
                        wrap: true,
                        contents: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            flex: 0,
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: 'ดูกิจกรรมที่ทำ',
                  uri: 'https://liff.line.me/1657670230-K8J8zq7n',
                },
                color: '#1DE9B6FF',
                height: 'sm',
                style: 'primary',
              },
              {
                type: 'spacer',
                size: 'sm',
              },
            ],
          },
        },
      },
    ],
  }

  axios
    .post(lineAPIEndpoint, message, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.channelAccessToken}`,
      },
    })
    .then((response) => {
      res.json({ status: 'ok', message: 'sent complete' })
    })
    .catch((error) => {
      console.error(error)
      res.json({ status: 'error', message: error })
    })
})

app.post('/lineenroll', jsonParser, (req, res) => {
  let name = req.body.name
  let eventDate = req.body.eventDate
  eventDate = eventDate.substring(0, 10)
  let timeStart = req.body.timeStart
  let timeEnd = req.body.timeEnd
  let location = req.body.location
  let userId = req.body.userId

  const lineAPIEndpoint = 'https://api.line.me/v2/bot/message/push'

  const message = {
    to: userId + '',
    messages: [
      {
        type: 'flex',
        altText: 'ลงทะเบียนสำเร็จ',
        contents: {
          type: 'bubble',
          hero: {
            type: 'image',
            url: 'https://dotesports.com/wp-content/uploads/2023/02/13000033/Gawr-Gura-Returns-to-YouTube-Streaming.png?w=1200',
            size: 'full',
            aspectRatio: '20:13',
            aspectMode: 'cover',
            action: {
              type: 'uri',
              label: 'Line',
              uri: 'https://linecorp.com/',
            },
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'ลงทะเบียนสำเร็จ',
                weight: 'bold',
                size: 'lg',
                contents: [],
              },
              {
                type: 'box',
                layout: 'vertical',
                spacing: 'sm',
                margin: 'lg',
                contents: [
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: name + '',
                        size: 'sm',
                        color: '#666666',
                        flex: 5,
                        wrap: true,
                        contents: [],
                      },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: 'Date',
                        size: 'sm',
                        color: '#AAAAAA',
                        flex: 1,
                        contents: [],
                      },
                      {
                        type: 'text',
                        text: eventDate + '',
                        size: 'sm',
                        color: '#666666',
                        flex: 5,
                        wrap: true,
                        contents: [],
                      },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: 'Time',
                        size: 'sm',
                        color: '#AAAAAA',
                        flex: 1,
                        contents: [],
                      },
                      {
                        type: 'text',
                        text: timeStart + ' - ' + timeEnd,
                        size: 'sm',
                        color: '#666666',
                        flex: 5,
                        wrap: true,
                        contents: [],
                      },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'baseline',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'text',
                        text: 'Place',
                        size: 'sm',
                        color: '#AAAAAA',
                        flex: 1,
                        contents: [],
                      },
                      {
                        type: 'text',
                        text: location + '',
                        size: 'sm',
                        color: '#666666',
                        flex: 5,
                        wrap: true,
                        contents: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            flex: 0,
            spacing: 'sm',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: 'กิจกรรมที่ลงทะเบียน',
                  uri: 'https://liff.line.me/1657670230-Mp0gNae5',
                },
                color: '#1DE9B6FF',
                height: 'sm',
                style: 'primary',
              },
            ],
          },
        },
      },
    ],
  }

  axios
    .post(lineAPIEndpoint, message, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.channelAccessToken}`,
      },
    })
    .then((response) => {
      res.json({ status: 'ok', message: 'sent complete' })
    })
    .catch((error) => {
      console.error(error)
      res.json({ status: 'error', message: error })
    })
})

app.get('/unlink-richmenu/:lineID', jsonParser, (req, res) => {
  let lineID = req.params.lineID
  client.unlinkRichMenuFromUser(lineID)
  res.json({ status: 'ok', message: 'unlinkRichMenuFromUser complete' })
})

app.get('/hash/:pass', jsonParser, (req, res) => {
  let pass = req.params.pass
  pass = bcrypt.hashSync(pass, saltRounds)
  res.json({ status: 'ok', message: pass })
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
//UPDATE activity_status SET status = 1, timeJoin = 'Frankfurt' WHERE CustomerID = 1;
