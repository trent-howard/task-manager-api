const { MongoClient, ObjectId } = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

// const id = new ObjectId()
// console.log(id, id.toHexString(), id.toHexString().length)
// console.log(id.id, id.id.length)
// console.log(id.getTimestamp(), id.generationTime)

MongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
        return console.log('Cannot connect to database.')
    }
    
    const db = client.db(databaseName)

    db.collection('tasks').deleteOne({
        description: 'Eat dinner'
    }).then(result => {
        console.log(result)
    }).catch(error => {
        console.log(error)
    })

})