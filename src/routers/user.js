const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendAccountCloseEmail } = require('../emails/account')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = new express.Router

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send({errorMessage: e.message})
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(401).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const reqKeys =  Object.keys(req.body)
    const modelKeys = ['name', 'age', 'email', 'password']
    const validKeys = reqKeys.every(key => modelKeys.includes(key))
    
    if (!validKeys){
        return res.status(400).send({errorMessage: 'Invalid object parameter provided.'})
    }

    try {
        reqKeys.forEach(key => req.user[key] = req.body[key])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send({errorMessage: e.message})
    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {
        await req.user.remove()
        sendAccountCloseEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send({errorMessage: e.message})
    }
})

router.get('/users', auth, async (req, res) => {
        try {
            const users = await User.find({})
            res.send(users)
        } catch (e) {
            res.status(500).send({errorMessage: e.message})
        }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)
        if (!user){
            return res.status(404).send({errorMessage: 'User with ID ' + _id + ' does not exist.'})
        }
        res.send(user)
    } catch (e) {
        res.status(500).send({errorMessage: e.message})
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpge|png)$/)) {
            return cb(new Error('Filetype not supported. Supported types: jpg, jpeg, png'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router
