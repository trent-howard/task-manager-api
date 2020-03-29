const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create new user', async () => {
    const response = await request(app).post('/users').send({
        name: "Shorters P Cat",
        email: "shortie@cats.com",
        password: "meowMEOW"
    }).expect(201)

    // assert the record is created in the database
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // assert the response body contains the user data
    expect(response.body).toMatchObject({
        user: {
            name: "Shorters P Cat",
            email: "shortie@cats.com"
        },
        token: user.tokens[0].token
    })
})

test('Should log in existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    // validate new token persists in database
    const user = await User.findById(userOne._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not log in nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'baduser@invalid.com',
        password: 'abcd1234'
    }).expect(401)
})

test('Should get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    // assert recorde deleted in database
    const user = await User.findById(userOne._id)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar imaage', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', './tests/fixtures/profile-pic.jpg')
        .expect(200)

    const user = await User.findById(userOne._id)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'New Name',
            age: 7,
            email: 'test@example.com',
            password: 'newpass1234'
        })
        .expect(200)
    // check new values are persistant in database
    const user = await User.findById(userOne._id)
    expect(user).not.toEqual(response.user)
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ location: 'Melbourne' })
        .expect(400)
})