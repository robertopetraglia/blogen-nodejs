const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()

router.get('/login', (req, res) => {
    res.render('login', {
        pageTitle: 'Login | Blogen'
    })
})

router.post('/user/auth', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        await user.generateAuthToken()    
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