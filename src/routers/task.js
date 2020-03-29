const express = require('express')
const router = new express.Router
const auth = require('../middleware/auth')
const Task = require('../models/task')

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send({errorMessage: e.message})
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    const reqKeys = Object.keys(req.body)
    const modelKeys = ['description', 'completed']
    const validKeys = reqKeys.every(key => modelKeys.includes(key))
    
    if (!validKeys){
        return res.status(400).send({errorMessage: 'Invalid object parameter provided.'})
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task){
            return res.status(404).send({errorMessage: 'Task with ID ' + _id + ' does not exist.'})
        }

        reqKeys.forEach(key => task[key] = req.body[key])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send({errorMessage: e.message})
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=0
// GET /tasts?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed.toLowerCase() === 'true'
    }

    if (req.query.sortBy) {
        parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send({errorMessage: e.message})
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task){
            return res.status(404).send({errorMessage: 'Task with ID ' + _id + ' does not exist.'})
        }
        res.send(task)
    } catch (e) {
        res.status(500).send({errorMessage: e.message})
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id})

        if (!task){
            return res.status(404).send({errorMessage: 'Task with ID ' + _id + ' does not exist.'})
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
