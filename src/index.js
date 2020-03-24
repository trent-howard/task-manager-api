const express = require('express')
require('./db/mongoose')
const user = require('./routers/user')
const task = require('./routers/task')
const port = process.env.PORT
const app = express()

app.use(express.json())
app.use(user)
app.use(task)

app.listen(port, () => {
    console.log('Server up on port ' + port)
})


