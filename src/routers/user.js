const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/login', (req, res) => {
    res.render('login', {
        pageTitle: 'Login | Blogen'
    })
})

router.post('/user/create', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        
        const token = await user.generateAuthToken()
        console.log({ user, token })
        
        res.redirect('/user/dashboard')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/login')
    }
})

router.post('/user/auth', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = user.generateAuthToken()
        console.log({user, token})
        res.redirect('/user/dashboard')
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/login')
    }
})

router.get('/user/dashboard', auth, (req, res) => {
    res.render('dashboard')
})

module.exports = router