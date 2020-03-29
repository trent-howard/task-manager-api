const express = require('express')
require('./db/mongoose')
const user = require('./routers/user')
const task = require('./routers/task')
const app = express()

app.use(express.json())
app.use(user)
app.use(task)

module.exports = app