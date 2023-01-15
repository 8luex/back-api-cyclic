const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')
require('dotenv').config()
const app = express()

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